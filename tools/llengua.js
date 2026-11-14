/* La web en castellà · una traducció, no una segona web
 * ─────────────────────────────────────────────────────────────────────────────
 * L'original és el català, i es queda sent l'únic que s'escriu. La versió en
 * castellà **no té generador propi**: és la mateixa pàgina que surt de
 * `tools/build.js`, passada per un diccionari (`data/es.json`) que tradueix
 * cada tros de text tal com surt a la pàgina.
 *
 * Per què així i no un segon joc de plantilles: dues plantilles divergeixen el
 * primer dia que algú en toca una i no l'altra, i una web amb dues versions que
 * diuen coses diferents menteix en una de les dues. Amb el diccionari, una frase
 * nova en català no pot arribar al castellà sense traducció **sense que ho
 * digui la guarda**: `tools/check.js` llista cada tros que falta, i també cada
 * entrada que ja no fa servir ningú.
 *
 *   node tools/llengua.js            què falta per traduir, a punt d'enganxar
 *
 * El que es tradueix:
 *   · el text entre etiquetes, i els atributs que es llegeixen (alt, title,
 *     aria-label, placeholder i el `content` de les meta de descripció);
 *   · les cadenes dels scripts de la pàgina (missatges, etiquetes del cromo);
 *   · el JSON-LD.
 * El que no es toca: el que va entre les dues marques `llengua:fixa` d'un
 * script (el kit escriu la fitxa en les dues llengües, triï qui triï), i el que
 * el diccionari declara `iguals` (noms propis, codi).
 */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const ES = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'es.json'), 'utf8'));
const IGUALS = new Set(ES.iguals || []);

/* ── Les adreces ─────────────────────────────────────────────────────────── */
const camí = (f, l) => (l === 'es' ? '/es' : '') + (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));

/* El selector. Diu la llengua amb el seu nom curt, com ja fa el kit
   (CAT · CAST), i la de la pàgina on ets no és un enllaç. */
const selector = (f, l) => `<span class="idioma" role="group" aria-label="${l === 'es' ? 'Idioma' : 'Llengua'}">` +
  (l === 'ca' ? '<span class="l" lang="ca" aria-current="true">CAT</span>' : `<a class="l" href="${camí(f, 'ca')}" hreflang="ca" lang="ca">CAT</a>`) +
  (l === 'es' ? '<span class="l" lang="es" aria-current="true">CAST</span>' : `<a class="l" href="${camí(f, 'es')}" hreflang="es" lang="es">CAST</a>`) +
  '</span>';

/* Les alternatives, perquè un cercador sàpiga que són la mateixa pàgina en dues
   llengües i no dues pàgines que es copien. L'x-default és l'original. */
const alternatives = (f, domini) =>
  `<link rel="alternate" hreflang="ca" href="${domini}${camí(f, 'ca')}">\n` +
  `<link rel="alternate" hreflang="es" href="${domini}${camí(f, 'es')}">\n` +
  `<link rel="alternate" hreflang="x-default" href="${domini}${camí(f, 'ca')}">`;

/* ── Què és text i què és codi ───────────────────────────────────────────── */
const net = s => s.replace(/\s+/g, ' ').trim();
const ésText = s => /\p{L}{2}/u.test(s);
/* Dins d'un script, una cadena és text si té dues paraules seguides, o si és
   una paraula amb majúscula inicial (les etiquetes: «Curt», «Antifaç»), o una
   paraula sencera en majúscules (SUPERPODERS). La resta és codi. */
