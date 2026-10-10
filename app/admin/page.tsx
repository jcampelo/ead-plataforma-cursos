import { createAdminClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const admin = await createAdminClient()
  const { count: totalAlunos } = await admin.from('enrollments').select('id', { count: 'exact', head: true })
  const { count: totalCursos } = await admin.from('courses').select('id', { count: 'exact', head: true })
  const { count: totalCerts } = await admin.from('certificates').select('id', { count: 'exact', head: true })

  const stats = [
    { label: 'Alunos matriculados', value: totalAlunos ?? 0, icon: '👥' },
    { label: 'Cursos publicados', value: totalCursos ?? 0, icon: '📚' },
    { label: 'Certificados emitidos', value: totalCerts ?? 0, icon: '🎓' },
  ]

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-5">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-[#1a56db]">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </>
  )
}
