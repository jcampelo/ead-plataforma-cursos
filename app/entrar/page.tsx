import { Header } from '@/components/layout/Header'
import { EntrarForm } from './EntrarForm'

export default function EntrarPage() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <EntrarForm />
      </main>
    </>
  )
}
