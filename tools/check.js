#!/usr/bin/env node
/* La guarda de les promeses · el que no peta sol
 * ─────────────────────────────────────────────────────────────────────────────
 * `tools/build.js --check` comprova que les pàgines del disc siguin les que
 * surten de les dades. Això és necessari i no és suficient: el generador podria
 * escriure, tan contents, una pàgina sense `canonical`, un enllaç a un fitxer
 * que no hi és o una porta cap a `null`. Cap d'aquestes coses peta: la pàgina
 * es veu bé i el problema el troba un visitant.
 *
 * Aquestes són les set regles. Cadascuna tapa una manera concreta que això es
 * podria podrir en silenci.
 *
 *   node tools/check.js
 */
'use strict';
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { PAGINES, DOMINI, SOS, NUM } = require('./build.js');

const ARREL = join(__dirname, '..');
const D = JSON.parse(readFileSync(join(ARREL, 'data', 'comando.json'), 'utf8'));

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };
const pl = (n, u, m) => `${n} ${n === 1 ? u : m}`;

console.log('\nGuarda de molekulon.org · el que cap generador veurà mai');

const pag = Object.fromEntries(PAGINES.map(p => [p.f, existsSync(join(ARREL, p.f)) ? readFileSync(join(ARREL, p.f), 'utf8') : null]));
const faltants = PAGINES.filter(p => pag[p.f] === null).map(p => p.f);
if (faltants.length) {
  bad(`falten pàgines al disc: ${faltants.join(', ')}. Corre \`node tools/build.js\`.`);
  console.log('\n❌ 1 problema.');
  process.exit(1);
}

/* ── 1 · Cada pàgina es pot indexar i es pot compartir ────────────────────
   El mateix contingut existeix avui a teamtowershuma.com. Sense `canonical`,
   qui decideix quina de les dues surt a les cerques és un cercador, i no
   sempre tria la que volem. */
{
  const falta = [];
  for (const p of PAGINES) {
    const s = pag[p.f];
    for (const [q, r] of [['<title>', /<title>[^<]{10,}<\/title>/], ['description', /name="description" content="[^"]{40,}"/],
      ['canonical', /rel="canonical" href="https:\/\/[^"]+"/], ['og:title', /property="og:title"/],
      ['og:description', /property="og:description"/], ['og:url', /property="og:url"/], ['lang', /<html lang="ca">/]]) {
      if (!r.test(s)) falta.push(`${p.f} · ${q}`);
    }
  }
  falta.length ? bad(`${pl(falta.length, 'etiqueta', 'etiquetes')} de cap: ${falta.join(', ')}`)
    : ok(`les ${PAGINES.length} pàgines porten títol, descripció, canonical, Open Graph i llengua`);
}

