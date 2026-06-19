'use client'

import { useMemo, useRef, useState } from 'react'
import Cabecalho from '@/components/Cabecalho'
import UploadPlanilha from '@/components/UploadPlanilha'
import DashboardMetricas from '@/components/DashboardMetricas'
import ModalSelecionarColaborador from '@/components/ModalSelecionarColaborador'
import { importarPlanilha } from '@/agents/importacao'
import { limparTabela } from '@/agents/limpeza'
import { calcularMetricasTarefas, detectarPeriodoTarefas } from '@/agents/metricas-tarefas'
import { calcularMetricasKing } from '@/agents/metricas-king'
import { calcularMetricasKingCarteira } from '@/agents/metricas-king-carteira'
import { montarRelatorio } from '@/agents/relatorio'
import { colaboradorAutorizado, normalizarNomeColaborador } from '@/agents/colaboradores-autorizados'
import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'

const FUNCOES = [
  { id: 'churn', label: 'CHURN', icone: '🔑', titulo: 'Churn', badge: 'MÉTRICAS · PLANILHA CHURN' },
  { id: 'king',  label: 'KING',  icone: '👑', titulo: 'King',  badge: 'MÉTRICAS · PLANILHA KING'  },
  { id: 'tarefas', label: 'TAREFAS', icone: '📊', titulo: 'Tarefas', badge: 'MÉTRICAS · PLANILHA DE TAREFAS' },
] as const

type FuncaoId = (typeof FUNCOES)[number]['id']
type ModoTarefas = 'mensal' | 'semanal'

// ── Estado CHURN ──────────────────────────────────────────────────────────────
interface EstadoChurn {
  metricasDaPlanilha: MetricaIndividual[]
  colaboradorSelecionado: string | null
  mostrarSeletor: boolean
  erro: string | null
}
function churnVazio(): EstadoChurn {
  return { metricasDaPlanilha: [], colaboradorSelecionado: null, mostrarSeletor: false, erro: null }
}

// ── Estado KING (Carteira) ────────────────────────────────────────────────────
interface EstadoKing {
  metricasDaPlanilha: MetricaIndividual[]
  erro: string | null
}
function kingVazio(): EstadoKing {
  return { metricasDaPlanilha: [], erro: null }
}

// ── Estado TAREFAS ────────────────────────────────────────────────────────────
interface EstadoTarefas {
  metricasDaPlanilha: MetricaIndividual[]
  modo: ModoTarefas
  erro: string | null
  aviso: string | null
}
function tarefasVazio(): EstadoTarefas {
  return { metricasDaPlanilha: [], modo: 'mensal', erro: null, aviso: null }
}

