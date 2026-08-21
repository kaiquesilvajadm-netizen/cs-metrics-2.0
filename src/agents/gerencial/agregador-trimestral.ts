import 'server-only'
import { abasUnicas } from '@/agents/gerencial/leitura-abas'
import { calcularStatus } from '@/agents/gerencial/agregador-time'
import { INDICADORES_TIME } from '@/config/metas-gerencial'
import type {
  AgregacaoPeriodo,
  ChaveMetrica,
  IndicadorTime,
  MetricasColaboradorMes,
  ResultadoPeriodoTime,
} from '@/types/gerencial'

function ultimoMes(meses: number[]): number {
  return Math.max(...meses)
}

// Consolida os valores de UMA aba ao longo dos meses fechados do período,
// respeitando a agregação certa por tipo de métrica: fluxos somam
// (churns, reuniões...), fotos/estoques usam só o valor do último mês
// (tamanho da carteira, distribuição de health score — somar isso entre
// meses triplicaria a carteira).
function valorAgregadoPorAba(
  dadosPorAbaEMes: Map<string, Map<number, MetricasColaboradorMes>>,
  aba: string,
  mesesFechados: number[],
  chave: ChaveMetrica,
  agregacao: AgregacaoPeriodo
): number | null {
  const porMes = dadosPorAbaEMes.get(aba)
  if (!porMes || mesesFechados.length === 0) return null

  if (agregacao === 'ultimo_valor') {
    return porMes.get(ultimoMes(mesesFechados))?.[chave] ?? null
  }

  const valores = mesesFechados
    .map((mes) => porMes.get(mes)?.[chave] ?? null)
    .filter((v): v is number => v !== null)
  if (valores.length === 0) return null

  const soma = valores.reduce((s, v) => s + v, 0)
  return agregacao === 'media' ? soma / valores.length : soma
}

// Soma sobre as 15 abas únicas dos meses JÁ FECHADOS dentro do período
// pedido (Q1=[1,2,3]…ano=[1..12]) — nunca recalcula ao vivo da planilha
// operacional (decisão confirmada). Meses do período ainda não fechados
// aparecem em `mesesFaltando`, não são tratados como zero silencioso.
export function agregarPeriodo(
  meses: number[],
  ano: number,
  mesesFechados: number[],
  dadosPorAbaEMes: Map<string, Map<number, MetricasColaboradorMes>>,
  metasPeriodo: Record<string, number | null>
): ResultadoPeriodoTime {
  const abas = abasUnicas()
  const mesesFaltando = meses.filter((m) => !mesesFechados.includes(m))

  const indicadores: IndicadorTime[] = INDICADORES_TIME.map((def) => {
    let realizado: number | null

    if (def.chave === 'coberturaBasePercentual') {
      // Mesma fórmula ponderada do mês único, mas no trimestre/ano os dois
      // lados usam só o último mês fechado do período por colaborador (não
      // soma o numerador entre os meses) — decisão confirmada: Cobertura de
      // Base no período é uma foto do mês mais recente, não um acumulado.
      let numerador = 0
      let temNumerador = false
      let denominador = 0
      let temDenominador = false
      for (const aba of abas) {
        const n = valorAgregadoPorAba(dadosPorAbaEMes, aba, mesesFechados, 'coberturaBaseTotal', 'ultimo_valor')
        if (n !== null) {
          numerador += n
          temNumerador = true
        }
        const d = valorAgregadoPorAba(dadosPorAbaEMes, aba, mesesFechados, 'totalContasCarteira', 'ultimo_valor')
        if (d !== null) {
          denominador += d
          temDenominador = true
        }
      }
      // Número percentual (3.6 = 3,6%), mesma convenção do mês único.
      realizado = temNumerador && temDenominador && denominador > 0 ? (numerador / denominador) * 100 : null
    } else {
      let soma = 0
      let temValor = false
      for (const aba of abas) {
        const v = valorAgregadoPorAba(dadosPorAbaEMes, aba, mesesFechados, def.chave, def.agregacaoPeriodo)
        if (v !== null) {
          soma += v
          temValor = true
        }
      }
      realizado = temValor ? soma : null
    }

    const meta = def.chaveMeta ? metasPeriodo[def.chaveMeta] ?? null : null
    const percentualAtingimento = realizado !== null && meta !== null && meta !== 0 ? (realizado / meta) * 100 : null

    return {
      chave: def.chave,
      rotulo: def.rotulo,
      realizado,
      meta,
      percentualAtingimento,
      status: calcularStatus(realizado, meta, def.direcao),
    }
  })

  return { meses, ano, mesesFechados, mesesFaltando, indicadores }
}
