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
 * El `--check` no corre a cada empenta sinó un cop per setmana
 * (`.github/workflows/sync.yml`), perquè una guarda que depèn de la xarxa
 * fallant un dimarts a la tarda no vol dir que el codi estigui malament.
 *
 * La branca de dalt es tria amb `UPSTREAM_REF`; per defecte, `main`.
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const REF = process.env.UPSTREAM_REF || 'main';
const FONT = `https://raw.githubusercontent.com/asolache/teamtowershuma/${REF}/SOS/molekulon-data.json`;
const CAMI = join(ARREL, 'data', 'comando.json');

const fi = (codi, msg) => { console.log(msg); process.exit(codi); };

(async () => {
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
    fi(0, '  ✓ la còpia d\'aquí és la de dalt.\n\n✅ Les dades quadren.');
  }

  if (hi_ha && igual(readFileSync(CAMI, 'utf8'), dalt)) fi(0, '  ✓ ja estava al dia. No s\'ha tocat res.');
  writeFileSync(CAMI, dalt);
  const d = JSON.parse(dalt);
  console.log(`  ✓ desat · ${d.herois.length} herois, ${d.videos.length} peces, ${d.intro.plans.length} plans`);
  console.log('\n➜ Ara corre `node tools/build.js` perquè les pàgines ho diguin.');
})();
