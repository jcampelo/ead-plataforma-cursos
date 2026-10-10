import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/lib/supabase/types'

type Course = Database['public']['Tables']['courses']['Row']

type Props = {
  course: Course
  isEnrolled: boolean
}

export function CourseCard({ course, isEnrolled }: Props) {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-44 bg-gradient-to-br from-[#1e293b] to-[#0f172a] overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/25">
            {/* ícone de curso (graduação) */}
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
            </svg>
          </div>
        )}
        {!isEnrolled ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Pago
          </span>
        ) : (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Matriculado
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{course.titulo}</h3>
        <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{course.descricao}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {course.carga_horaria}h de conteúdo
          </span>
          {!isEnrolled && (
            <span className="font-bold text-[#1a56db] text-lg tabular-nums">
              R$ {Number(course.preco).toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
        <Link
          href={isEnrolled ? `/aluno/cursos/${course.slug}` : `/cursos/${course.slug}`}
          className="mt-4 block w-full text-center bg-[#1a56db] hover:bg-[#1e429f] text-white font-semibold py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a56db] focus-visible:ring-offset-2"
        >
          {isEnrolled ? 'Continuar Curso' : 'Ver Detalhes'}
        </Link>
      </div>
    </div>
  )
}
