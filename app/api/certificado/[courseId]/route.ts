import { createClient, createAdminClient } from '@/lib/supabase/server'
import { gerarCertificadoPDF } from '@/lib/certificate/generator'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: modules } = await admin.from('modules').select('id').eq('course_id', courseId)
  const moduleIds = modules?.map(m => m.id) ?? []
  const { data: allLessons } = await admin.from('lessons').select('id').in('module_id', moduleIds)
  const lessonIds = allLessons?.map(l => l.id) ?? []

  if (lessonIds.length === 0) {
    return NextResponse.json({ error: 'Curso sem aulas' }, { status: 403 })
  }

  const { count: feitas } = await supabase
    .from('lesson_progress').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).in('lesson_id', lessonIds)

  if ((feitas ?? 0) < lessonIds.length) {
    return NextResponse.json({ error: 'Curso não concluído' }, { status: 403 })
  }

  // upsert via admin (service role): a tabela certificates não tem policy de UPDATE,
  // então o upsert do usuário falha quando o certificado já existe. A posse/conclusão
  // já foram validadas acima, então é seguro usar o admin aqui.
  const { data: cert, error: certError } = await admin
    .from('certificates')
    .upsert({ user_id: user.id, course_id: courseId }, { onConflict: 'user_id,course_id' })
    .select()
    .single()

  if (certError || !cert) {
    console.error('Erro ao upsert certificado:', certError)
    return NextResponse.json({ error: 'Erro ao registrar certificado' }, { status: 500 })
  }

  const { data: profile } = await admin.from('profiles').select('nome').eq('id', user.id).single()
  const { data: course } = await admin.from('courses').select('titulo, carga_horaria').eq('id', courseId).single()

  if (!course) {
    return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
  }

  let pdf: Buffer
  try {
    pdf = await gerarCertificadoPDF({
      nomeAluno: profile?.nome ?? user.email ?? 'Aluno',
      tituloCurso: course.titulo,
      cargaHoraria: course.carga_horaria,
      dataConclusao: new Date(cert.gerado_em).toLocaleDateString('pt-BR'),
      codigoValidacao: cert.codigo_validacao,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
    })
  } catch (e) {
    console.error('Erro ao gerar PDF do certificado (Puppeteer):', e)
    return NextResponse.json({ error: 'Erro ao gerar o PDF do certificado' }, { status: 500 })
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${course.titulo.replace(/\s+/g, '-')}.pdf"`,
    },
  })
}
