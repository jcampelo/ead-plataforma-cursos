import { createClient, createAdminClient } from '@/lib/supabase/server'
import { criarCobrancaPix } from '@/lib/abacatepay/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { courseId } = await request.json()

  const admin = await createAdminClient()
  const { data: course } = await admin.from('courses').select('*').eq('id', courseId).single()
  if (!course) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })

  const { data: profile } = await admin.from('profiles').select('nome').eq('id', user.id).single()

  const billing = await criarCobrancaPix({
    valor: Number(course.preco),
    descricao: course.titulo,
    clienteNome: profile?.nome ?? user.email!,
    clienteEmail: user.email!,
    externalId: `${user.id}:${courseId}`,
  })

  return NextResponse.json({
    qrCode: billing.data?.pixQrCode ?? '',
    qrCodeText: billing.data?.pixQrCodeText ?? '',
    billingId: billing.data?.id ?? '',
  })
}
