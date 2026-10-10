import { verificarTokenVideo } from '@/lib/video/token'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const originalUrl = request.nextUrl.searchParams.get('url') ?? ''

  let token = ''
  let videoPath = ''
  try {
    const parsed = new URL(originalUrl, 'http://x')
    token = parsed.searchParams.get('token') ?? ''
    // Extract path without leading /videos/ prefix and without query string
    videoPath = parsed.pathname.replace(/^\/videos\//, '')
  } catch {
    return new NextResponse(null, { status: 403 })
  }

  if (!token || !videoPath) return new NextResponse(null, { status: 403 })

  const payload = await verificarTokenVideo(token, videoPath)
  if (!payload) return new NextResponse(null, { status: 403 })

  return new NextResponse(null, { status: 200 })
}
