'use client'

import { useState } from 'react'
import type { MetricaIndividual } from '@/types/metricas'

interface Props {
  aoProcessar: (arquivo: File) => Promise<MetricaIndividual[]>
  onResultado: (metricas: MetricaIndividual[]) => void
  onErro: (mensagem: string | null) => void
}

export default function UploadPlanilha({ aoProcessar, onResultado, onErro }: Props) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [processando, setProcessando] = useState(false)

  function selecionarArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    setArquivo(evento.target.files?.[0] ?? null)
    onErro(null)
  }

  async function processarPlanilha() {
    if (!arquivo) return

    setProcessando(true)
    onErro(null)

    try {
      onResultado(await aoProcessar(arquivo))
    } catch (erro) {
      console.error(erro)
      const mensagem = erro instanceof Error ? erro.message : null
      onErro(mensagem ?? 'Não foi possível ler essa planilha. Verifique se o arquivo é .xlsx, .xls ou .csv.')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <label className="flex cursor-pointer flex-col items-center gap-2">
        <span className="text-4xl">📂</span>
        <span className="text-sm font-medium text-slate-700">Clique ou arraste arquivos Excel</span>
        <span className="text-xs text-slate-400">Suporte: .xlsx, .xls, .csv</span>
        <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={selecionarArquivo} />
      </label>

      <p className="mt-3 text-xs text-slate-400">{arquivo ? arquivo.name : 'Nenhum arquivo selecionado'}</p>

      <button
        type="button"
        onClick={processarPlanilha}
        disabled={!arquivo || processando}
        className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {processando ? 'Processando...' : '🚀 Processar Planilha'}
      </button>
    </div>
  )
}
