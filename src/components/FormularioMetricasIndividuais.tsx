'use client'

import { useState } from 'react'
import type { MetricaIndividual } from '@/types/metricas'

interface Props {
  colaboradoresDisponiveis: string[]
  metricasPermitidas: string[]
  onAdicionar: (metrica: MetricaIndividual) => void
}

// Só aparece depois que já existem colaboradores processados (vindos da
// planilha) e só oferece, no campo "Métrica", os rótulos que a planilha de
// instruções marca como aceitando ajuste manual — por enquanto, só
// "Fechamentos de Ops no Mês" no menu Tarefas. O menu King não tem nenhuma
// métrica assim, então o formulário simplesmente não aparece nele.
export default function FormularioMetricasIndividuais({
  colaboradoresDisponiveis,
  metricasPermitidas,
  onAdicionar,
}: Props) {
  const [colaborador, setColaborador] = useState(colaboradoresDisponiveis[0] ?? '')
  const [metrica, setMetrica] = useState(metricasPermitidas[0] ?? '')
  const [valor, setValor] = useState('')

  if (colaboradoresDisponiveis.length === 0 || metricasPermitidas.length === 0) {
    return null
  }

  function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault()

    const numero = Number(valor.replace(',', '.'))
    if (!colaborador || !metrica || Number.isNaN(numero) || valor.trim() === '') return

    onAdicionar({ colaborador, origem: 'manual', valores: { [metrica]: numero } })
    setValor('')
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-medium text-zinc-900">Ajuste manual</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Some um valor manual a uma métrica que aceita ajuste, para um colaborador já processado.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {colaboradoresDisponiveis.length > 1 && (
          <select
            value={colaborador}
            onChange={(evento) => setColaborador(evento.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-black"
          >
            {colaboradoresDisponiveis.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        )}

        <select
          value={metrica}
          onChange={(evento) => setMetrica(evento.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-black"
        >
          {metricasPermitidas.map((rotulo) => (
            <option key={rotulo} value={rotulo}>
              {rotulo}
            </option>
          ))}
        </select>

        <input
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          placeholder="Valor a somar"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black"
        />

        <button
          type="submit"
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Somar valor
        </button>
      </div>
    </form>
  )
}