/* ── 2 · Cap enllaç intern a un fitxer que no hi és ───────────────────────
   Un enllaç mort a la portada és el pitjor lloc possible per tenir-ne un. */
{
  const morts = [];
  for (const p of PAGINES) {
    for (const m of pag[p.f].matchAll(/href="\/([^"#?]*)"/g)) {
      const dest = m[1] === '' ? 'index.html' : (m[1].includes('.') ? m[1] : m[1] + '.html');
      if (!existsSync(join(ARREL, dest))) morts.push(`${p.f} → /${m[1]}`);
    }
  }
  morts.length ? bad(`${pl(morts.length, 'enllaç intern mort', 'enllaços interns morts')}: ${morts.join(', ')}`)
    : ok('cap enllaç intern apunta a un fitxer que no hi sigui');
}

/* ── 3 · Cap porta cap enlloc ─────────────────────────────────────────────
   Quatre peces de mitjans estan nomenades i no tenen adreça. Han de sortir
   —amagar-les seria fer veure que no existeixen— però no com un enllaç. */
{
  const buits = [];
  for (const p of PAGINES) {
    for (const m of pag[p.f].matchAll(/href="(null|undefined|#|)"/g)) buits.push(`${p.f} · href="${m[1]}"`);
  }
  /* Es compta la marca i no la frase: «encara no té adreça» surt també a la
     descripció de la pàgina, i comptar-hi faria que la guarda acusés d'un
     descuadre que no existeix. Una guarda que crida en fals s'acaba ignorant. */
  const marques = (pag['musica.html'].match(/<span class="est no">encara no té adreça<\/span>/g) || []).length;
  if (buits.length) bad(`${pl(buits.length, 'enllaç buit', 'enllaços buits')}: ${buits.join(', ')}`);
  else if (marques !== NUM.pendents) bad(`la banda marca ${marques} peces sense adreça i les dades en diuen ${NUM.pendents}`);
  else ok(`cap enllaç buit, i les ${NUM.pendents} peces sense adreça es diuen com el que són`);
}

/* ── 4 · Els catorze noms, i cap altre ────────────────────────────────────
   És la mateixa regla que al repositori de dalt: una sola llista de personatges.
   Un nom mal escrit aquí no peta res i es queda anys. */
{
  const s = pag['personatges.html'];
  const falten = D.herois.filter(h => !s.includes(`<h3>${h.name.replace(/&/g, '&amp;')}</h3>`)).map(h => h.name);
  const quants = (s.match(/<article class="heroi">/g) || []).length;
  if (falten.length) bad(`no surten a la pàgina: ${falten.join(', ')}`);
  else if (quants !== D.herois.length) bad(`${quants} fitxes pintades i ${D.herois.length} herois a les dades`);
  else ok(`els ${D.herois.length} herois de les dades surten, i no n'hi ha cap més`);
}

/* ── 5 · El guió sencer, i la durada que diu ──────────────────────────────
   Si un dia el guió creix i la pàgina segueix dient 1:55, la pàgina menteix
   amb un número, que és la pitjor manera de mentir. */
{
  const s = pag['peli.html'];
  const files = (s.match(/<td class="n">\d+<\/td>/g) || []).length;
  if (files !== NUM.plans) bad(`la taula del guió té ${files} files i el guió en té ${NUM.plans}`);
  else if (!s.includes(NUM.durada)) bad(`la pàgina no diu la durada que surt de les dades (${NUM.durada})`);
  else ok(`els ${NUM.plans} plans hi són, i la durada (${NUM.durada}) surt del guió`);
}

/* ── 6 · Les xifres grosses surten del model ──────────────────────────────
   150.000 és `COMANDO_TARGET` de l'aplicació. El dia que siguin 200.000 es
   canvia allà i aquí no s'ha de tocar res; si algú ho hagués escrit a mà,
   aquí hi hauria dues xifres i una seria falsa. */
{
  const objectiu = D.objectiu.toLocaleString('ca-ES').replace(/ | | /g, '.');
  const dolentes = [];
  for (const p of PAGINES) {
    for (const m of pag[p.f].matchAll(/\b\d{3}\.\d{3}\b/g)) if (m[0] !== objectiu) dolentes.push(`${p.f} · ${m[0]}`);
  }
  dolentes.length ? bad(`xifres de sis dígits que no són l'objectiu (${objectiu}): ${dolentes.join(', ')}`)
    : ok(`l'única xifra gran que es diu és l'objectiu del model: ${objectiu}`);
}

/* ── 7 · Cap enllaç de fora sense https, i cap al domini d'un mateix ──────
   Un enllaç absolut a molekulon.org dins de molekulon.org és una redirecció
   de franc i un canvi de domini el dia que se serveixi des d'un altre lloc. */
{
  const mal = [];
  for (const p of PAGINES) {
    /* Només els enllaços de navegar. El `canonical` i l'`og:url` **han** de
       portar el domini sencer: són precisament els que diuen quin domini mana. */
    for (const m of pag[p.f].matchAll(/<a [^>]*href="(http:\/\/[^"]+)"/g)) mal.push(`${p.f} · ${m[1]}`);
    for (const m of pag[p.f].matchAll(new RegExp(`<a [^>]*href="(${DOMINI}[^"]*)"`, 'g'))) mal.push(`${p.f} · ${m[1]}`);
  }
  mal.length ? bad(`enllaços per arreglar: ${mal.join(', ')}`)
    : ok(`res per http, i cap enllaç absolut al domini propi (${SOS} sí, que és una altra casa)`);
}

console.log(fails ? `\n❌ ${pl(fails, 'problema', 'problemes')}.` : '\n✅ La web compleix el que promet.');
process.exit(fails ? 1 : 0);
