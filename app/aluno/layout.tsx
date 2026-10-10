import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function AlunoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
