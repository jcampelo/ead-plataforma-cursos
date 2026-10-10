import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .single()

  if (!course) notFound()

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('ordem')

  const { data: { user } } = await supabase.auth.getUser()

  let isEnrolled = false
  if (user) {
    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .single()
    isEnrolled = !!data
  }

  const totalAulas = modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900">{course.titulo}</h1>
            <p className="text-gray-600 mt-3 leading-relaxed">{course.descricao}</p>

            <div className="flex gap-4 mt-5 text-sm text-gray-500">
              <span>⏱ {course.carga_horaria}h de conteúdo</span>
              <span>📹 {totalAulas} aulas</span>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Conteúdo do Curso</h2>
              <div className="space-y-3">
                {modules?.map(mod => (
                  <div key={mod.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800">
                      {mod.titulo}
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {(mod.lessons as any[])?.sort((a, b) => a.ordem - b.ordem).map((lesson: any) => (
                        <li key={lesson.id} className="px-4 py-2.5 text-sm text-gray-600 flex items-center gap-2">
                          {isEnrolled ? '▶' : '🔒'} {lesson.titulo}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card de compra */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="text-3xl font-bold text-[#1a56db] mb-1">
                R$ {Number(course.preco).toFixed(2).replace('.', ',')}
              </div>
              <p className="text-gray-500 text-sm mb-5">Acesso vitalício</p>

              {isEnrolled ? (
                <Link href={`/aluno/cursos/${course.slug}`}>
                  <Button className="w-full" size="lg">Acessar Curso</Button>
                </Link>
              ) : (
                <Link href={`/checkout/${course.id}`}>
                  <Button className="w-full" size="lg">Comprar Agora</Button>
                </Link>
              )}

              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                <li>✓ {course.carga_horaria}h de conteúdo em vídeo</li>
                <li>✓ Certificado de conclusão</li>
                <li>✓ Acesso imediato após pagamento</li>
                <li>✓ Acesso vitalício</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
