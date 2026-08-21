import 'server-only'

// Senha única do painel gerencial (líder). Isolado em server-only pelo mesmo
// motivo de credenciais-colaboradores.ts: nunca deve ir parar no bundle do
// navegador.
export function senhaLiderValida(senhaDigitada: string): boolean {
  const senha = process.env.SENHA_GERENCIAL
  if (!senha) throw new Error('SENHA_GERENCIAL não configurado')
  return senha === senhaDigitada
}
