/**
 * Marca AtivaSys — "A" com gradiente azul→roxo, recriado em SVG (escala/temática).
 * LogoMark = só o símbolo. Logo = símbolo + wordmark.
 */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  const id = 'ativasys-logo-grad'
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="70" y1="10" x2="26" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f7cff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 6 L6 94 L94 94 Z M50 30 L41 52 L59 52 Z M50 58 L31 94 L69 94 Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}

type LogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
  /** Fundo branco atrás do símbolo (use em fundos escuros/coloridos) */
  chip?: boolean
}

export function Logo({ className = '', markClassName = 'h-6 w-6', textClassName = 'text-white', chip = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {chip ? (
        <span className="inline-flex items-center justify-center bg-white rounded-lg p-1.5 shadow-sm">
          <LogoMark className={markClassName} />
        </span>
      ) : (
        <LogoMark className={markClassName} />
      )}
      <span className={`font-bold text-lg sm:text-xl tracking-tight whitespace-nowrap ${textClassName}`}>
        AtivaSys <span className="font-normal opacity-70">EAD</span>
      </span>
    </span>
  )
}
