interface Funcao {
  id: string
  label: string
  icone: string
}

interface Props {
  funcaoAtiva: string
  funcoes: readonly Funcao[]
  onMudarFuncao: (id: string) => void
}

export default function Cabecalho({ funcaoAtiva, funcoes, onMudarFuncao }: Props) {
  return (
    <header className="relative z-40 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-bold text-white">ADVBOX</span>
        <span className="text-xs tracking-wide text-slate-400">
          PAINEL GERENCIAL · MÉTRICAS CULTIVAÇÃO
        </span>
      </div>

      <div className="flex gap-1 rounded-full bg-slate-800 p-1">
        {funcoes.map((funcao) => (
          <button
            key={funcao.id}
            type="button"
            onClick={() => onMudarFuncao(funcao.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              funcaoAtiva === funcao.id
                ? 'bg-white text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {funcao.icone} {funcao.label}
          </button>
        ))}
      </div>
    </header>
  )
}
