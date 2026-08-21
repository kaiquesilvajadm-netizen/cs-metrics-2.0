'use client'

import { useState } from 'react'
import Link from 'next/link'
import SeletorPeriodo from '@/components/gerencial/SeletorPeriodo'
import BotaoAtualizar from '@/components/gerencial/BotaoAtualizar'
import CardIndicadorTime from '@/components/gerencial/CardIndicadorTime'
import { NOMES_MESES } from '@/config/meses-colunas'
import type { IndicadorTime } from '@/types/gerencial'

const ANO_ATUAL = new Date().getFullYear()

export default function ResultadoTrimestralPage() {
  const [periodo, setPeriodo] = useState('Q1')
  const [indicadores, setIndicadores] = useState<IndicadorTime[]>([])
  const [mesesFaltando, setMesesFaltando] = useState<number[]>([])
  const [carregando, setCarregando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function atualizar() {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/gerencial/resultado-trimestral?periodo=${periodo}&ano=${ANO_ATUAL}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao buscar dados.')
      setIndicadores(data.indicadores)
      setMesesFaltando(data.mesesFaltando)
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
        <h2 className="text-lg font-semibold text-slate-900">🗓️ Resultado Trimestral do Time</h2>
        <div className="flex items-center gap-3">
          <SeletorPeriodo periodo={periodo} onMudarPeriodo={setPeriodo} />
          <BotaoAtualizar onAtualizar={atualizar} carregando={carregando} ultimaAtualizacao={ultimaAtualizacao} />
        </div>
      </div>
      <hr className="border-slate-200" />

      {mesesFaltando.length > 0 && ultimaAtualizacao && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          ⚠️ Meses ainda não fechados neste período (não entram na soma):{' '}
          {mesesFaltando.map((m) => NOMES_MESES[m - 1]).join(', ')}
        </p>
      )}
      {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}

      {indicadores.length > 0 && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {indicadores.map((ind) => (
              <CardIndicadorTime key={ind.chave} {...ind} />
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
  )
}
