'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function CheckoutForm({ courseId }: { courseId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeText: string } | null>(null)
  const [error, setError] = useState('')

  async function handlePix() {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/entrar'); return }

      const res = await fetch('/api/checkout/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPixData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar o PIX.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

      {!pixData ? (
        <div className="space-y-4">
          <Button onClick={handlePix} loading={loading} className="w-full" size="lg">
            Pagar com PIX
          </Button>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 text-center mb-2">Ou envie PIX diretamente:</p>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Chave PIX</p>
              <p className="font-mono font-semibold text-sm mt-1">{process.env.NEXT_PUBLIC_PIX_CHAVE}</p>
              <p className="text-xs text-gray-400 mt-1">Envie o comprovante para @ativasys no Instagram</p>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="font-semibold">Escaneie o QR Code para pagar</p>
          <img src={pixData.qrCode} alt="QR Code PIX" className="mx-auto w-48 h-48" />
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Código copia e cola:</p>
            <p className="font-mono text-xs break-all">{pixData.qrCodeText}</p>
          </div>
          <p className="text-sm text-gray-500">Após o pagamento, o acesso é liberado automaticamente.</p>
        </div>
      )}
    </div>
  )
}
