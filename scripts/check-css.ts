import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';

/*
SETTINGS
*/
const ungenutzteStylesAnzeigen = true;
const fehlendeStylesAnzeigen = false;









interface Line {
	text: string;
	lineNumber: number;
}

interface TomClass {
	name: string;
	lineNumber: number;
}

interface fileReport {
	file: string;
	isClean: boolean;
	unusedStyles: Line[];
	missingStyles: Line[];
}

async function main() {
	const files = await getFiles();
	//for (const f of files) console.log(f);
	//console.log(`\n${files.length} .vue-Datei(en) gefunden.`);
	//await logFiles(files);

	const fileReports: fileReport[] = [];

	for (const file of files) {
		const content = await readFile(file, 'utf-8');
		const trimmed = trimContent(content);

		let template: Line[] = [];
		let style: Line[] = [];
		try {
			template = getTemplate(trimmed);
			style = getStyle(trimmed);
		} catch (error) {
			console.error(`❤️‍🔥 Error processing file ${file}:`, error);
		}

		/*
        console.log('=====================================');
        console.log(`📄 ${file}`);
        console.log('=====================================');
        console.log('Template:');
        for (const line of style) {
            console.log(line);
        }
            */

		const templateClasses = extractTemplateClasses(template);
		const styleClasses = extractStyleClasses(style);

		//console.log(templateClasses);
		//console.log(styleClasses);

		const { unusedStyles, missingStyles } = compareClasses(
			templateClasses,
			styleClasses
		);
		//console.log(`\n📄 ${file}`);
		//console.log(unusedStyles);
		const fileReport: fileReport = {
			file,
			isClean: (unusedStyles.length === 0  || !ungenutzteStylesAnzeigen) && (missingStyles.length === 0 || !fehlendeStylesAnzeigen),
			unusedStyles,
			missingStyles,
		};
		fileReports.push(fileReport);
	}

	logFileReports(fileReports);
}

function logFileReports(reports: fileReport[]) {
	let totalUnused = 0;
	let totalMissing = 0;
	let totalFiles = reports.length;
	let cleanFiles = 0;
	console.log('======================================');

	for (const report of reports) {
		if (report.isClean) {
			cleanFiles++;
		}
		console.log(`${report.isClean ? '✅' : '❌'} ${report.file}${report.isClean ? '' : '\n'}`);
		if (!report.isClean) {
			if (ungenutzteStylesAnzeigen && report.unusedStyles.length > 0) {
				console.log(`  🔸Unused styles: `);
				for (const style of report.unusedStyles) {
					console.log(`    - ${style.text} (line ${style.lineNumber})`);
				}
				totalUnused += report.unusedStyles.length;
			}
			if (fehlendeStylesAnzeigen && report.missingStyles.length > 0) {
				console.log(`  🔸Missing styles: `);
				for (const style of report.missingStyles) {
					console.log(`    - ${style.text} (line ${style.lineNumber})`);
				}
				totalMissing += report.missingStyles.length;
			}
		}
		console.log(`${report.isClean ? '' : '\n'}--------------------------------------`);
	}
	console.log('======================================');
	console.log(`\nSummary:`);
	console.log(`🛜 Total files checked: ${totalFiles}`);
	console.log(`✅ Clean files: ${cleanFiles}`);
	console.log(`❌ Files with issues: ${totalFiles - cleanFiles}`);
    if(ungenutzteStylesAnzeigen || fehlendeStylesAnzeigen) {
    console.log('--------------------------------------');
    if(ungenutzteStylesAnzeigen) {
    console.log(`🔸 Total unused styles: ${totalUnused}`)
    }
    if(fehlendeStylesAnzeigen) {
    console.log(`🔸 Total missing styles: ${totalMissing}`);
    }
    }
}

