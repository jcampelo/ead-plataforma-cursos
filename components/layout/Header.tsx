import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-[#1a56db] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          <Logo markClassName="h-6 w-6" textClassName="text-white" />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="text-blue-100 hover:text-white text-sm">Cursos</Link>
          {user ? (
            <>
              <Link href="/aluno" className="text-blue-100 hover:text-white text-sm">Meus Cursos</Link>
              <form action="/api/auth/signout" method="post">
                <button className="text-blue-100 hover:text-white text-sm">Sair</button>
              </form>
            </>
          ) : (
            <Link href="/entrar">
              <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1a56db]">
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
