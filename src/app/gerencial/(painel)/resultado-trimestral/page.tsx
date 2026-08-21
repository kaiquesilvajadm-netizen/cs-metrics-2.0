'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SeletorPeriodo from '@/components/gerencial/SeletorPeriodo'
import BotaoAtualizar from '@/components/gerencial/BotaoAtualizar'
import CardIndicadorTime from '@/components/gerencial/CardIndicadorTime'
import DashboardVisualTrimestral from '@/components/gerencial/DashboardVisualTrimestral'
import { INDICADORES_TIME, notaAgregacaoPeriodo } from '@/config/metas-gerencial'
import { lerCache, salvarCache } from '@/agents/gerencial/cache-local'
import { NOMES_MESES } from '@/config/meses-colunas'
import type { AgregacaoPeriodo, IndicadorTime } from '@/types/gerencial'

const ANO_ATUAL = new Date().getFullYear()
const CHAVE_CACHE = 'resultado-trimestral'

interface CacheResultadoTrimestral {
  periodo: string
  indicadores: IndicadorTime[]
  mesesFechados: number[]
  mesesFaltando: number[]
  ultimaAtualizacaoISO: string
}

function explicacaoDe(chave: string): string | undefined {
  return INDICADORES_TIME.find((d) => d.chave === chave)?.explicacao
}

function agregacaoDe(chave: string): AgregacaoPeriodo {
  return INDICADORES_TIME.find((d) => d.chave === chave)?.agregacaoPeriodo ?? 'soma'
}

export default function ResultadoTrimestralPage() {
  const [periodo, setPeriodo] = useState('Q1')
  const [indicadores, setIndicadores] = useState<IndicadorTime[]>([])
  const [mesesFechados, setMesesFechados] = useState<number[]>([])
  const [mesesFaltando, setMesesFaltando] = useState<number[]>([])
  const [carregando, setCarregando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const cache = lerCache<CacheResultadoTrimestral>(CHAVE_CACHE)
    if (!cache) return
    setPeriodo(cache.periodo)
    setIndicadores(cache.indicadores)
    setMesesFechados(cache.mesesFechados)
    setMesesFaltando(cache.mesesFaltando)
    setUltimaAtualizacao(new Date(cache.ultimaAtualizacaoISO))
  }, [])

  async function atualizar() {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/gerencial/resultado-trimestral?periodo=${periodo}&ano=${ANO_ATUAL}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao buscar dados.')
      const agora = new Date()
      setIndicadores(data.indicadores)
      setMesesFechados(data.mesesFechados)
      setMesesFaltando(data.mesesFaltando)
      setUltimaAtualizacao(agora)
      salvarCache<CacheResultadoTrimestral>(CHAVE_CACHE, {
        periodo,
        indicadores: data.indicadores,
        mesesFechados: data.mesesFechados,
        mesesFaltando: data.mesesFaltando,
        ultimaAtualizacaoISO: agora.toISOString(),
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">🗓️ Resultado Trimestral do Time</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 pb-4">
          <SeletorPeriodo periodo={periodo} onMudarPeriodo={setPeriodo} />
          <BotaoAtualizar onAtualizar={atualizar} carregando={carregando} ultimaAtualizacao={ultimaAtualizacao} />
        </div>
        <hr className="border-slate-200" />

        {ultimaAtualizacao && (
          <p className="mt-4 text-xs text-slate-500">
            {mesesFechados.length > 0 ? (
              <>
                ✅ Somando os meses <strong>já fechados</strong> deste período:{' '}
                <strong>{mesesFechados.map((m) => NOMES_MESES[m - 1]).join(', ')}</strong>.
              </>
            ) : (
              'Nenhum mês deste período foi fechado ainda — sem dado pra somar.'
            )}
          </p>
        )}
        {mesesFaltando.length > 0 && ultimaAtualizacao && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            ⚠️ Ainda não fechados neste período (não entram na soma): {mesesFaltando.map((m) => NOMES_MESES[m - 1]).join(', ')}
          </p>
        )}
        {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}

        {indicadores.length > 0 && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {indicadores.map((ind) => (
                <CardIndicadorTime
                  key={ind.chave}
                  {...ind}
                  explicacao={explicacaoDe(ind.chave)}
                  notaPeriodo={notaAgregacaoPeriodo(agregacaoDe(ind.chave))}
                />
              ))}
            </div>

            <div className="mt-6">
              <Link
                href={`/gerencial/resultado-trimestral/relatorio?periodo=${periodo}&ano=${ANO_ATUAL}`}
                className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                🖨️ Ver relatório para impressão
              </Link>
            </div>
          </>
        )}
      </div>

      {indicadores.length > 0 && <DashboardVisualTrimestral indicadores={indicadores} />}
    </div>
  )
}
