import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function AdminAlunosPage() {
  const admin = await createAdminClient()

  const { data: enrollments } = await admin
    .from('enrollments')
    .select('*, profiles(nome), courses(titulo, slug)')
    .order('pago_em', { ascending: false })

  const { data: courses } = await admin.from('courses').select('id, titulo').eq('publicado', true)
  const { data: users } = await admin.from('profiles').select('id, nome')

  async function liberarAcesso(formData: FormData) {
    'use server'
    const admin = await createAdminClient()
    await admin.from('enrollments').insert({
      user_id: String(formData.get('user_id')),
      course_id: String(formData.get('course_id')),
      metodo_pagamento: 'pix_manual',
    })
    revalidatePath('/admin/alunos')
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Alunos e Matrículas</h1>

      {/* Liberar acesso manual */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-3">Liberar Acesso Manual (PIX direto)</h2>
        <form action={liberarAcesso} className="flex flex-col sm:flex-row gap-3">
          <select name="user_id" required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]">
            <option value="">Selecionar aluno</option>
            {users?.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <select name="course_id" required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]">
            <option value="">Selecionar curso</option>
            {courses?.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
          </select>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 whitespace-nowrap">
            Liberar
          </button>
        </form>
      </div>

      {/* Lista de matrículas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Aluno', 'Curso', 'Método', 'Data'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments?.map(e => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-gray-900">{e.profiles?.nome}</td>
                <td className="px-4 py-3 text-gray-600">{e.courses?.titulo}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    e.metodo_pagamento === 'pix_manual' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {e.metodo_pagamento}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(e.pago_em).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
