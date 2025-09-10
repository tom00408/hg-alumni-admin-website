#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfiguration
const config = {
  // Verzeichnisse die ignoriert werden sollen
  ignoreDirs: [
    'node_modules',
    'dist',
    '.git',
    '.vscode',
    '.idea',
    'coverage',
    '.nyc_output'
  ],
  
  // Dateierweiterungen die analysiert werden sollen
  includeExtensions: [
    '.vue',
    '.js',
    '.ts',
    '.css',
    '.scss',
    '.html',
    '.md'
  ],
  
  // Mindestanzahl Zeilen um in der Ausgabe zu erscheinen
  minLines: 10,
  
  // Warnung bei mehr als X Zeilen
  warningThreshold: 500,
  
  // Kritisch bei mehr als X Zeilen
  criticalThreshold: 800
};

// Farben für die Konsolenausgabe
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function getFileStats(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = fs.statSync(filePath).size;
    
    return {
      path: filePath,
      lines,
      size,
      sizeKB: Math.round(size / 1024 * 100) / 100
    };
  } catch (error) {
    return null;
  }
}

function shouldIgnoreDir(dirName) {
  return config.ignoreDirs.includes(dirName) || dirName.startsWith('.');
}

function shouldIncludeFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return config.includeExtensions.includes(ext);
}

function scanDirectory(dirPath, relativePath = '') {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = path.join(relativePath, item);
      
      if (shouldIgnoreDir(item)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...scanDirectory(fullPath, relativeItemPath));
      } else if (stat.isFile() && shouldIncludeFile(item)) {
        const stats = getFileStats(fullPath);
        if (stats && stats.lines >= config.minLines) {
          results.push(stats);
        }
      }
    }
  } catch (error) {
    console.error(`Fehler beim Scannen von ${dirPath}:`, error.message);
  }
  
  return results;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusColor(lines) {
  if (lines >= config.criticalThreshold) return 'red';
  if (lines >= config.warningThreshold) return 'yellow';
  return 'green';
}

function getStatusIcon(lines) {
  if (lines >= config.criticalThreshold) return '🔴';
  if (lines >= config.warningThreshold) return '⚠️';
  return '✅';
}

function printResults(results) {
  console.log(colorize('\n📊 Dateigrößen-Analyse', 'bold'));
  console.log(colorize('=' .repeat(80), 'cyan'));
  
  // Nach Zeilenanzahl sortieren (absteigend)
  results.sort((a, b) => b.lines - a.lines);
  
  // Statistiken
  const totalFiles = results.length;
  const totalLines = results.reduce((sum, file) => sum + file.lines, 0);
  const totalSize = results.reduce((sum, file) => sum + file.size, 0);
  const criticalFiles = results.filter(f => f.lines >= config.criticalThreshold).length;
  const warningFiles = results.filter(f => f.lines >= config.warningThreshold && f.lines < config.criticalThreshold).length;
  
  console.log(colorize(`\n📈 Statistiken:`, 'bold'));
  console.log(`   Gesamt Dateien: ${totalFiles}`);
  console.log(`   Gesamt Zeilen: ${totalLines.toLocaleString()}`);
  console.log(`   Gesamt Größe: ${formatFileSize(totalSize)}`);
  console.log(`   ${colorize('🔴 Kritisch', 'red')} (>${config.criticalThreshold} Zeilen): ${criticalFiles}`);
  console.log(`   ${colorize('⚠️  Warnung', 'yellow')} (>${config.warningThreshold} Zeilen): ${warningFiles}`);
  
  // Top 20 größte Dateien
  console.log(colorize(`\n📋 Top 20 größte Dateien:`, 'bold'));
  console.log(colorize('-' .repeat(80), 'cyan'));
  console.log(`${'Rang'.padEnd(4)} ${'Status'.padEnd(3)} ${'Zeilen'.padEnd(8)} ${'Größe'.padEnd(8)} ${'Datei'}`);
  console.log(colorize('-' .repeat(80), 'cyan'));
  
  results.slice(0, 20).forEach((file, index) => {
    const statusColor = getStatusColor(file.lines);
    const statusIcon = getStatusIcon(file.lines);
    const rank = (index + 1).toString().padEnd(4);
    const lines = file.lines.toLocaleString().padEnd(8);
    const size = formatFileSize(file.size).padEnd(8);
    const fileName = file.path.length > 50 ? '...' + file.path.slice(-47) : file.path;
    
    console.log(`${rank} ${statusIcon.padEnd(3)} ${colorize(lines, statusColor)} ${size} ${fileName}`);
  });
  
  // Kritische Dateien detailliert
  if (criticalFiles > 0) {
    console.log(colorize(`\n🔴 Kritische Dateien (${criticalFiles}):`, 'bold'));
    console.log(colorize('-' .repeat(80), 'red'));
    
    results
      .filter(f => f.lines >= config.criticalThreshold)
      .forEach(file => {
        console.log(`${colorize('🔴', 'red')} ${file.path}`);
        console.log(`   Zeilen: ${colorize(file.lines.toLocaleString(), 'red')} | Größe: ${formatFileSize(file.size)}`);
        console.log('');
      });
  }
  

  console.log(colorize('\n' + '=' .repeat(80), 'cyan'));
  console.log(colorize('✅ Analyse abgeschlossen!', 'green'));
}

// Hauptfunktion
function main() {
  const projectRoot = process.cwd();
  console.log(colorize(`🔍 Analysiere Projekt: ${projectRoot}`, 'bold'));
  
  const results = scanDirectory(projectRoot);
  
  if (results.length === 0) {
    console.log(colorize('❌ Keine Dateien gefunden!', 'red'));
    return;
  }
  
  printResults(results);
}

// Script ausführen
main();

export { scanDirectory, getFileStats, config };
