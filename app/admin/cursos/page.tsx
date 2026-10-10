import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function AdminCursosPage() {
  const admin = await createAdminClient()
  const { data: courses } = await admin.from('courses').select('*').order('criado_em', { ascending: false })

  async function togglePublicado(id: string, publicado: boolean) {
    'use server'
    const admin = await createAdminClient()
    await admin.from('courses').update({ publicado: !publicado }).eq('id', id)
    revalidatePath('/admin/cursos')
  }

  async function criarCurso(formData: FormData) {
    'use server'
    const admin = await createAdminClient()
    await admin.from('courses').insert({
      slug: String(formData.get('slug')),
      titulo: String(formData.get('titulo')),
      descricao: String(formData.get('descricao')),
      preco: Number(formData.get('preco')),
      carga_horaria: Number(formData.get('carga_horaria')),
    })
    revalidatePath('/admin/cursos')
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Novo Curso</h2>
        <form action={criarCurso} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'titulo', label: 'Título', type: 'text' },
            { name: 'slug', label: 'Slug (URL)', type: 'text' },
            { name: 'preco', label: 'Preço (R$)', type: 'number' },
            { name: 'carga_horaria', label: 'Carga horária (h)', type: 'number' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input name={f.name} type={f.type} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
            <textarea name="descricao" required rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="bg-[#1a56db] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e429f]">
              Criar Curso
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Título', 'Preço', 'Status', 'Ações'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses?.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{c.titulo}</td>
                <td className="px-4 py-3 text-gray-600">R$ {Number(c.preco).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">
                  <form action={togglePublicado.bind(null, c.id, c.publicado)}>
                    <button type="submit"
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${c.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.publicado ? 'Publicado' : 'Rascunho'}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/cursos/${c.id}/modulos`} className="text-[#1a56db] hover:underline text-sm">
                    Módulos e Aulas
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
