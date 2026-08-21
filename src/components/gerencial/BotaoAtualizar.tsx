'use client'

interface Props {
  onAtualizar: () => void
  carregando: boolean
  ultimaAtualizacao: Date | null
}

// Nunca busca dado sozinho — só quando o líder clica aqui. O relógio da
// última atualização reforça visualmente que os dados não são ao vivo por
// padrão.
export default function BotaoAtualizar({ onAtualizar, carregando, ultimaAtualizacao }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onAtualizar}
        disabled={carregando}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {carregando ? 'Atualizando...' : '🔄 Atualizar'}
      </button>
      {ultimaAtualizacao && (
        <span className="text-xs text-slate-400">
          Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}
