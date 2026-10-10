import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const raw = process.env.VIDEO_JWT_SECRET
  if (!raw || raw.length < 32) throw new Error('VIDEO_JWT_SECRET not configured or too short (min 32 chars)')
  return new TextEncoder().encode(raw)
}

export async function assinarTokenVideo(videoPath: string): Promise<string> {
  return new SignJWT({ path: videoPath })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .sign(getSecret())
}

export async function verificarTokenVideo(token: string, expectedPath?: string): Promise<{ path: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const path = payload.path as string
    if (expectedPath && path !== expectedPath) return null
    return { path }
  } catch {
    return null
  }
}
