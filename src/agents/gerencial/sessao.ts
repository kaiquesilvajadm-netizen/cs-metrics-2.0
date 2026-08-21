import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

export const NOME_COOKIE_SESSAO = 'gerencial_sessao'
const DURACAO_MS = 7 * 24 * 60 * 60 * 1000 // 7 dias
export const MAX_AGE_SEGUNDOS = DURACAO_MS / 1000

function segredo(): string {
  const s = process.env.GERENCIAL_SESSION_SECRET
  if (!s) throw new Error('GERENCIAL_SESSION_SECRET não configurado')
  return s
}

function assinar(payload: string): string {
  return createHmac('sha256', segredo()).update(payload).digest('base64url')
}

// Cookie = "{payload-base64url}.{assinatura-hmac-base64url}". Verificado
// aqui e de novo em cada rota /api/gerencial/* (defesa em profundidade —
// não depender só do proxy.ts, seguindo a própria recomendação da doc do
// Next 16 sobre Proxy).
export function criarValorCookie(): string {
  const payload = Buffer.from(JSON.stringify({ papel: 'lider', exp: Date.now() + DURACAO_MS })).toString('base64url')
  return `${payload}.${assinar(payload)}`
}

export function validarSessao(valorCookie: string | undefined | null): boolean {
  if (!valorCookie) return false
  const separador = valorCookie.lastIndexOf('.')
  if (separador === -1) return false

  const payload = valorCookie.slice(0, separador)
  const assinatura = valorCookie.slice(separador + 1)
  const assinaturaEsperada = assinar(payload)

  const a = Buffer.from(assinatura)
  const b = Buffer.from(assinaturaEsperada)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false

  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return dados?.papel === 'lider' && typeof dados.exp === 'number' && dados.exp > Date.now()
  } catch {
    return false
  }
}

// Defesa em profundidade: cada rota /api/gerencial/* (exceto login) chama
// isso de novo, sem depender só do proxy.ts — a própria doc do Next 16
// recomenda não confiar apenas em Proxy para autenticação/autorização.
export function requisicaoAutenticada(request: NextRequest): boolean {
  return validarSessao(request.cookies.get(NOME_COOKIE_SESSAO)?.value)
}
