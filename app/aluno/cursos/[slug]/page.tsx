import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { assinarTokenVideo } from '@/lib/video/token'
import { ModuleSidebar } from '@/components/course/ModuleSidebar'
import { revalidatePath } from 'next/cache'

type LessonRow = { id: string; titulo: string; ordem: number; video_path: string; isConcluida: boolean }
type ModuleRow = { id: string; titulo: string; ordem: number; lessons: LessonRow[] }

export default async function CursoViewerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ aula?: string }>
}) {
  const { slug } = await params
  const { aula: aulaId } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: course } = await supabase.from('courses').select('*').eq('slug', slug).single()
  if (!course) notFound()

  const { data: enrollment } = await supabase
    .from('enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).single()
  if (!enrollment) redirect(`/cursos/${slug}`)

  const { data: modulesRaw } = await supabase
    .from('modules')
    .select('id, titulo, ordem, lessons(id, titulo, ordem, video_path)')
    .eq('course_id', course.id)
    .order('ordem')

  const allLessonIds = (modulesRaw ?? []).flatMap(m =>
    (m.lessons as { id: string }[]).map(l => l.id)
  )
  const { data: progressRaw } = await supabase
    .from('lesson_progress').select('lesson_id').eq('user_id', user.id).in('lesson_id', allLessonIds)
  const concluidasSet = new Set(progressRaw?.map(p => p.lesson_id) ?? [])

  const modules: ModuleRow[] = (modulesRaw ?? []).map(m => ({
    id: m.id,
    titulo: m.titulo,
    ordem: m.ordem,
    lessons: (m.lessons as { id: string; titulo: string; ordem: number; video_path: string }[]).map(l => ({
      ...l,
      isConcluida: concluidasSet.has(l.id),
    })),
  }))

  const allLessons = modules.flatMap(m => [...m.lessons].sort((a, b) => a.ordem - b.ordem))
  const primeiraAula = modules.sort((a, b) => a.ordem - b.ordem)[0]?.lessons[0]
  const currentLessonId = aulaId ?? primeiraAula?.id ?? ''
  const currentLesson = allLessons.find(l => l.id === currentLessonId)

  const videoToken = currentLesson?.video_path
    ? await assinarTokenVideo(currentLesson.video_path)
    : ''
  const videoUrl = currentLesson?.video_path
    ? `/videos/${currentLesson.video_path}?token=${videoToken}`
    : ''

  async function marcarConcluida(lessonId: string) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('lesson_progress')
      .upsert({ user_id: user.id, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' })
    revalidatePath(`/aluno/cursos/${slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a56db] text-white px-4 py-3 flex items-center gap-4">
        <a href="/aluno" className="text-blue-200 hover:text-white text-sm">← Meus Cursos</a>
        <span className="font-semibold">{course.titulo}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {currentLesson ? (
            <>
              <h2 className="text-xl font-bold text-gray-900">{currentLesson.titulo}</h2>
              <div className="bg-[#0f172a] rounded-xl overflow-hidden">
                <video src={videoUrl} controls className="w-full aspect-video" preload="metadata" />
                <div className="p-4 flex justify-end">
                  <form action={async () => { 'use server'; await marcarConcluida(currentLessonId) }}>
                    <button
                      type="submit"
                      disabled={concluidasSet.has(currentLessonId)}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                    >
                      {concluidasSet.has(currentLessonId) ? '✓ Concluída' : 'Marcar como concluída'}
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              Selecione uma aula no menu lateral.
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <ModuleSidebar modules={modules} currentLessonId={currentLessonId} courseSlug={slug} />
        </div>
      </div>
    </div>
  )
}
