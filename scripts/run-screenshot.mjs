import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KING_FILE = 'C:\\Users\\kaiqu\\Downloads\\king.xlsx'
const TAREFAS_FILE = 'C:\\Users\\kaiqu\\Downloads\\tarefas.xlsx'
const OUT = (name) => path.join(__dirname, '..', 'screenshots', name)

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

// TAREFAS — MENSAL (sem nome)
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
await page.click('button:has-text("TAREFAS")')
await page.waitForTimeout(300)
await page.screenshot({ path: OUT('tarefas-toggle.png'), clip: { x: 0, y: 0, width: 1280, height: 200 } })
console.log('✓ Toggle MENSAL/SEMANAL visível')

await page.locator('input[type="file"]').setInputFiles(TAREFAS_FILE)
await page.waitForTimeout(300)
await page.click('button:has-text("Processar Planilha")')
await page.waitForSelector('text=RELATÓRIO TAREFAS', { timeout: 20000 })
await page.waitForTimeout(500)
await page.screenshot({ path: OUT('tarefas-mensal.png'), clip: { x: 0, y: 0, width: 1280, height: 1000 } })
console.log('✓ TAREFAS MENSAL processado')

// Abre tooltip no primeiro tile
await page.click('button[aria-label="Ver origem desta métrica"]')
await page.waitForTimeout(400)
await page.screenshot({ path: OUT('tarefas-tooltip.png'), clip: { x: 0, y: 0, width: 1280, height: 1000 } })
console.log('✓ Tooltip tarefas aberto')
await page.keyboard.press('Escape')
await page.click('div.fixed.inset-0')

// Troca para SEMANAL
await page.click('button:has-text("Semanal")')
await page.waitForTimeout(500)
await page.screenshot({ path: OUT('tarefas-semanal.png'), clip: { x: 0, y: 0, width: 1280, height: 1200 } })
console.log('✓ TAREFAS SEMANAL')

// KING — tooltip
await page.click('button:has-text("KING")')
await page.waitForTimeout(300)
await page.locator('input[type="file"]').setInputFiles(KING_FILE)
await page.waitForTimeout(300)
await page.click('button:has-text("Processar Planilha")')
await page.waitForSelector('text=Selecionar colaborador', { timeout: 20000 })
await page.click('ul li:nth-child(2) button') // seleciona Amanda
await page.waitForSelector('text=RELATÓRIO KING', { timeout: 10000 })
await page.waitForTimeout(500)
// Abre tooltip King
await page.click('button[aria-label="Ver origem desta métrica"]')
await page.waitForTimeout(400)
await page.screenshot({ path: OUT('king-tooltip.png'), clip: { x: 0, y: 0, width: 1280, height: 900 } })
console.log('✓ KING tooltip aberto')

await browser.close()
