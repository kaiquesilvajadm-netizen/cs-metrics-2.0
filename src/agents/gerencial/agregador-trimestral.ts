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

// Chaves calculadas como razão ponderada (numerador somado ao longo dos
// meses fechados, denominador = último mês fechado — é sempre uma foto,
// nunca soma) — mesma lista de agregador-time.ts.
const RAZOES_PONDERADAS: Partial<Record<ChaveMetrica, { numerador: ChaveMetrica; denominador: ChaveMetrica }>> = {
  coberturaBasePercentual: { numerador: 'coberturaBaseTotal', denominador: 'totalContasCarteira' },
  churnPercentual: { numerador: 'churnsRegistrados', denominador: 'totalContasCarteira' },
}

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

function razaoPonderadaDoPeriodo(
  dadosPorAbaEMes: Map<string, Map<number, MetricasColaboradorMes>>,
  abas: string[],
  mesesFechados: number[],
  numerador: ChaveMetrica,
  denominador: ChaveMetrica
): number | null {
  let n = 0
  let temN = false
  let d = 0
  let temD = false
  for (const aba of abas) {
    const vn = valorAgregadoPorAba(dadosPorAbaEMes, aba, mesesFechados, numerador, 'soma')
    if (vn !== null) {
      n += vn
      temN = true
    }
    const vd = valorAgregadoPorAba(dadosPorAbaEMes, aba, mesesFechados, denominador, 'ultimo_valor')
    if (vd !== null) {
      d += vd
      temD = true
    }
  }
  return temN && temD && d > 0 ? (n / d) * 100 : null
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
    const razao = RAZOES_PONDERADAS[def.chave]
    let realizado: number | null

    if (razao) {
      realizado = razaoPonderadaDoPeriodo(dadosPorAbaEMes, abas, mesesFechados, razao.numerador, razao.denominador)
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
