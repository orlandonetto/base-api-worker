/* eslint-disable no-console */

import fs from 'fs'
import { ObjectId } from 'mongodb'
import path from 'path'
import pluralize from 'pluralize'

function capitalize(str: string) {
  const text = str.toString()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function toCamelCase(str: string) {
  const text = str.toString()
  return (
    text.charAt(0).toLocaleLowerCase() +
    text.slice(1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  )
}

function toKebabCase(str: string) {
  const text = str.toString()
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

const normalizeSpecIDs = (module: string, ids: string[]) => {
  const specPath = path.join(
    __dirname,
    `./out/modules/${module}/${module}.router.spec.ts`,
  )

  const content = fs.readFileSync(specPath, 'utf-8')

  const exampleID_0 = '65e10e9e89fa72c5088357e7'
  const exampleID_1 = '65e10ec44468e2e44f5b2bb8'
  const exampleID_2 = '65e10edc52f426c769b55a60'

  const result = content
    .replace(new RegExp(exampleID_0, 'g'), ids[0])
    .replace(new RegExp(exampleID_1, 'g'), ids[1])
    .replace(new RegExp(exampleID_2, 'g'), ids[2])

  fs.writeFileSync(specPath, result, 'utf-8')
}

const buildSeeds = (name: string) => {
  const seeds = []
  for (let i = 0; i < 3; i++) {
    const seed = {
      _id: new ObjectId(),
      name: `${name} Test ${i + 1}`,
      deleted: false,
    }

    seeds.push(seed)
  }

  const seedDir = path.join(__dirname, `./out/seeds`)
  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir)

  fs.writeFileSync(
    `${seedDir}/${name}.json`,
    JSON.stringify(seeds, null, 2),
    'utf-8',
  )

  const seedIDs = seeds.map(seed => seed._id.toString())

  normalizeSpecIDs(name, seedIDs)
}

const buildModule = (module: string) => {
  const singular = module
  const plural = pluralize(module)

  // Diretório que contem todos os arquivos do modulo de exemplo
  const examplesPath = path.join(__dirname, './examples')

  // Lê todos os arquivos dentro da pasta examples
  const files = fs.readdirSync(examplesPath)

  const foldername = toKebabCase(plural)

  files.forEach(file => {
    if (!file.endsWith('.txt')) return

    const content = fs.readFileSync(path.join(examplesPath, file), 'utf-8')

    const result = content
      .replace(/\.\/examples\./g, `./${toKebabCase(plural)}.`)
      .replace(/Examples/g, capitalize(plural))
      .replace(/Example/g, capitalize(singular))
      .replace(/examples/g, toCamelCase(plural))
      .replace(/example/g, toCamelCase(singular))

    const outPath = path.join(__dirname, `./out`)
    if (!fs.existsSync(outPath)) fs.mkdirSync(outPath)

    const modulesPath = path.join(__dirname, `./out/modules`)
    if (!fs.existsSync(modulesPath)) fs.mkdirSync(modulesPath)

    const modulePath = path.join(__dirname, `./out/modules/${foldername}`)
    if (!fs.existsSync(modulePath)) fs.mkdirSync(modulePath)

    const filename = file
      .slice(0, -4) // remove .txt from filename
      .replace('examples', foldername)

    fs.writeFileSync(
      path.join(__dirname, `./out/modules/${foldername}/${filename}.ts`),
      result,
      'utf-8',
    )
  })
}

const run = async (moduleName: string) => {
  console.log('Running build-module...')

  try {
    if (!moduleName) throw new Error('Module name is required')

    buildModule(moduleName)
    buildSeeds(pluralize(toKebabCase(moduleName)))

    console.log(`🟢 Builded module [${moduleName}]!`)
  } catch (error) {
    console.error(`🔴 ${error.message}`)
  }
}

// Deve iniciar com o argumento --module=NomeDoModulo
// Pode incluir mais de um modulo separados por virgula ex: --module=Module1,Module2
const moduleArg = process.argv.find(arg => arg.startsWith('--module=')) || ''

if (!moduleArg) {
  console.log('🔴 Missing module name')
  process.exit(1)
}

const moduleNames = moduleArg.split('=')[1]
if (!moduleNames) {
  console.log('🔴 Missing module name')
  process.exit(1)
}

moduleNames
  .trim()
  .split(',')
  .forEach(moduleName => run(moduleName))
