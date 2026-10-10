import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CertificadoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/entrar')

  const { data: course } = await supabase.from('courses').select('id, titulo').eq('slug', slug).single()
  if (!course) redirect('/aluno')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🎓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h1>
        <p className="text-gray-600 mb-6">Você concluiu <strong>{course.titulo}</strong>.</p>
        <a
          href={`/api/certificado/${course.id}`}
          className="inline-block bg-[#1a56db] hover:bg-[#1e429f] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Baixar Certificado PDF
        </a>
        <div className="mt-4">
          <a href={`/aluno/cursos/${slug}`} className="text-sm text-gray-500 hover:underline">
            ← Voltar ao curso
          </a>
        </div>
      </div>
    </div>
  )
}
