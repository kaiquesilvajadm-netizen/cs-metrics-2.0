'use client'

import { useEffect, useState } from 'react'
import SeletorMes from '@/components/gerencial/SeletorMes'
import BotaoAtualizar from '@/components/gerencial/BotaoAtualizar'
import TabelaMetricasMes from '@/components/gerencial/TabelaMetricasMes'
import { lerCache, salvarCache } from '@/agents/gerencial/cache-local'
import type { MetricasColaboradorMes } from '@/types/gerencial'

const ANO_ATUAL = new Date().getFullYear()
const CHAVE_CACHE = 'metricas-mes'

interface CacheMetricasMes {
  mes: number
  porAba: Record<string, MetricasColaboradorMes | null>
  oficial: boolean
  aviso: string | null
  ultimaAtualizacaoISO: string
}

export default function MetricasMesPage() {
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [porAba, setPorAba] = useState<Record<string, MetricasColaboradorMes | null>>({})
  const [oficial, setOficial] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  // Restaura o último resultado buscado nesta aba, pra não perder o dado ao
  // sair e voltar pro menu (a busca em si continua só manual, via Atualizar).
  useEffect(() => {
    const cache = lerCache<CacheMetricasMes>(CHAVE_CACHE)
    if (!cache) return
    setMes(cache.mes)
    setPorAba(cache.porAba)
    setOficial(cache.oficial)
    setAviso(cache.aviso)
    setUltimaAtualizacao(new Date(cache.ultimaAtualizacaoISO))
  }, [])

  async function atualizar() {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/gerencial/metricas-mes?mes=${mes}&ano=${ANO_ATUAL}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao buscar dados.')
      const agora = new Date()
      setPorAba(data.porAba)
      setOficial(data.oficial)
      setAviso(data.aviso ?? null)
      setUltimaAtualizacao(agora)
      salvarCache<CacheMetricasMes>(CHAVE_CACHE, {
        mes,
        porAba: data.porAba,
        oficial: data.oficial,
        aviso: data.aviso ?? null,
        ultimaAtualizacaoISO: agora.toISOString(),
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">📊 Métricas do Mês</h2>
        <div className="flex items-center gap-3">
          <SeletorMes mes={mes} onMudarMes={setMes} />
          <BotaoAtualizar onAtualizar={atualizar} carregando={carregando} ultimaAtualizacao={ultimaAtualizacao} />
        </div>
      </div>
      <hr className="border-slate-200" />

      {oficial && ultimaAtualizacao && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          ✅ Mês fechado — dado definitivo, não depende mais da planilha operacional.
        </p>
      )}
      {aviso && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">⚠️ {aviso}</p>}
      {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}

      <div className="mt-4">
        <TabelaMetricasMes porAba={porAba} />
      </div>
    </div>
  )
}