export default function Home() {
  const [funcaoAtiva, setFuncaoAtiva] = useState<FuncaoId>('churn')
  const [churn, setChurn] = useState<EstadoChurn>(churnVazio)
  const [king, setKing] = useState<EstadoKing>(kingVazio)
  const [tarefas, setTarefas] = useState<EstadoTarefas>(tarefasVazio)
  const [mostrarInfoModo, setMostrarInfoModo] = useState(false)

  const linhasBrutasTarefas = useRef<LinhaPlanilha[]>([])

  const funcaoInfo = FUNCOES.find((f) => f.id === funcaoAtiva)!
  const ehChurn   = funcaoAtiva === 'churn'
  const ehKing    = funcaoAtiva === 'king'
  const ehTarefas = funcaoAtiva === 'tarefas'

  // ── Dashboard CHURN ─────────────────────────────────────────────────────────
  const linhasChurn = useMemo(() => {
    const filtradas = churn.colaboradorSelecionado
      ? churn.metricasDaPlanilha.filter((m) => m.colaborador === churn.colaboradorSelecionado)
      : []
    return montarRelatorio(filtradas)
  }, [churn])

  const todosColaboradoresChurn = useMemo(
    () => [...new Set(churn.metricasDaPlanilha.map((m) => m.colaborador))].sort(),
    [churn.metricasDaPlanilha]
  )

  // ── Dashboard KING ──────────────────────────────────────────────────────────
  const linhasKing = useMemo(() => montarRelatorio(king.metricasDaPlanilha), [king])

  // ── Dashboard TAREFAS ───────────────────────────────────────────────────────
  const linhasTarefas = useMemo(() => montarRelatorio(tarefas.metricasDaPlanilha), [tarefas])

  // ── Processamento ───────────────────────────────────────────────────────────
  async function processarArquivoChurn(arquivo: File): Promise<MetricaIndividual[]> {
    const abas = await importarPlanilha(arquivo)
    return calcularMetricasKing(limparTabela(abas[0]?.matriz ?? [], 'ID da conta'))
  }

  async function processarArquivoKing(arquivo: File): Promise<MetricaIndividual[]> {
    const abas = await importarPlanilha(arquivo)
    return calcularMetricasKingCarteira(limparTabela(abas[0]?.matriz ?? [], 'ID da Conta'))
  }

  async function processarArquivoTarefas(arquivo: File): Promise<MetricaIndividual[]> {
    const abas = await importarPlanilha(arquivo)
    const linhas = limparTabela(abas[0]?.matriz ?? [], 'Compromisso')
    linhasBrutasTarefas.current = linhas
    return calcularMetricasTarefas(linhas, tarefas.modo)
  }

  function aoReceberChurn(metricas: MetricaIndividual[]) {
    setChurn((prev) => ({
      ...prev,
      metricasDaPlanilha: metricas
        .filter((m) => colaboradorAutorizado(m.colaborador))
        .map((m) => ({ ...m, colaborador: normalizarNomeColaborador(m.colaborador) })),
      colaboradorSelecionado: null,
      mostrarSeletor: true,
      erro: null,
    }))
  }

  function aoReceberKing(metricas: MetricaIndividual[]) {
    setKing((prev) => ({ ...prev, metricasDaPlanilha: metricas, erro: null }))
  }

  function aoReceberTarefas(metricas: MetricaIndividual[]) {
    const aviso = detectarPeriodoTarefas(linhasBrutasTarefas.current, tarefas.modo)
    setTarefas((prev) => ({ ...prev, metricasDaPlanilha: metricas, erro: null, aviso }))
  }

  function mudarModoTarefas(novoModo: ModoTarefas) {
    const linhas = linhasBrutasTarefas.current
    const aviso = linhas.length > 0 ? detectarPeriodoTarefas(linhas, novoModo) : null
    setTarefas((prev) => ({
      ...prev,
      modo: novoModo,
      metricasDaPlanilha: linhas.length > 0 ? calcularMetricasTarefas(linhas, novoModo) : [],
      aviso,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Cabecalho
          funcaoAtiva={funcaoAtiva}
          funcoes={FUNCOES}
          onMudarFuncao={(id) => setFuncaoAtiva(id as FuncaoId)}
        />

        {/* ── ABA CHURN ────────────────────────────────────────────────── */}
        {ehChurn && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 pb-4">
              <span className="text-xl">{funcaoInfo.icone}</span>
              <h2 className="text-lg font-semibold text-slate-900">{funcaoInfo.titulo}</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {funcaoInfo.badge}
              </span>
            </div>
            <hr className="border-slate-200" />

            {/* Instrução de uso */}
            <div className="mt-4 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                ?
              </div>
              <div className="text-xs leading-relaxed text-blue-800">
                <span className="font-semibold">Como exportar os dados corretamente:</span>
                {' '}acesse a <strong>ADVBOX → King → Churns</strong> e selecione o período desejado.
                {' '}Selecione tudo{' '}
                <kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono font-semibold">Ctrl + A</kbd>,
                {' '}copie{' '}
                <kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono font-semibold">Ctrl + C</kbd>
                {' '}e cole em uma planilha em branco <strong>sem formatação</strong>{' '}
                <kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono font-semibold">Ctrl + Shift + V</kbd>.
                {' '}Colar sem formatação remove links e células mescladas, garantindo que o sistema leia todos os dados corretamente.
              </div>
            </div>

            {churn.colaboradorSelecionado && (
              <div className="mt-5 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-slate-400">👤</span>
                <span className="flex-1 text-sm font-medium text-slate-800">
                  {churn.colaboradorSelecionado}
                </span>
                <button
                  type="button"
                  onClick={() => setChurn((prev) => ({ ...prev, mostrarSeletor: true }))}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50"
                >
                  Trocar
                </button>
              </div>
            )}

            <div className="mt-6">
              <UploadPlanilha
                aoProcessar={processarArquivoChurn}
                onResultado={aoReceberChurn}
                onErro={(msg) => setChurn((prev) => ({ ...prev, erro: msg }))}
              />
            </div>

            {churn.erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{churn.erro}</p>
            )}

            {linhasChurn.length > 0 && (
              <span className="mt-6 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                📋 RELATÓRIO CHURN
              </span>
            )}
            <div className="mt-4">
              <DashboardMetricas linhas={linhasChurn} ocultarNome={false} />
            </div>
          </div>
        )}

        {/* ── ABA KING ─────────────────────────────────────────────────── */}
        {ehKing && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 pb-4">
              <span className="text-xl">{funcaoInfo.icone}</span>
              <h2 className="text-lg font-semibold text-slate-900">{funcaoInfo.titulo}</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {funcaoInfo.badge}
              </span>
            </div>
            <hr className="border-slate-200" />

            {/* Instrução de uso */}
            <div className="mt-4 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                ?
              </div>
              <div className="text-xs leading-relaxed text-blue-800">
                <span className="font-semibold">Como exportar os dados corretamente:</span>
                {' '}acesse a <strong>ADVBOX → King</strong>, remova o filtro <strong>Trial em Dia</strong>,
                {' '}clique em <strong>Filtrar</strong>, selecione Status = <strong>Ativas</strong> e filtre pelo <strong>seu nome</strong>.
                {' '}Clique em <strong>Mostrar Todos</strong>, selecione tudo{' '}
                <kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono font-semibold">Ctrl + A</kbd>,
                {' '}copie{' '}
                <kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono font-semibold">Ctrl + C</kbd>
                {' '}e cole em uma planilha em branco{' '}
                <kbd className="rounded bg-blue-100 px-1 py-0.5 font-mono font-semibold">Ctrl + V</kbd>.
              </div>
            </div>

            <div className="mt-6">
              <UploadPlanilha
                aoProcessar={processarArquivoKing}
                onResultado={aoReceberKing}
                onErro={(msg) => setKing((prev) => ({ ...prev, erro: msg }))}
              />
            </div>

            {king.erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{king.erro}</p>
            )}

            {linhasKing.length > 0 && (
              <span className="mt-6 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                📋 RELATÓRIO KING
              </span>
            )}
            <div className="mt-4">
              <DashboardMetricas linhas={linhasKing} ocultarNome={true} />
            </div>
          </div>
        )}

        {/* ── ABA TAREFAS ──────────────────────────────────────────────── */}
        {ehTarefas && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl">{funcaoInfo.icone}</span>
                <h2 className="text-lg font-semibold text-slate-900">{funcaoInfo.titulo}</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {funcaoInfo.badge}
                </span>
              </div>

              {/* Toggle MENSAL / SEMANAL */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1 rounded-full bg-slate-100 p-1">
                  {(['mensal', 'semanal'] as ModoTarefas[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => mudarModoTarefas(m)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                        tarefas.modo === m
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {m === 'mensal' ? 'Mensal' : 'Semanal'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarInfoModo((v) => !v)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 hover:bg-blue-100 hover:text-blue-700"
                  aria-label="Sobre os modos Mensal e Semanal"
                >
                  ?
                </button>
              </div>
            </div>
            <hr className="border-slate-200" />

            {/* Info dos modos */}
            {mostrarInfoModo && (
              <div className="mt-4 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  ?
                </div>
                <div className="space-y-2 text-xs leading-relaxed text-blue-800">
                  <p>
                    <span className="font-semibold">Mensal:</span>{' '}
                    Exibe todas as métricas do mês — reuniões, oportunidades, revisões e churn.
                    Exige o relatório do mês completo (22 a 30 dias úteis) emitido na ADVBOX.
                  </p>
                  <p>
                    <span className="font-semibold">Semanal:</span>{' '}
                    Exibe apenas métricas de frequência semanal — reuniões realizadas, remarcadas/canceladas,
                    agendamentos tentados e taxa de efetivação.
                    Exige o relatório semanal (5 a 7 dias úteis) emitido na ADVBOX.
                  </p>
                </div>
              </div>
            )}

            {/* Aviso de planilha incompatível com o modo */}
            {tarefas.aviso && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                {tarefas.aviso}
              </div>
            )}

            <div className="mt-6">
              <UploadPlanilha
                aoProcessar={processarArquivoTarefas}
                onResultado={aoReceberTarefas}
                onErro={(msg) => setTarefas((prev) => ({ ...prev, erro: msg }))}
              />
            </div>

            {tarefas.erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{tarefas.erro}</p>
            )}

            {linhasTarefas.length > 0 && (
              <span className="mt-6 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                📋 RELATÓRIO TAREFAS · {tarefas.modo === 'mensal' ? 'MENSAL' : 'SEMANAL'}
              </span>
            )}
            <div className="mt-4">
              <DashboardMetricas linhas={linhasTarefas} ocultarNome={true} />
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-400">
          <p>ADVBOX · PAINEL DE MÉTRICAS - CULTIVAÇÃO</p>
        </footer>
      </div>

      {/* Modal de seleção de colaborador — apenas na aba CHURN */}
      {ehChurn && churn.mostrarSeletor && todosColaboradoresChurn.length > 0 && (
        <ModalSelecionarColaborador
          nomes={todosColaboradoresChurn}
          onSelecionar={(nome) =>
            setChurn((prev) => ({ ...prev, colaboradorSelecionado: nome, mostrarSeletor: false }))
          }
        />
      )}
    </div>
  )
}
