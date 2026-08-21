'use client'

import { useEffect, useState } from 'react'
import BotaoImprimirRelatorio from '@/components/gerencial/BotaoImprimirRelatorio'
import { PERIODOS } from '@/components/gerencial/SeletorPeriodo'
import { NOMES_MESES } from '@/config/meses-colunas'
import type { IndicadorTime } from '@/types/gerencial'

function formatarValor(rotulo: string, valor: number | null): string {
  if (valor === null) return '—'
  if (rotulo.includes('(%)')) return `${valor.toFixed(1)}%`
  return valor.toLocaleString('pt-BR')
}

export default function RelatorioTrimestralPage() {
  // Lido do window (não useSearchParams) pra não exigir Suspense boundary
  // — página só precisa do parâmetro uma vez, ao montar.
  const [periodo, setPeriodo] = useState('ano')
  const [ano, setAno] = useState(new Date().getFullYear())
  const [indicadores, setIndicadores] = useState<IndicadorTime[]>([])
  const [mesesFechados, setMesesFechados] = useState<number[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('periodo') ?? 'ano'
    const a = Number(params.get('ano')) || new Date().getFullYear()
    setPeriodo(p)
    setAno(a)

    setCarregando(true)
    fetch(`/api/gerencial/resultado-trimestral?periodo=${p}&ano=${a}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) throw new Error(data.erro)
        setIndicadores(data.indicadores)
        setMesesFechados(data.mesesFechados)
      })
      .catch((err) => setErro(err instanceof Error ? err.message : 'Erro desconhecido.'))
      .finally(() => setCarregando(false))
  }, [])

  const labelPeriodo = PERIODOS.find((p) => p.valor === periodo)?.label ?? periodo

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm print:shadow-none">
      <div className="mb-6 flex justify-end print:hidden">
        <BotaoImprimirRelatorio />
      </div>

      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Relatório de Resultado do Time — Cultivação</h1>
        <p className="mt-1 text-sm text-slate-500">
          Período: {labelPeriodo} / {ano}
          {mesesFechados.length > 0 && ` · Meses fechados: ${mesesFechados.map((m) => NOMES_MESES[m - 1]).join(', ')}`}
        </p>
      </header>

      {carregando && <p className="text-sm text-slate-400">Carregando...</p>}
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {!carregando && !erro && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-xs uppercase text-slate-500">
              <th className="py-2">Indicador</th>
              <th className="py-2">Realizado</th>
              <th className="py-2">Meta</th>
              <th className="py-2">% Atingimento</th>
            </tr>
          </thead>
          <tbody>
            {indicadores.map((ind) => (
              <tr key={ind.chave} className="border-b border-slate-100">
                <td className="py-2 text-slate-700">{ind.rotulo}</td>
                <td className="py-2 font-medium text-slate-900">{formatarValor(ind.rotulo, ind.realizado)}</td>
                <td className="py-2 text-slate-600">{formatarValor(ind.rotulo, ind.meta)}</td>
                <td className="py-2 text-slate-600">
                  {ind.percentualAtingimento === null ? '—' : `${ind.percentualAtingimento.toFixed(1)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <footer className="mt-8 text-center text-xs text-slate-400 print:mt-16">
        Gerado em {new Date().toLocaleString('pt-BR')} · ADVBOX · Painel Gerencial
      </footer>
    </div>
  )
}
