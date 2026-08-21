import { NextResponse } from 'next/server'
import { senhaLiderValida } from '@/config/credenciais-gerencial'
import { criarValorCookie, NOME_COOKIE_SESSAO, MAX_AGE_SEGUNDOS } from '@/agents/gerencial/sessao'

export async function POST(request: Request) {
  const { senha } = (await request.json()) as { senha?: string }

  if (!senha || !senhaLiderValida(senha)) {
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 })
  }

  const resposta = NextResponse.json({ ok: true })
  resposta.cookies.set(NOME_COOKIE_SESSAO, criarValorCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEGUNDOS,
  })
  return resposta
}
