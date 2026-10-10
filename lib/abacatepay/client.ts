// Documentação Abacate Pay: https://abacatepay.com/docs
const BASE_URL = 'https://api.abacatepay.com/v1'

export async function criarCobrancaPix(params: {
  valor: number
  descricao: string
  clienteNome: string
  clienteEmail: string
  externalId: string
}) {
  const res = await fetch(`${BASE_URL}/billing/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: [{
        externalId: params.externalId,
        name: params.descricao,
        quantity: 1,
        price: Math.round(params.valor * 100),
      }],
      customer: {
        name: params.clienteNome,
        email: params.clienteEmail,
      },
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/obrigado`,
      completionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/obrigado`,
    }),
  })

  if (!res.ok) throw new Error(`Abacate Pay error: ${res.status}`)
  return res.json()
}

// Nota: o Webhook v1 da Abacate Pay autentica reenviando o secret como query
// param (?webhookSecret=), validado diretamente em app/api/webhooks/abacatepay/route.ts.
