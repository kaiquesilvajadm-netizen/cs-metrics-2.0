'use client'

// window.print() usa o motor de PDF nativo do navegador — o diálogo de
// impressão oferece "Salvar como PDF" sem precisar de dependência nova.
export default function BotaoImprimirRelatorio() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
    >
      🖨️ Imprimir / Salvar PDF
    </button>
  )
}
