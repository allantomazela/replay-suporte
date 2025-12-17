#!/usr/bin/env node

/**
 * Script de validação antes do deploy
 * Execute: node scripts/validate-production.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const errors = []
const warnings = []

console.log('🔍 Iniciando validação pré-deploy...\n')

// 1. Verificar se .env.example existe
if (!fs.existsSync('.env.example')) {
  warnings.push('⚠️  .env.example não encontrado')
} else {
  console.log('✅ .env.example encontrado')
}

// 2. Verificar se há email hardcoded
const appContextPath = path.join(__dirname, '../src/context/AppContext.tsx')
if (fs.existsSync(appContextPath)) {
  const content = fs.readFileSync(appContextPath, 'utf-8')
  if (content.includes('allantomazela@gamail.com')) {
    errors.push('❌ Email hardcoded ainda presente em AppContext.tsx')
  } else {
    console.log('✅ Email hardcoded removido de AppContext.tsx')
  }
} else {
  warnings.push('⚠️  AppContext.tsx não encontrado')
}

// 3. Verificar se index.html tem lang="pt-BR"
const indexPath = path.join(__dirname, '../index.html')
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf-8')
  if (content.includes('lang="pt-BR"')) {
    console.log('✅ index.html com lang="pt-BR"')
  } else {
    warnings.push('⚠️  index.html não tem lang="pt-BR"')
  }
  
  // Verificar meta tags
  if (content.includes('og:title') && content.includes('twitter:card')) {
    console.log('✅ Meta tags SEO presentes')
  } else {
    warnings.push('⚠️  Meta tags SEO podem estar incompletas')
  }
} else {
  warnings.push('⚠️  index.html não encontrado')
}

// 4. Verificar se robots.txt existe
const robotsPath = path.join(__dirname, '../public/robots.txt')
if (fs.existsSync(robotsPath)) {
  console.log('✅ robots.txt encontrado')
} else {
  warnings.push('⚠️  robots.txt não encontrado')
}

// 5. Verificar se logger.ts existe
const loggerPath = path.join(__dirname, '../src/lib/logger.ts')
if (fs.existsSync(loggerPath)) {
  console.log('✅ logger.ts encontrado')
} else {
  warnings.push('⚠️  logger.ts não encontrado')
}

// 6. Verificar se error-reporter.ts existe
const errorReporterPath = path.join(__dirname, '../src/lib/error-reporter.ts')
if (fs.existsSync(errorReporterPath)) {
  console.log('✅ error-reporter.ts encontrado')
} else {
  warnings.push('⚠️  error-reporter.ts não encontrado')
}

// 7. Verificar se há console.log sem condição (apenas aviso, não erro)
let consoleLogCount = 0
const srcFiles = getAllFiles(path.join(__dirname, '../src'))
srcFiles.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const content = fs.readFileSync(file, 'utf-8')
    // Contar console.log que não estão em comentários ou dentro de condições
    const consoleLogMatches = content.match(/console\.(log|warn|info|debug)/g)
    if (consoleLogMatches) {
      // Verificar se está dentro de uma condição de ambiente
      const hasEnvCheck = content.includes('import.meta.env.DEV') || 
                          content.includes('import.meta.env.MODE') ||
                          content.includes('logger.')
      if (!hasEnvCheck && !file.includes('logger.ts') && !file.includes('error-reporter.ts')) {
        consoleLogCount++
      }
    }
  }
})

if (consoleLogCount > 0) {
  warnings.push(`⚠️  ${consoleLogCount} arquivo(s) com console.log sem verificação de ambiente (considere usar logger)`)
}

// 8. Verificar se package.json tem scripts necessários
const packageJsonPath = path.join(__dirname, '../package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Script de build encontrado')
  } else {
    errors.push('❌ Script de build não encontrado em package.json')
  }
}

// Resultado
console.log('\n📋 Resultado da Validação:\n')

if (errors.length > 0) {
  console.error('❌ ERROS ENCONTRADOS (corrija antes do deploy):')
  errors.forEach(err => console.error('  ' + err))
  console.error('')
}

if (warnings.length > 0) {
  console.warn('⚠️  AVISOS (recomendado corrigir):')
  warnings.forEach(warn => console.warn('  ' + warn))
  console.warn('')
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Validação concluída sem problemas!')
  process.exit(0)
} else if (errors.length === 0) {
  console.log('✅ Validação concluída com avisos (não bloqueantes)')
  process.exit(0)
} else {
  console.error('❌ Validação falhou. Corrija os erros antes de fazer deploy.')
  process.exit(1)
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles
  }
  
  const files = fs.readdirSync(dirPath)
  files.forEach(file => {
    const filePath = path.join(dirPath, file)
    if (fs.statSync(filePath).isDirectory()) {
      // Ignorar node_modules e outras pastas
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
      }
    } else {
      arrayOfFiles.push(filePath)
    }
  })
  return arrayOfFiles
}
