import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'

export default async function ModulosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await createAdminClient()

  const { data: course } = await admin.from('courses').select('*').eq('id', id).single()
  if (!course) notFound()

  const { data: modules } = await admin
    .from('modules').select('*, lessons(*)').eq('course_id', id).order('ordem')

  async function criarModulo(formData: FormData) {
    'use server'
    const admin = await createAdminClient()
    const maxOrdem = (modules?.length ?? 0) + 1
    await admin.from('modules').insert({
      course_id: id,
      titulo: String(formData.get('titulo')),
      ordem: maxOrdem,
    })
    revalidatePath(`/admin/cursos/${id}/modulos`)
  }

  async function criarAula(formData: FormData) {
    'use server'
    const admin = await createAdminClient()
    const moduleId = String(formData.get('module_id'))
    const { data: existing } = await admin.from('lessons').select('id').eq('module_id', moduleId)
    await admin.from('lessons').insert({
      module_id: moduleId,
      titulo: String(formData.get('titulo')),
      video_path: String(formData.get('video_path')),
      duracao_segundos: Number(formData.get('duracao_segundos')) || 0,
      ordem: (existing?.length ?? 0) + 1,
    })
    revalidatePath(`/admin/cursos/${id}/modulos`)
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <a href="/admin/cursos" className="text-gray-400 hover:text-gray-600 text-sm">← Cursos</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{course.titulo}</h1>
      </div>

      {/* Criar módulo */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="font-semibold mb-3">Novo Módulo</h2>
        <form action={criarModulo} className="flex gap-3">
          <input name="titulo" placeholder="Título do módulo" required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]" />
          <button type="submit" className="bg-[#1a56db] text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Adicionar
          </button>
        </form>
      </div>

      {/* Módulos e aulas */}
      <div className="space-y-4">
        {modules?.sort((a, b) => a.ordem - b.ordem).map(mod => (
          <div key={mod.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200">
              {mod.titulo}
            </div>
            <div className="p-4">
              {/* Lista de aulas */}
              {mod.lessons?.sort((a, b) => a.ordem - b.ordem).map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 py-2 text-sm border-b border-gray-100 last:border-0">
                  <span className="text-gray-400">▶</span>
                  <span className="flex-1 min-w-0 truncate text-gray-800">{lesson.titulo}</span>
                  <span className="text-xs text-gray-400 font-mono truncate max-w-[40%]">{lesson.video_path}</span>
                </div>
              ))}
              {/* Adicionar aula */}
              <form action={criarAula} className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="hidden" name="module_id" value={mod.id} />
                <input name="titulo" placeholder="Título da aula" required
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                <input name="video_path" placeholder="caminho/video.mp4" required
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                <div className="flex gap-2">
                  <input name="duracao_segundos" type="number" placeholder="Duração (s)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
                  <button type="submit" className="bg-[#1a56db] text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                    +
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
