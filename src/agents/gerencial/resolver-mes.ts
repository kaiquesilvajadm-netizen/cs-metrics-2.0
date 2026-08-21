import 'server-only'
import { lerMetricasDasAbas } from '@/agents/gerencial/leitura-abas'
import { mesEstaFechado, lerMesesFechados } from '@/agents/gerencial/planilha-gerencial'
import type { MetricasColaboradorMes } from '@/types/gerencial'

export interface DadosDoMes {
  oficial: boolean
  aviso?: string
  porAba: Map<string, MetricasColaboradorMes>
}

// Regra única usada pelos Menus 1 e 3: mês corrente sempre ao vivo (nunca
// oficial, ainda em curso); mês passado fechado sempre do dado congelado;
// mês passado nunca fechado lê ao vivo mesmo assim, mas avisa que não é o
// valor definitivo.
export async function obterDadosDoMes(mes: number, ano: number): Promise<DadosDoMes> {
  const agora = new Date()
  const ehMesCorrente = mes === agora.getMonth() + 1 && ano === agora.getFullYear()

  if (ehMesCorrente) {
    const dados = await lerMetricasDasAbas([mes], ano)
    return { oficial: false, porAba: paraPorAba(dados, mes) }
  }

  const fechado = await mesEstaFechado(mes, ano)
  if (fechado) {
    const dados = await lerMesesFechados([mes], ano)
    return { oficial: true, porAba: paraPorAba(dados, mes) }
  }

  const dados = await lerMetricasDasAbas([mes], ano)
  return {
    oficial: false,
    aviso: 'Este mês nunca foi fechado — dado lido ao vivo da planilha operacional, não é o valor definitivo.',
    porAba: paraPorAba(dados, mes),
  }
}

function paraPorAba(mapa: Map<string, Map<number, MetricasColaboradorMes>>, mes: number): Map<string, MetricasColaboradorMes> {
  const resultado = new Map<string, MetricasColaboradorMes>()
  for (const [aba, porMes] of mapa) {
    const m = porMes.get(mes)
    if (m) resultado.set(aba, m)
  }
  return resultado
}