async function getFiles() {
	const files = await fg(['src/**/*.vue'], {
		onlyFiles: true,
		ignore: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.*/**', // .git, .vite etc.
		],
		absolute: false, // auf true stellen, wenn du absolute Pfade willst
	});

	files.sort((a, b) =>
		a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
	);

	return files;
}

async function logFiles(files: string[]) {
	for (const file of files) {
		const content = await readFile(file, 'utf-8');
		console.log('=====================================');
		console.log(`📄 ${file}`);
		console.log('=====================================');
		console.log(content);
		console.log('\n');
	}
}

function trimContent(content: string): Line[] {
	const splitted = content.split('\n').map((line) => line.trim());

	const lines: Line[] = [];

	splitted.forEach((text, index) => {
		if (text.length > 0) {
			lines.push({
				text,
				lineNumber: index + 1, // 1-basiert
			});
		}
	});

	return lines;
}

function getTemplate(content: Line[]): Line[] {
	const start = content.findIndex((line) => line.text.includes('<template>'));
	const end = content.findIndex((line) => line.text.includes('</template>'));
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('Template tags not found or improperly ordered');
	}
	return content.slice(start + 1, end);
}

function getStyle(content: Line[]): Line[] {
	const start = content.findIndex((line) => line.text.includes('<style'));
	const end = content.findIndex((line) => line.text.includes('</style>'));
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('Style tags not found or improperly ordered');
	}
	return content.slice(start + 1, end);
}

export function extractTemplateClasses(lines: Line[]): Line[] {
  const out: Line[] = [];
  const seen = new Set<string>();

  // Hilfsfunktion zum Hinzufügen ohne Duplikate
  const add = (name: string, ln: number) => {
    if (!name) return;
    if (seen.has(name)) return;
    seen.add(name);
    out.push({ text: name, lineNumber: ln });
  };

  // Regexe
  const classAttrRe = /class="([^"]*)"/g;                // statisch
  const classStartRe = /:class\s*=\s*"/;                  // Beginn eines :class-Attributs
  const closingQuoteRe = /"/g;                            // Ende des :class-Attributs (")
  const objectKeyRe = /['"]([^'"]+)['"]\s*:/g;           // Keys in { 'foo': cond }
  const arrayItemRe = /(?<!:)\b['"]([^'"]+)['"]\b(?!\s*:)/g; // Strings in [ 'foo', cond && 'bar' ]

  let inClassBinding = false;
  let currentBindingBuffer = "";
  let bindingStartLine = 0;

  for (const line of lines) {
    const text = line.text;

    // 1) statische class="…"
    let m: RegExpExecArray | null;
    while ((m = classAttrRe.exec(text)) !== null) {
      const parts = m[1].trim().split(/\s+/).filter(Boolean);
      for (const p of parts) add(p, line.lineNumber);
    }

    // 2) :class="…"
    //    a) Falls wir aktuell in einem mehrzeiligen Binding sind, puffern weiter
    if (inClassBinding) {
      currentBindingBuffer += "\n" + text;

      // Schauen, ob diese Zeile die schließende doppelten Anführungszeichen enthält.
      // (Wir suchen das nächste schließende Anführungszeichen relativ zum Start;
      // einfacher Ansatz: sobald wir eine ungepaarte " finden, schließen wir.)
      if (text.includes('"')) {
        // Binding geschlossen -> auswerten & zurücksetzen
        processClassBinding(currentBindingBuffer, bindingStartLine);
        inClassBinding = false;
        currentBindingBuffer = "";
        bindingStartLine = 0;
      }

      // Weiter zur nächsten Zeile
      continue;
    }

    //    b) Neue :class="-Zuweisung" beginnt in dieser Zeile?
    if (classStartRe.test(text)) {
      inClassBinding = true;
      bindingStartLine = line.lineNumber;

      // Inhalt ab der ersten doppelten Anführungszeichen sammeln
      const idx = text.indexOf(`:class`);
      const after = text.slice(idx); // ab :class…
      const firstQuote = after.indexOf(`"`);
      if (firstQuote >= 0) {
        currentBindingBuffer = after.slice(firstQuote + 1); // nach dem ersten "
        // Falls dieselbe Zeile auch das schließende Anführungszeichen enthält,
        // direkt verarbeiten (einzeiliges Binding)
        const rest = currentBindingBuffer;
        if (rest.includes(`"`)) {
          const endIdx = rest.indexOf(`"`);
          const inner = rest.slice(0, endIdx);
          processClassBinding(inner, bindingStartLine);
          inClassBinding = false;
          currentBindingBuffer = "";
          bindingStartLine = 0;
        }
      }
      continue;
    }
  }

  // Falls die Datei mit offenem Binding endet (ungewöhnlich), optional noch best-effort verarbeiten:
  if (inClassBinding && currentBindingBuffer) {
    processClassBinding(currentBindingBuffer, bindingStartLine);
  }

  return out;

  // ---------- Helfer: verarbeitet den Inhalt zwischen den Anführungszeichen von :class="…"
  function processClassBinding(inner: string, startLine: number) {
    const s = inner.trim();

    // Objekt-Syntax: { 'foo': cond, "bar": expr }
    if (s.startsWith("{")) {
      let m: RegExpExecArray | null;
      while ((m = objectKeyRe.exec(s)) !== null) {
        add(m[1], startLine);
      }
      return;
    }

    // Array-Syntax: [ 'foo', isBar && 'bar', condition ? 'baz' : null ]
    if (s.startsWith("[")) {
      let m: RegExpExecArray | null;
      while ((m = arrayItemRe.exec(s)) !== null) {
        // m[1] ist ein String-Literal in der Array-Bindung.
        // Durch die Lookarounds schließen wir Keys wie "'x':" aus (falls jemand Objekt-ähnliches in Arrays schreibt).
        add(m[1], startLine);
      }
      return;
    }

    // String-Syntax: :class="'foo bar'"  oder  :class="someVar ? 'foo' : 'bar'"
    // Wir nehmen nur die **String-Literale** (z. B. 'foo', 'bar'), nicht alle Strings im Ausdruck.
    // Einfacher Ansatz: alle Quotes rausfischen, die *nicht* vor einem Doppelpunkt stehen (kein Key).
    let m: RegExpExecArray | null;
    while ((m = arrayItemRe.exec(s)) !== null) {
      add(m[1], startLine);
    }
  }
}



function extractStyleClasses(lines: Line[]): Line[] {
	const out: Line[] = [];
	const seen = new Set<string>();

	// Regex wie gehabt
	const re = /\.([_a-zA-Z][-_a-zA-Z0-9]*)\b(?=[\s,{.:#\[>+~])/g;

	for (const line of lines) {
		if (line.text.startsWith('/*') || line.text.startsWith('//')) continue;

		let m: RegExpExecArray | null;
		while ((m = re.exec(line.text)) !== null) {
			const className = m[1];
			if (!seen.has(className)) {
				out.push({ text: className, lineNumber: line.lineNumber });
				seen.add(className);
			}
		}
	}

	return out;
}

function compareClasses(templateClasses: Line[], styleClasses: Line[]): { unusedStyles: Line[]; missingStyles: Line[] } {
	// Sets mit nur den Klassennamen für schnellen Vergleich
	const templateSet = new Set(templateClasses.map((c) => c.text));
	const styleSet = new Set(styleClasses.map((c) => c.text));

	// Styles, die im CSS stehen, aber nicht im Template verwendet werden
	const unusedStyles = styleClasses.filter((c) => !templateSet.has(c.text));

	// Klassen, die im Template vorkommen, aber im CSS fehlen
	const missingStyles = templateClasses.filter((c) => !styleSet.has(c.text));

	return { unusedStyles, missingStyles };
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
