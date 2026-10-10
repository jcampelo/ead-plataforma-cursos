import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'

export default function ObrigadoPage() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Pagamento confirmado!</h1>
          <p className="text-gray-600 mb-8">Seu acesso foi liberado. Bom estudo!</p>
          <Link href="/aluno">
            <Button size="lg">Acessar Meus Cursos</Button>
          </Link>
        </div>
      </main>
    </>
  )
}
