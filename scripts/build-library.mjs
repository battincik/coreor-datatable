import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
const ui = await readFile('src/index.css', 'utf8')
const grid = await readFile('src/App.css', 'utf8')
const theme = await readFile('src/maker.css', 'utf8')
const componentCss = theme.slice(0, theme.indexOf('html{')) + '\n' + ui.slice(ui.indexOf('.ui-button{')) + '\n' + grid.slice(grid.indexOf('.enterprise-grid{')) + '\n' + theme.slice(theme.indexOf('.ui-button-default,'), theme.indexOf('.docs-layout'))
await writeFile('packages/coreor-datatable/dist/styles.css', componentCss)
const typesRoot = path.resolve('packages/coreor-datatable/dist/types')
async function rewriteTypes(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) { await rewriteTypes(target); continue }
    if (!entry.name.endsWith('.d.ts')) continue
    const text = await readFile(target, 'utf8')
    const rewritten = text.replaceAll(/@\/([\w/-]+)/g, (_, name) => {
      const relative = path.relative(path.dirname(target), path.join(typesRoot, name)).replaceAll('\\', '/')
      return relative.startsWith('.') ? relative : `./${relative}`
    })
    await writeFile(target, rewritten)
  }
}
await rewriteTypes(typesRoot)
