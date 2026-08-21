import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { NOME_COOKIE_SESSAO, validarSessao } from '@/agents/gerencial/sessao'

// Next.js 16 renomeou middleware.ts -> proxy.ts (mesma função). Roda em
// runtime Node.js por padrão nesta versão, por isso node:crypto (usado em
// sessao.ts) funciona sem ressalva aqui.
export const config = {
  matcher: ['/', '/gerencial/:path*', '/api/gerencial/:path*'],
}

function dominiosGerenciais(): string[] {
  return (process.env.GERENCIAL_DOMAIN ?? '')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''

  // Domínio dedicado ao painel gerencial: a raiz "/" vira /gerencial por
  // dentro, sem mudar a URL visível pro líder. O domínio original do app de
  // colaboradores continua servindo "/" normalmente — só dispara quando o
  // host bate com GERENCIAL_DOMAIN.
  if (pathname === '/' && dominiosGerenciais().some((d) => host === d || host.startsWith(`${d}:`))) {
    return NextResponse.rewrite(new URL('/gerencial', request.url))
  }

  const ehRotaGerencial = pathname.startsWith('/gerencial') || pathname.startsWith('/api/gerencial')
  if (!ehRotaGerencial) return NextResponse.next()

  const ehLogin = pathname === '/gerencial/login' || pathname === '/api/gerencial/login'
  if (ehLogin) return NextResponse.next()

  const cookie = request.cookies.get(NOME_COOKIE_SESSAO)?.value
  if (validarSessao(cookie)) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }
  return NextResponse.redirect(new URL('/gerencial/login', request.url))
}