const ésFrase = s => !/[<>{}=;\\]|^#|^https?:|^\.|px |rgba\(|^[a-z0-9_-]+$/.test(s) &&
  (/\p{L}{2,}[ ,.:'’«»…]+\p{L}/u.test(s) || /^\p{Lu}\p{Ll}+[…]?$/u.test(s) || /^\p{Lu}{8,}$/u.test(s));

/* ── La traducció d'una pàgina ───────────────────────────────────────────── */
function tradueix(f, html, { pagines, domini }) {
  const falten = new Map(), usats = new Set(), codi = [];
  const tr = (s, on) => {
    const k = net(s);
    if (IGUALS.has(k)) { usats.add('=' + k); return null; }
    if (Object.prototype.hasOwnProperty.call(ES.textos, k)) { usats.add(k); return ES.textos[k]; }
    if (!falten.has(k)) falten.set(k, on);
    return null;
  };
  const ambEspais = (s, t) => t === null ? s : s.match(/^\s*/)[0] + t + s.match(/\s*$/)[0];

  /* Les cadenes d'un script. Els comentaris es salten sencers: hi ha
     apòstrofs que, si no, semblarien el començament d'una cadena. */
  const script = js => js.replace(/\/\* llengua:fixa \*\/[\s\S]*?\/\* \/llengua:fixa \*\/|\/\*[\s\S]*?\*\/|"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g, (m, dq, sq) => {
    const s = dq !== undefined ? dq : sq;
    if (s === undefined || !ésFrase(s)) return m;
    const t = tr(s, f + ' · script');
    if (t === null) return m;
    const q = dq !== undefined ? '"' : "'";
    return q + ambEspais(s, t).replace(/\\/g, '\\\\').split(q).join('\\' + q) + q;
  });

  const ld = j => {
    const o = JSON.parse(j);
    const passa = v => typeof v === 'string' ? (ésText(v) && / /.test(v) ? (tr(v, f + ' · JSON-LD') ?? v) : v)
      : Array.isArray(v) ? v.map(passa) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, passa(x)])) : v;
    const r = passa(o);
    r.inLanguage = 'es';
    if (r.url) r.url = r.url.replace(domini, domini + '/es').replace(/\/es\/$/, '/es/');
    return JSON.stringify(r);
  };

  /* Els enllaços a una pàgina que té versió en castellà hi van en castellà;
     les imatges relatives passen a absolutes, perquè /es/ és una carpeta. */
  const ambEs = new Set(pagines.map(p => camí(p, 'ca')));
  const enllaços = h => h
    .replace(/href="(\/[a-z-]*)((?:[#?][^"]*)?)"/g, (m, p, resta) => ambEs.has(p) ? `href="${camí(p === '/' ? 'index.html' : p.slice(1) + '.html', 'es')}${resta}"` : m)
    .replace(/(src|href)="(?![a-z]+:|\/|#|')([^"]+)"/g, '$1="/$2"');

  const html2 = h => enllaços(h)
    .replace(/(\b(?:alt|title|aria-label|placeholder)=")([^"]*)(")/g,
      (m, a, v, b) => ésText(v) ? a + (tr(v, f + ' · atribut') ?? v) + b : m)
    .replace(/(<meta (?:name="description"|property="og:(?:title|description)") content=")([^"]*)(")/g, (m, a, v, b) => a + (tr(v, f + ' · meta') ?? v) + b)
    .replace(/>([^<>]+)</g, (m, s) => ésText(s) && !/^\s*$/.test(s) ? '>' + ambEspais(s, tr(s, f)) + '<' : m);

  /* El selector es canvia abans de traduir res: és el mateix en les dues
     llengües i el seu enllaç a la catalana no s'ha de reescriure. */
  const MARCA = '\u0000\u0001\u0000';
  html = html.replace(selector(f, 'ca'), MARCA);

  /* La pàgina a trossos: el que és script, el que és estil i el que és HTML. */
  let out = html.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)|(<style>[\s\S]*?<\/style>)|([\s\S]+?)(?=<script|<style>|$)/g, (m, o, js, c, st, h) => {
    if (st) return st;
    if (o) return /ld\+json/.test(o) ? o + ld(js) + c : o + script(js) + c;
    return html2(h);
  });

  /* La capçalera i el selector, que no són text. */
  const domEs = domini + camí(f, 'es');
  out = out
    .replace('<html lang="ca">', '<html lang="es">')
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${domEs}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${domEs}$2`)
    .replace('<meta property="og:locale" content="ca_ES">', '<meta property="og:locale" content="es_ES">')
    .replace(MARCA, selector(f, 'es'));

  /* Els canvis de codi de cada pàgina (la llengua per defecte del kit). Cada
     un ha de trobar el seu lloc exactament una vegada: si el codi de la pàgina
     canvia i un canvi deixa de quadrar, la guarda ho diu. */
  for (const [de, a] of (ES.codi && ES.codi[f]) || []) {
    const n = out.split(de).length - 1;
    if (n !== 1) codi.push(`${f} · «${de}» surt ${n} vegades`);
    else out = out.replace(de, a);
  }
  return { html: out, falten, usats, codi };
}

/* El que el diccionari porta i ningú fa servir: una frase que ja no és a cap
   pàgina. Es diu perquè el diccionari no s'ompli de restes. */
const sobrants = usats => [
  ...Object.keys(ES.textos).filter(k => !usats.has(k)),
  ...[...IGUALS].filter(k => !usats.has('=' + k)).map(k => '= ' + k)
];

module.exports = { camí, selector, alternatives, tradueix, sobrants, ES };

if (require.main === module) {
  const { castella } = require('./build.js');
  const { falten, usats, codi } = castella();
  const obj = Object.fromEntries([...falten.keys()].map(k => [k, '']));
  console.log(JSON.stringify(obj, null, 2));
  const s = sobrants(usats);
  console.error(`\n${falten.size} per traduir · ${s.length} sobrants · ${codi.length} canvis de codi que no quadren`);
  if (s.length) console.error('Sobrants:\n  ' + s.join('\n  '));
  if (codi.length) console.error(codi.join('\n'));
}
