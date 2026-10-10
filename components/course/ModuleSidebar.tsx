'use client'

import Link from 'next/link'

type Lesson = { id: string; titulo: string; ordem: number; isConcluida: boolean }
type Module = { id: string; titulo: string; ordem: number; lessons: Lesson[] }

type Props = {
  modules: Module[]
  currentLessonId: string
  courseSlug: string
}

export function ModuleSidebar({ modules, currentLessonId, courseSlug }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-[#0f172a] text-white px-4 py-3 font-semibold text-sm">
        Conteúdo do Curso
      </div>
      <div className="divide-y divide-gray-100">
        {[...modules].sort((a, b) => a.ordem - b.ordem).map(mod => (
          <div key={mod.id}>
            <div className="px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {mod.titulo}
            </div>
            {[...mod.lessons].sort((a, b) => a.ordem - b.ordem).map(lesson => (
              <Link
                key={lesson.id}
                href={`/aluno/cursos/${courseSlug}?aula=${lesson.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 ${
                  lesson.id === currentLessonId ? 'bg-blue-50 text-[#1a56db] font-semibold' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{lesson.isConcluida ? '✅' : '▶'}</span>
                <span className="line-clamp-1">{lesson.titulo}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
