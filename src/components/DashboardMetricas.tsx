'use client'

import { useState } from 'react'
import { formatarValorMetrica, type LinhaDashboard } from '@/agents/relatorio'

interface Props {
  linhas: LinhaDashboard[]
  ocultarNome?: boolean
}

export default function DashboardMetricas({ linhas, ocultarNome = false }: Props) {
  const [tooltipAberto, setTooltipAberto] = useState<string | null>(null)

  if (linhas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Nenhum dado ainda. Envie uma planilha ou preencha o formulário acima.
      </div>
    )
  }

  function toggleTooltip(chave: string) {
    setTooltipAberto((atual) => (atual === chave ? null : chave))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Fecha tooltip ao clicar fora */}
      {tooltipAberto && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setTooltipAberto(null)}
          aria-hidden
        />
      )}

      {linhas.map((linha) => (
        <div key={linha.colaborador} className="rounded-xl border-l-4 border-blue-500 bg-slate-50 p-5">
          {!ocultarNome && (
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>📊</span>
              <span>{linha.colaborador.toUpperCase()}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {linha.metricas.map((metrica) => {
              const chave = `${linha.colaborador}:${metrica.rotulo}`
              const aberto = tooltipAberto === chave
              const temInfo =
                (metrica.fontes && metrica.fontes.length > 0) || !!metrica.explicacao

              return (
                <div key={metrica.rotulo} className="relative min-w-0">
                  <div className="h-full rounded-lg bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-start gap-1">
                      <span className="mt-0.5 text-xs">{metrica.icone}</span>
                      <span className="flex-1 text-xs font-medium uppercase leading-tight tracking-wide text-slate-500">
                        {metrica.rotulo}
                      </span>
                      {temInfo && (
                        <button
                          type="button"
                          onClick={() => toggleTooltip(chave)}
                          className="relative z-20 ml-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 hover:bg-blue-100 hover:text-blue-700"
                          aria-label="Ver origem desta métrica"
                        >
                          ?
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xl font-bold text-slate-900">
                      {formatarValorMetrica(metrica.rotulo, metrica.valor)}
                    </div>
                  </div>

                  {aberto && (
                    <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Origem da métrica
                        </span>
                        <button
                          type="button"
                          onClick={() => setTooltipAberto(null)}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label="Fechar"
                        >
                          ✕
                        </button>
                      </div>

                      {metrica.explicacao && (
                        <p className="mb-3 rounded bg-blue-50 px-3 py-2 text-xs uppercase leading-relaxed text-blue-800">
                          {metrica.explicacao}
                        </p>
                      )}

                      {metrica.fontes && metrica.fontes.length > 0 && (
                        <>
                          <p className="mb-1.5 text-xs font-medium uppercase text-slate-500">
                            Tarefas contabilizadas:
                          </p>
                          <ul className="space-y-1">
                            {metrica.fontes.map((fonte) => (
                              <li
                                key={fonte}
                                className="rounded bg-slate-50 px-2 py-1 text-xs uppercase text-slate-700"
                              >
                                {fonte}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
