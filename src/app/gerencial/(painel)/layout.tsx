import SidebarGerencial from '@/components/gerencial/SidebarGerencial'
import BannerFechamentoPendente from '@/components/gerencial/BannerFechamentoPendente'

export default function PainelGerencialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-blue-50 px-6 py-8 print:bg-white print:p-0">
      <div className="flex max-w-[1600px] items-stretch gap-6">
        <SidebarGerencial />
        <main className="flex flex-1 flex-col gap-4">
          <div className="print:hidden">
            <BannerFechamentoPendente />
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
