import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AlunoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, courses(id, slug, titulo)')
    .eq('user_id', user.id)
    .order('pago_em', { ascending: false })

  if (!enrollments?.length) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Cursos</h1>
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Você ainda não tem cursos.</p>
          <Link href="/" className="text-[#1a56db] font-semibold hover:underline">Ver cursos disponíveis</Link>
        </div>
      </>
    )
  }

  const courseIds = enrollments.map(e => (e.courses as { id: string; slug: string; titulo: string }).id)

  // Fetch all modules for all enrolled courses in one query
  const { data: allModules } = await supabase
    .from('modules')
    .select('id, course_id')
    .in('course_id', courseIds)

  const moduleIds = allModules?.map(m => m.id) ?? []

  // Fetch all lessons for all modules in one query
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, module_id')
    .in('module_id', moduleIds)

  // Fetch all progress for this user in one query
  const { data: allProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', allLessons?.map(l => l.id) ?? [])

  const progressSet = new Set(allProgress?.map(p => p.lesson_id) ?? [])

  // Build module_id → course_id map
  const moduleToCourse = new Map(allModules?.map(m => [m.id, m.course_id]) ?? [])
  // lesson_id → course_id
  const lessonToCourse = new Map(allLessons?.map(l => [l.id, moduleToCourse.get(l.module_id) ?? '']) ?? [])

  // Compute per-course stats
  const courseStats = new Map<string, { total: number; done: number }>()
  for (const lesson of allLessons ?? []) {
    const cid = lessonToCourse.get(lesson.id) ?? ''
    if (!cid) continue
    const s = courseStats.get(cid) ?? { total: 0, done: 0 }
    s.total++
    if (progressSet.has(lesson.id)) s.done++
    courseStats.set(cid, s)
  }

  const coursesWithProgress = enrollments.map(e => {
    const course = e.courses as { id: string; slug: string; titulo: string }
    const stats = courseStats.get(course.id) ?? { total: 0, done: 0 }
    const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0
    return { course, pct, totalAulas: stats.total, aulasFeitas: stats.done }
  })

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coursesWithProgress.map(({ course, pct, aulasFeitas, totalAulas }) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900">{course.titulo}</h3>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{aulasFeitas} de {totalAulas} aulas</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a56db] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/aluno/cursos/${course.slug}`}
                className="flex-1 text-center bg-[#1a56db] hover:bg-[#1e429f] text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {pct === 100 ? 'Revisar' : 'Continuar'}
              </Link>
              {pct === 100 && (
                <Link
                  href={`/aluno/cursos/${course.slug}/certificado`}
                  className="px-3 py-2 border border-green-500 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-50"
                >
                  🎓 Certificado
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
