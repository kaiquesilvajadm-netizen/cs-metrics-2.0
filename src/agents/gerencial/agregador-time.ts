import 'server-only'
import { abasUnicas } from '@/agents/gerencial/leitura-abas'
import { INDICADORES_TIME } from '@/config/metas-gerencial'
import type {
  ChaveMetrica,
  DirecaoMeta,
  IndicadorTime,
  MetricasColaboradorMes,
  ResultadoTime,
  StatusIndicador,
} from '@/types/gerencial'

// Chaves calculadas como razão ponderada entre dois outros campos (nunca
// somadas nem lidas direto da soma genérica) — Cobertura de Base e Churn
// são ambos "quantas contas X ÷ quantas contas no total", só que com
// numeradores diferentes.
const RAZOES_PONDERADAS: Partial<Record<ChaveMetrica, { numerador: ChaveMetrica; denominador: ChaveMetrica }>> = {
  coberturaBasePercentual: { numerador: 'coberturaBaseTotal', denominador: 'totalContasCarteira' },
  churnPercentual: { numerador: 'churnsRegistrados', denominador: 'totalContasCarteira' },
}

// razao = realizado / meta, sempre nesse sentido independente da direção —
// quem decide se razao alta é boa ou ruim é a `direcao`. Evita inverter o
// sinal do número e confundir a exibição; quem lê o `status` já sabe.
export function calcularStatus(realizado: number | null, meta: number | null, direcao: DirecaoMeta): StatusIndicador {
  if (realizado === null || meta === null || meta === 0) return 'sem_meta'
  const razao = realizado / meta

  if (direcao === 'maior_melhor') {
    if (razao >= 1) return 'ok'
    if (razao >= 0.8) return 'atencao'
    return 'critico'
  }

  // menor_melhor (ex: churn): ficar em ou abaixo da meta é bom.
  if (razao <= 1) return 'ok'
  if (razao <= 1.25) return 'atencao'
  return 'critico'
}

// Soma dos numeradores de todas as abas ÷ soma dos denominadores — média
// ponderada pelo tamanho de cada carteira, nunca média simples das %
// individuais de cada colaborador (decisão confirmada).
function razaoPonderadaDoTime(
  dadosPorAba: Map<string, MetricasColaboradorMes>,
  numerador: ChaveMetrica,
  denominador: ChaveMetrica
): number | null {
  let n = 0
  let d = 0
  for (const m of dadosPorAba.values()) {
    n += m[numerador] ?? 0
    d += m[denominador] ?? 0
  }
  return d > 0 ? (n / d) * 100 : null
}

// Agrega as 15 abas únicas do mês (nunca as 17 pessoas de COLABORADORES —
// os pares "Ana e Bruna" / "Pedro e Paulo" duplicariam o total do time).
export function agregarTime(
  mes: number,
  ano: number,
  dadosPorAba: Map<string, MetricasColaboradorMes>,
  metas: Record<string, number | null>
): ResultadoTime {
  const abas = abasUnicas()
  let abasComDado = 0

  const somas: Partial<Record<ChaveMetrica, number>> = {}

  for (const aba of abas) {
    const m = dadosPorAba.get(aba)
    if (!m) continue

    let temDado = false
    for (const def of INDICADORES_TIME) {
      if (RAZOES_PONDERADAS[def.chave]) continue // recalculada à parte, nunca somada
      const v = m[def.chave]
      if (v === null) continue
      temDado = true
      somas[def.chave] = (somas[def.chave] ?? 0) + v
    }
    if (temDado) abasComDado++
  }

  const indicadores: IndicadorTime[] = INDICADORES_TIME.map((def) => {
    const razao = RAZOES_PONDERADAS[def.chave]
    const realizado = razao ? razaoPonderadaDoTime(dadosPorAba, razao.numerador, razao.denominador) : somas[def.chave] ?? null
    const meta = def.chaveMeta ? metas[def.chaveMeta] ?? null : null
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

  return { mes, ano, abasComDado, totalAbas: abas.length, indicadores }
}
