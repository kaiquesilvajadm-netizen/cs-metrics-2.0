interface Funcao {
  id: string
  label: string
  icone: string
}

interface Props {
  funcaoAtiva: string
  funcoes: readonly Funcao[]
  onMudarFuncao: (id: string) => void
  usuarioLogado?: string
  onLogout?: () => void
}

export default function Cabecalho({ funcaoAtiva, funcoes, onMudarFuncao, usuarioLogado, onLogout }: Props) {
  return (
    <header className="relative z-40 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-bold text-white">ADVBOX</span>
        <span className="text-xs tracking-wide text-slate-400">
          PAINEL GERENCIAL · MÉTRICAS CULTIVAÇÃO
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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

        {usuarioLogado && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              👤 <span className="font-medium text-white">{usuarioLogado}</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
