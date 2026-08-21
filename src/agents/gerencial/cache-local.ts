// Cache client-side (sessionStorage) pra cada tela do painel gerencial não
// perder o que já buscou ao trocar de menu — sem isso, sair de "Métricas do
// Mês" e voltar forçava clicar em Atualizar de novo. Nunca busca dado
// sozinho: só guarda o que já foi buscado, pra reaparecer instantaneamente
// ao voltar na tela. Expira sozinho (30 min) pra não mostrar algo velho
// demais como se fosse atual.

const PREFIXO = 'gerencial:'
const VALIDADE_MS = 30 * 60 * 1000

interface EntradaCache<T> {
  valor: T
  salvoEm: number
}

export function lerCache<T>(chave: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const bruto = sessionStorage.getItem(PREFIXO + chave)
    if (!bruto) return null
    const entrada = JSON.parse(bruto) as EntradaCache<T>
    if (Date.now() - entrada.salvoEm > VALIDADE_MS) {
      sessionStorage.removeItem(PREFIXO + chave)
      return null
    }
    return entrada.valor
  } catch {
    return null
  }
}

export function salvarCache<T>(chave: string, valor: T): void {
  if (typeof window === 'undefined') return
  try {
    const entrada: EntradaCache<T> = { valor, salvoEm: Date.now() }
    sessionStorage.setItem(PREFIXO + chave, JSON.stringify(entrada))
  } catch {
    // sessionStorage cheio ou indisponível — não é crítico, só perde o cache
  }
}
