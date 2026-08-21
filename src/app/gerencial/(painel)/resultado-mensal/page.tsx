'use client'

import { useState } from 'react'
import SeletorMes from '@/components/gerencial/SeletorMes'
import BotaoAtualizar from '@/components/gerencial/BotaoAtualizar'
import BotaoFecharMes from '@/components/gerencial/BotaoFecharMes'
import CardIndicadorTime from '@/components/gerencial/CardIndicadorTime'
import type { IndicadorTime } from '@/types/gerencial'

const ANO_ATUAL = new Date().getFullYear()

export default function ResultadoMensalPage() {
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [indicadores, setIndicadores] = useState<IndicadorTime[]>([])
  const [oficial, setOficial] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [abasComDado, setAbasComDado] = useState(0)
  const [totalAbas, setTotalAbas] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function atualizar() {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/gerencial/resultado-mensal?mes=${mes}&ano=${ANO_ATUAL}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao buscar dados.')
      setIndicadores(data.indicadores)
      setOficial(data.oficial)
      setAviso(data.aviso ?? null)
      setAbasComDado(data.abasComDado)
      setTotalAbas(data.totalAbas)
      setUltimaAtualizacao(new Date())
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">📈 Resultado Mensal do Time</h2>
        <div className="flex items-center gap-3">
          <SeletorMes mes={mes} onMudarMes={setMes} />
          <BotaoAtualizar onAtualizar={atualizar} carregando={carregando} ultimaAtualizacao={ultimaAtualizacao} />
        </div>
      </div>
      <hr className="border-slate-200" />

      {ultimaAtualizacao && (
        <p className="mt-4 text-xs text-slate-400">
          {abasComDado} de {totalAbas} abas com dado neste mês.
        </p>
      )}
      {oficial && (
        <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">✅ Mês fechado — dado definitivo.</p>
      )}
      {aviso && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">⚠️ {aviso}</p>}
      {erro && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}

      {indicadores.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {indicadores.map((ind) => (
            <CardIndicadorTime key={ind.chave} {...ind} />
          ))}
        </div>
      )}

      {ultimaAtualizacao && !oficial && (
        <div className="mt-6">
          <BotaoFecharMes mes={mes} ano={ANO_ATUAL} onFechado={atualizar} />
        </div>
      )}
    </div>
  )
}
