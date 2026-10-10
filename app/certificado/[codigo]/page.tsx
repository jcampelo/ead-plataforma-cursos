import { createAdminClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'

interface CertWithRelations {
  gerado_em: string
  codigo_validacao: string
  courses: { titulo: string; carga_horaria: number } | null
  profiles: { nome: string } | null
}

export default async function ValidarCertificadoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const admin = await createAdminClient()

  // Não embeda profiles: não há FK certificates->profiles (user_id aponta p/ auth.users).
  // Busca o curso por embed (FK existe) e o perfil em query separada.
  const { data, error } = await admin
    .from('certificates')
    .select('gerado_em, codigo_validacao, user_id, courses(titulo, carga_horaria)')
    .eq('codigo_validacao', codigo)
    .single()

  let cert: CertWithRelations | null = null
  let queryError = error
  let profileError = null

  if (data) {
    const { data: profile, error: pErr } = await admin.from('profiles').select('nome').eq('id', data.user_id).single()
    if (pErr) {
      profileError = pErr
    }
    cert = { ...data, profiles: profile ?? null } as CertWithRelations
  }

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        {cert ? (
          <div className="bg-white border border-green-200 rounded-xl shadow-sm p-8">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-700 mb-1">Certificado Válido</h1>
            <p className="text-gray-600 mt-3">
              <strong>{cert.profiles?.nome}</strong> concluiu o curso
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{cert.courses?.titulo}</p>
            <p className="text-gray-500 text-sm mt-2">
              {cert.courses?.carga_horaria}h &nbsp;·&nbsp;
              Concluído em {new Date(cert.gerado_em).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-gray-400 mt-4 font-mono">{cert.codigo_validacao}</p>
          </div>
        ) : (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-8">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600">Certificado não encontrado</h1>
            <p className="text-gray-500 mt-2">O código informado não corresponde a nenhum certificado válido.</p>
            <div className="mt-6 pt-6 border-t border-gray-100 text-left text-xs font-mono text-gray-400 space-y-1">
              <p>Código recebido: {codigo}</p>
              {queryError && (
                <>
                  <p className="text-red-400 font-semibold mt-2">Erro na busca do certificado:</p>
                  <p>Código: {queryError.code}</p>
                  <p>Mensagem: {queryError.message}</p>
                  <p>Detalhes: {queryError.details}</p>
                  <p>Dica: {queryError.hint}</p>
                </>
              )}
              {profileError && (
                <>
                  <p className="text-red-400 font-semibold mt-2">Erro na busca do perfil:</p>
                  <p>Código: {profileError.code}</p>
                  <p>Mensagem: {profileError.message}</p>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
