import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Webhook v1 da Abacate Pay: autentica reenviando o secret como query param ?webhookSecret=
// (o produto /billing/create emite o evento billing.paid no formato v1).
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('webhookSecret') ?? ''
  if (!secret || secret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  const event = await request.json()

  if (event.event !== 'billing.paid' && event.event !== 'BILLING_PAID') {
    return NextResponse.json({ ok: true })
  }

  // No v1 o billing fica em data.billing; mantém fallbacks por segurança.
  const billing = event.data?.billing ?? event.data ?? {}
  const externalId =
    billing.products?.[0]?.externalId ??
    event.data?.products?.[0]?.externalId ??
    event.data?.externalId ??
    ''
  const [userId, courseId] = String(externalId).split(':')

  if (!userId || !courseId) {
    return NextResponse.json({ error: 'externalId inválido' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { error } = await admin.from('enrollments').insert({
    user_id: userId,
    course_id: courseId,
    metodo_pagamento: 'pix_abacatepay',
    payment_id: billing.id ?? event.data?.id ?? '',
  })

  if (error && !error.message.includes('unique')) {
    console.error('Erro ao inserir matrícula:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
