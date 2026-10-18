#!/usr/bin/env node
/* Les dades venen d'un altre repositori, i això ho comprova
 * ─────────────────────────────────────────────────────────────────────────────
 * `data/comando.json` no és d'aquí. El generen les llistes declarades a
 * `SOS/tools/build-comando.js` del repositori **teamtowershuma**, que és on viu
 * l'aplicació i on s'editen els personatges, els mitjans i el guió.
 *
 * Tenir-ne una còpia al disc és a posta: el lloc s'ha de poder construir sense
 * xarxa i sense dependre que un altre repositori estigui disponible el dia del
 * desplegament. El preu d'una còpia és que divergeix, i el que evita això és
 * aquest fitxer:
 *
 *   node tools/sync.js            baixa la versió de dalt i la desa
 *   node tools/sync.js --check    falla si la còpia d'aquí no és la de dalt
 *
 * La mateixa setmana es mira l'altra còpia que ve de dalt: el codi de la firma
 * de `personatges.html` contra el de `SOS/online.html` (veda 71). No es compara
 * el text, que no és igual, sinó el que fan amb les fitxes de `firma.js`. Si
 * divergeix no es pot arreglar sol: cal portar el canvi a `tools/build.js`.
 *
 * El `--check` no corre a cada empenta sinó un cop per setmana
 * (`.github/workflows/sync.yml`), perquè una guarda que depèn de la xarxa
 * fallant un dimarts a la tarda no vol dir que el codi estigui malament.
 *
 * La branca de dalt es tria amb `UPSTREAM_REF`; per defecte, `main`.
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { daqui, dedalt, casos } = require('./firma.js');

const ARREL = join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const REF = process.env.UPSTREAM_REF || 'main';
const FONT = `https://raw.githubusercontent.com/asolache/teamtowershuma/${REF}/SOS/molekulon-data.json`;
const CAMI = join(ARREL, 'data', 'comando.json');
const FONT_FIRMA = `https://raw.githubusercontent.com/asolache/teamtowershuma/${REF}/SOS/online.html`;

const fi = (codi, msg) => { console.log(msg); process.exit(codi); };

/* Les fitxes es fabriquen dues vegades, una amb el codi de cada banda: així una
   divergència a `canon` o a `didDe` no s'amaga darrere d'unes fitxes que les
   dues bandes llegeixen igual de malament. */
async function firma() {
  console.log(`\nLa firma del SOS · ${FONT_FIRMA}`);
  let html;
  try {
    const r = await fetch(FONT_FIRMA);
    if (!r.ok) return console.log(`  ✗ no s'ha pogut llegir la font (HTTP ${r.status}).`), false;
    html = await r.text();
  } catch (e) {
    return console.log(`  ✗ no s'ha pogut arribar a la font: ${e.message}`), false;
  }
  let aqui, dalt;
  try { aqui = daqui(); dalt = dedalt(html); } catch (e) {
    return console.log(`  ✗ ${e.message}. Si allà s'ha reanomenat, cal posar-ho al dia a \`tools/firma.js\`.`), false;
  }
  const diferents = [];
  for (const [qui, codi] of [['aquí', aqui], ['dalt', dalt]]) {
    for (const [diu, f] of await casos(codi)) {
      const [a, b] = [await aqui.valida(f), await dalt.valida(f)];
      if (a !== b) diferents.push(`${diu} (fitxa feta amb el codi de ${qui}): aquí ${a ? 'vàlida' : 'no'}, dalt ${b ? 'vàlida' : 'no'}`);
    }
  }
  if (diferents.length) {
    console.log('  ✗ el codi de la firma d\'aquí no fa el mateix que el de dalt:');
    for (const d of diferents) console.log('    · ' + d);
    console.log('    Porta el canvi de `SOS/online.html` a `canon`, `didDe` i `valida` de `tools/build.js`.');
    return false;
  }
  console.log('  ✓ «canon», «didDe» i «valida» fan el mateix que a dalt.');
  return true;
}

(async () => {
  const firmaBona = await firma();
  console.log(`\nDades del Comando · ${FONT}`);
  let dalt;
  try {
    const r = await fetch(FONT);
    if (!r.ok) fi(CHECK ? 1 : 1, `  ✗ no s'ha pogut llegir la font (HTTP ${r.status}). ` +
      (r.status === 404 ? `Mira si \`SOS/molekulon-data.json\` ja és a la branca \`${REF}\`.` : ''));
    dalt = await r.text();
  } catch (e) {
    fi(1, `  ✗ no s'ha pogut arribar a la font: ${e.message}`);
  }

  /* Es compara l'objecte i no el text: un salt de línia o l'ordre de dues claus
     no són una divergència, i una guarda que crida per això s'acaba ignorant. */
  const igual = (a, b) => JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(b));
  const hi_ha = existsSync(CAMI);

  if (CHECK) {
    if (!hi_ha) fi(1, '  ✗ no hi ha còpia local: corre `node tools/sync.js`');
    if (!igual(readFileSync(CAMI, 'utf8'), dalt)) {
      console.log('  ✗ la còpia d\'aquí no és la de dalt.');
      console.log('    Corre `node tools/sync.js && node tools/build.js` i mira què ha canviat.');
      process.exit(1);
    }
    console.log('  ✓ la còpia d\'aquí és la de dalt.');
    fi(firmaBona ? 0 : 1, firmaBona ? '\n✅ Les dades i la firma quadren.' : '\n❌ Les dades quadren; la firma, no.');
  }

  if (hi_ha && igual(readFileSync(CAMI, 'utf8'), dalt)) fi(firmaBona ? 0 : 1, '  ✓ ja estava al dia. No s\'ha tocat res.');
  writeFileSync(CAMI, dalt);
  const d = JSON.parse(dalt);
  console.log(`  ✓ desat · ${d.herois.length} herois, ${d.videos.length} peces, ${d.intro.plans.length} plans`);
  console.log('\n➜ Ara corre `node tools/build.js` perquè les pàgines ho diguin.');
  process.exit(firmaBona ? 0 : 1);
})();
