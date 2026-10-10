import { Header } from '@/components/layout/Header'
import { CheckoutForm } from './CheckoutForm'

export default async function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params

  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <CheckoutForm courseId={courseId} />
      </main>
    </>
  )
}
