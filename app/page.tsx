import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/course/CourseCard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('publicado', true)
    .order('criado_em', { ascending: false })

  let enrolledCourseIds: string[] = []
  if (user) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id)
    enrolledCourseIds = enrollments?.map(e => e.course_id) ?? []
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cursos Disponíveis</h1>
          <p className="text-gray-500 mt-2">Qualificação profissional para o mercado do Distrito Industrial de Manaus</p>
        </div>

        {!courses?.length ? (
          <p className="text-gray-500 text-center py-16">Nenhum curso disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={enrolledCourseIds.includes(course.id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
