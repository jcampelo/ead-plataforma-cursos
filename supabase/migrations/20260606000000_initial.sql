-- Perfis de usuário (estende auth.users) — vem antes da função is_admin
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  is_admin boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Função helper: checa admin sem recursão de RLS (security definer bypassa RLS)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

create policy "Usuário lê próprio perfil" on public.profiles
  for select using (auth.uid() = id);
create policy "Admin lê todos" on public.profiles
  for select using (public.is_admin(auth.uid()));

-- Trigger: criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cursos
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descricao text not null,
  preco numeric(10,2) not null,
  carga_horaria int not null default 0,
  thumbnail_url text,
  publicado boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table public.courses enable row level security;
create policy "Todos veem cursos publicados" on public.courses
  for select using (publicado = true);
create policy "Admin gerencia cursos" on public.courses
  for all using (public.is_admin(auth.uid()));

-- Módulos
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses on delete cascade not null,
  titulo text not null,
  ordem int not null default 0
);
alter table public.modules enable row level security;
create policy "Todos veem módulos de cursos publicados" on public.modules
  for select using (
    exists (select 1 from public.courses where id = course_id and publicado = true)
  );
create policy "Admin gerencia módulos" on public.modules
  for all using (public.is_admin(auth.uid()));

-- Matrículas (antes de lessons: a policy de lessons referencia enrollments)
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  pago_em timestamptz not null default now(),
  metodo_pagamento text not null default 'pix',
  payment_id text,
  unique (user_id, course_id)
);
alter table public.enrollments enable row level security;
create policy "Aluno vê próprias matrículas" on public.enrollments
  for select using (auth.uid() = user_id);
create policy "Admin gerencia matrículas" on public.enrollments
  for all using (public.is_admin(auth.uid()));
-- FK adicional p/ o PostgREST resolver embeds enrollments -> profiles (lista no admin)
alter table public.enrollments
  add constraint enrollments_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- Aulas
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules on delete cascade not null,
  titulo text not null,
  video_path text not null,
  duracao_segundos int not null default 0,
  ordem int not null default 0
);
alter table public.lessons enable row level security;
create policy "Aluno matriculado acessa aulas" on public.lessons
  for select using (
    exists (
      select 1 from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id and e.user_id = auth.uid()
    )
  );
create policy "Todos veem títulos de aulas (preview)" on public.lessons
  for select using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.publicado = true
    )
  );
create policy "Admin gerencia aulas" on public.lessons
  for all using (public.is_admin(auth.uid()));

-- Progresso de aulas
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  lesson_id uuid references public.lessons on delete cascade not null,
  concluida_em timestamptz not null default now(),
  unique (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
create policy "Aluno gerencia próprio progresso" on public.lesson_progress
  for all using (auth.uid() = user_id);

-- Certificados
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  codigo_validacao uuid unique not null default gen_random_uuid(),
  gerado_em timestamptz not null default now(),
  unique (user_id, course_id)
);
alter table public.certificates enable row level security;
create policy "Aluno vê próprios certificados" on public.certificates
  for select using (auth.uid() = user_id);
create policy "Público valida certificado por código" on public.certificates
  for select using (true);
create policy "Sistema insere certificados" on public.certificates
  for insert with check (auth.uid() = user_id);
