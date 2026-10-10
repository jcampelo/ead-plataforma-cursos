import { LogoMark } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-sm">
        <span className="inline-flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center bg-white rounded-lg p-1.5">
            <LogoMark className="h-6 w-6" />
          </span>
          <span className="font-bold text-white text-base tracking-tight">
            AtivaSys <span className="font-normal text-blue-300">EAD</span>
          </span>
        </span>
        <p className="mt-1.5 max-w-md mx-auto">Qualificação Profissional para o Distrito Industrial de Manaus</p>
        <a
          href="https://instagram.com/ativasys"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md px-2 py-1"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="20" x="2" y="2" rx="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          @ativasys
        </a>
        <p className="mt-6 text-xs text-gray-600">© {new Date().getFullYear()} AtivaSys EAD. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
