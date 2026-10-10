import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      <aside className="bg-[#0f172a] text-white flex flex-col md:w-56 md:min-h-screen">
        <div className="px-4 py-4 md:py-5 border-b border-gray-700 flex items-center justify-between">
          <div>
            <div className="font-bold text-[#1a56db]">AtivaSys</div>
            <div className="text-gray-400 text-xs">Painel Admin</div>
          </div>
          <Link href="/" className="md:hidden text-gray-400 hover:text-white text-xs whitespace-nowrap">← Site</Link>
        </div>
        <nav className="flex md:flex-col md:flex-1 gap-1 px-2 py-2 md:py-4 md:space-y-1 overflow-x-auto">
          {[
            { href: '/admin', label: '📊 Dashboard' },
            { href: '/admin/cursos', label: '📚 Cursos' },
            { href: '/admin/alunos', label: '👥 Alunos' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="whitespace-nowrap px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block px-4 py-4 border-t border-gray-700">
          <Link href="/" className="text-gray-400 hover:text-white text-xs">← Site</Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
    </div>
  )
}
