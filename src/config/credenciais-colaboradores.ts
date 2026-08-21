import 'server-only'

// Senhas de acesso à exportação, por aba da planilha operacional.
// server-only: garante erro em tempo de build caso algum componente
// cliente tente importar este arquivo (ex: se alguém reintroduzir a senha
// dentro de colaboradores.ts, que é importado pelo ModalExportar).
// Pares de colaboradores que compartilham aba compartilham a mesma senha.
const SENHA_POR_ABA: Record<string, string> = {
  'Amanda':        'ADVBOX3101',
  'Ana e Bruna':   'ADVBOX3202',
  'Ana Julia':     'ADVBOX3303',
  'Dalmo':         'ADVBOX3404',
  'Julia':         'ADVBOX3505',
  'Laísa':         'ADVBOX3606',
  'Luana':         'ADVBOX3707',
  'Tércio ':       'ADVBOX4411',
  'Mari':          'ADVBOX3808',
  'Pedro e Paulo': 'ADVBOX3909',
  'Thais':         'ADVBOX3010',
}

export function senhaValidaPara(abaSheet: string, senhaDigitada: string): boolean {
  return SENHA_POR_ABA[abaSheet] === senhaDigitada
}
