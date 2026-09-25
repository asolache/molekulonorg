#!/usr/bin/env node
/* Les pàgines de molekulon.org, escrites des de les dades i no a mà
 * ─────────────────────────────────────────────────────────────────────────────
 * Aquest repositori no té contingut propi: el té `data/comando.json`, que surt
 * de `SOS/tools/build-comando.js` del repositori teamtowershuma i que aquí no
 * s'edita mai (`tools/sync.js` el baixa i el compara).
 *
 * Per tant les pàgines es generen. La raó no és elegància: és que els catorze
 * herois, les disset peces de mitjans i els quinze plans del guió ja viuen en
 * un lloc, i una segona còpia escrita a mà no peta quan divergeix — només fa
 * que la web pública digui una cosa que l'aplicació ja no diu.
 *
 * Tres regles que la resta del fitxer obeeix:
 *
 * · **Una peça sense enllaç no es pinta com una porta.** Es pinta dient que
 *   encara no hi és. Prometre una porta tancada és pitjor que no tenir-la.
 * · **Cap xifra escrita a mà.** 150.000, 14, 17, 15, 1:55 — totes surten del
 *   JSON. Si un dia canvien allà, canvien aquí sense que ningú se'n recordi.
 * · **Cap pàgina sense `canonical`.** El mateix contingut existeix avui a
 *   teamtowershuma.com i els cercadors han de saber quin dels dos mana.
 *
 *   node tools/build.js            escriu les pàgines i el sitemap
 *   node tools/build.js --check    falla si el que hi ha al disc està vell
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const D = JSON.parse(readFileSync(join(ARREL, 'data', 'comando.json'), 'utf8'));

/* El domini propi i la casa d'on venim. El SOS segueix sent l'aplicació i el
   lloc de les eines: des d'aquí s'hi enllaça, no se'n copia res. */
const DOMINI = 'https://molekulon.org';
const SOS = 'https://teamtowershuma.com';

/* ══ LES PÀGINES ═════════════════════════════════════════════════════════════
   Quatre, i no dotze. El pla en preveu dotze i les altres vuit necessiten
   material que encara no hi és —imatges del còmic, dades legals, enllaços de
   compra—; publicar-les buides seria vendre una casa amb les habitacions
   pintades i sense terra. El menú només porta el que existeix. */
const PAGINES = [
  { f: 'index.html', nav: 'Inici', t: 'Comando Molekulon',
    tit: 'Comando Molekulon · la primera pel·lícula que farem 150.000 persones',
    desc: 'Un còmic, una banda i una pel·lícula que encara no existeix. Es farà amb 150.000 superherois reals: gent que aporta hores, objectes i coneixement al seu barri i que ho registra.' },
  { f: 'personatges.html', nav: 'Els personatges', t: 'Els personatges',
    tit: 'Els personatges · Comando Molekulon',
    desc: 'Els catorze herois canònics del Comando: el seu poder al còmic, la seva superarma i què vol dir cadascun dins d\'un equip de debò.' },
  { f: 'peli.html', nav: 'La pel·lícula', t: 'La pel·lícula',
    tit: 'La pel·lícula · Comando Molekulon',
    desc: 'El guió de la intro, pla a pla: què està filmat, què s\'ha de filmar i d\'on surt cada imatge. Un esborrany per corregir, no un guió tancat.' },
  { f: 'musica.html', nav: 'La banda', t: 'La banda',
    tit: 'La banda · Comando Molekulon',
    desc: 'Els capítols, els videoclips, els temes i els directes del Comando. I el que encara no té adreça, dit com el que és.' }
];

/* Les pàgines que encara viuen al SOS. S'enllacen amb el seu domini sencer i
   marcades, perquè qui hi clica ha de saber que canvia de casa. */
const AL_SOS = [
  { h: '/molekulandia', ic: '🏘', t: 'Molekulandia',
    d: 'El poble sencer: onze edificis on entrar i nou professions. El bar és el banc de temps i la ferreteria, la biblioteca de les coses.' },
  { h: '/molekulon', ic: '💧', t: 'Un estat líquid',
    d: 'Set federacions, onze cases i un esquelet de 19 nodes contra els 47 d\'un país sòlid. El món és una dada, i això ho demostra amb números.' },
  { h: '/escola', ic: '🏭', t: 'La Fàbrica de Superherois',
    d: 'El Comando a l\'aula, de 6 a 13 anys. Dues accions, guia metodològica i què es mira i què no a l\'avaluació.' },
  { h: '/formacio', ic: '🎓', t: 'Formació',
    d: 'Setze mòduls de N0 a N3, amb un itinerari sencer de Comando, reputació i multivers narratiu.' },
  { h: '/banc-temps', ic: '⏳', t: 'El Banc de Temps',
    d: 'Els superpoders, comptats: una hora val una hora, i el saldo que ho diu.' },
  { h: '/biblioteca', ic: '🔧', t: 'La Biblioteca de les Coses',
    d: 'Les superarmes, compartides: donar o deixar, i què val cada préstec.' },
  { h: '/joc', ic: '🎮', t: 'El joc', d: 'Planta, defensa i activa el territori, a ritme.' },
  { h: '/blog', ic: '📖', t: 'El blog del Comando', d: 'D\'on surt tot això, explicat una entrada per idea.' }
];

/* ══ EINES ═══════════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mil = n => n.toLocaleString('ca-ES').replace(/ | | /g, '.');
const mmss = t => `${t / 60 | 0}:${String(t % 60).padStart(2, '0')}`;
const url = f => f === 'index.html' ? DOMINI + '/' : `${DOMINI}/${f.replace(/\.html$/, '')}`;

/* ══ PER A QUÈ SERVEIX ═══════════════════════════════════════════════════════
   Els sis eixos diuen **de què està fet** el projecte. Cap d'ells diu **per a
   què serveix**, i qui arriba es fa aquesta pregunta abans que cap altra.

   El to no és el d'un cartell d'autoajuda. La guia de marca prohibeix les
   exclamacions i els superlatius sense prova, i amb motiu: una web que crida
   que et canviarà la vida es llegeix com un anunci. El que motiva d'això no és
   l'entusiasme sinó la concreció — que el que et demana es pot fer aquesta
   setmana i que el que promet es pot comprovar. Per això les tres caselles són
   verbs i no adjectius. */
const PROPOSIT = {
  crida: 'Tothom té un superpoder. El que sol faltar és on descobrir-lo, i a qui li serveix.',
  titol: 'Per a què serveix, de debò',
  entrada: 'Que cadascú <b>descobreixi el seu superheroi</b> i el posi a treballar al seu barri. ' +
    'Multiplicat per prou gent, això té nom: una <b>societat del benestar a la molekulandesa</b> — ' +
    'la que no s\'espera que la porti ningú, perquè se sosté amb el que els veïns ja saben fer.',
  passes: [
    { ic: '🔎', t: 'Descobreix què saps fer',
      d: 'Ningú neix sabent quins són els seus. Per això hi ha aula, kit narratiu i un cromo que s\'omple: <b>un talent que no s\'ha nomenat no es pot oferir</b>.' },
    { ic: '🤝', t: 'Posa\'l on serveixi a algú',
      d: 'Un talent que no surt de casa no és un superpoder. Aportar-lo, i que algú altre ho confirmi, <b>és el que et fa la fitxa</b>.' },
    { ic: '🌱', t: 'I el benestar surt d\'aquí',
      d: 'Hores, objectes i saber que ja són al barri, comptats i tornats. No és caritat ni voluntariat: <b>és valor que circula i que es pot comprovar</b>.' }
  ]
};

/* ══ EL VÍDEO DE FONS DE LA PORTADA ══════════════════════════════════════════
   La portada s'obre amb el videoclip d'Horacio Motomachi corrent al darrere.
   No és decoració: el pla 1 del guió i el tema que obre la intro són aquest
   vídeo, i qui arriba ha de veure de seguida que això ja existeix en imatge i
   en so, no només en text.

   Tres decisions que van amb això:

   · **L'adreça surt de les dades, com tota la resta.** Es busca la peça pel
     seu `id` i se n'extreu l'identificador. Si un dia aquella peça canvia
     d'adreça o desapareix de la llista, la portada es queda amb el degradat de
     sempre en comptes d'ensenyar un reproductor trencat.
   · **`youtube-nocookie.com`.** És el mateix reproductor sense la galeta de
     seguiment que posa el domini normal. Un projecte que promet que no es
     recull res de ningú no pot obrir-se amb una pantalla que sí que ho fa.
   · **Silenciat, sense controls i sense clic.** Un vídeo que sona sol a la
     primera pantalla fa tancar la pestanya. El vídeo sencer, amb so, té el seu
     enllaç a sota i a la pàgina de la banda. */
const idYouTube = u => (String(u).match(/(?:youtu\.be\/|embed\/|[?&]v=)([A-Za-z0-9_-]{11})/) || [])[1] || null;
const FONS = (() => {
  const v = D.videos.find(x => x.id === 'horacio-clip' && x.url);
  const id = v && idYouTube(v.url);
  return id ? { id, titol: v.titol, url: v.url, qui: v.qui[0] || v.titol } : null;
})();

/* Les xifres. Totes derivades: cap número d'aquest fitxer s'escriu dues vegades. */
const NUM = {
  objectiu: D.objectiu,
  herois: D.herois.length,
  peces: D.videos.length,
  publicades: D.videos.filter(v => v.url).length,
  pendents: D.videos.filter(v => !v.url).length,
  plans: D.intro.plans.length,
  filmats: D.intro.plans.filter(p => p.de).length,
  durada: mmss(D.intro.durada)
};

/* ══ L'ESTIL ═════════════════════════════════════════════════════════════════
   Un sol full, incrustat a cada pàgina. Són quatre pàgines autocontingudes:
   un fitxer CSS a part seria una petició més i un fitxer més per desincronitzar
   -se, i el que hi ha aquí cap de sobres a la primera pantalla. */
const CSS = `
:root{--bg:#0b0b12;--panel:#141420;--card:#1a1a28;--text:#f5f5f7;--muted:#82828d;--light:#c7c7d1;
  --purple:#e040fb;--blue:#00b0ff;--green:#00e676;--orange:#ff9100;--gold:#ffd700;
  --border:rgba(255,255,255,.09);--mono:'SF Mono',Monaco,Consolas,monospace}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);line-height:1.55;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
img{max-width:100%}
a{color:var(--blue)}
h1,h2,h3,h4{line-height:1.2;margin:0}
.skip{position:absolute;left:-9999px}
.skip:focus{left:.6rem;top:.6rem;background:var(--purple);color:#0b0b12;padding:.5rem .9rem;border-radius:8px;z-index:9}

nav.barra{display:flex;gap:.2rem;flex-wrap:wrap;align-items:center;
  padding:.6rem 1.2rem;border-bottom:1px solid var(--border);background:var(--panel);position:sticky;top:0;z-index:5}
nav.barra .marca{font-weight:800;letter-spacing:-.02em;margin-right:.8rem;text-decoration:none;color:var(--text)}
nav.barra .marca span{color:var(--purple)}
nav.barra a.l{text-decoration:none;color:var(--light);font-size:.86rem;padding:.35rem .7rem;border-radius:8px}
nav.barra a.l:hover{background:var(--card);color:var(--text)}
nav.barra a.l[aria-current]{background:var(--card);color:var(--text);font-weight:700}
nav.barra .dret{margin-left:auto;font-size:.82rem}

.hero{padding:3.2rem 1.5rem 2rem;text-align:center;position:relative;overflow:hidden;isolation:isolate;
  background:radial-gradient(ellipse at top,rgba(224,64,251,.16),transparent 60%),
             radial-gradient(ellipse at bottom right,rgba(0,176,255,.13),transparent 55%),var(--bg)}
.hero-inner{max-width:880px;margin:0 auto}

/* El vídeo de fons. La caixa cobreix la capçalera sencera i el vel el fa
   llegible: un text blanc damunt d'un videoclip de colors saturats no es llegeix
   a ple sol, i aquesta és la primera frase que llegeix tothom. */
.fons{position:absolute;inset:0;z-index:-2;overflow:hidden;pointer-events:none;background:#000}
.fons iframe{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:100vw;height:56.25vw;min-height:100%;min-width:177.78vh;border:0}
.vel{position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(180deg,rgba(11,11,18,.88) 0%,rgba(11,11,18,.74) 40%,rgba(11,11,18,.97) 100%)}
.hero.fosc{padding-top:4rem}
.credit{margin:1.1rem 0 0;font-size:.78rem;color:var(--muted)}
.credit a{color:var(--light)}

/* Dos casos on el vídeo no es carrega, i cap dels dos és una avaria:
   qui ha demanat menys moviment al sistema operatiu, i qui ho obre amb dades
   mòbils. Els dos es queden amb el degradat, que ja era la portada d'abans. */
@media (prefers-reduced-motion:reduce){.fons{display:none}}
@media (max-width:700px){.fons,.vel{display:none}}
.tag{display:inline-block;background:rgba(224,64,251,.14);color:var(--purple);padding:.3rem .8rem;border-radius:20px;
  font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:1rem}
.hero h1{font-size:clamp(1.9rem,5.2vw,3.1rem);margin:0 0 .9rem;font-weight:800;line-height:1.06}
.hero h1 em{font-style:normal;background:linear-gradient(90deg,#e040fb,#00b0ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero .sub{font-size:clamp(1rem,2.1vw,1.15rem);color:var(--light);max-width:740px;margin:0 auto}
.hero .sub strong{color:var(--text)}
.crida{font-size:clamp(1rem,2.3vw,1.22rem);font-weight:600;color:var(--text);margin:1.2rem auto 0;max-width:640px}
.crida b{background:linear-gradient(90deg,#e040fb,#00b0ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.acts{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;margin-top:1.4rem}
.acts a{text-decoration:none;font-size:.88rem;font-weight:600;padding:.6rem 1.1rem;border-radius:10px;
  border:1px solid var(--border);background:var(--card);color:var(--text)}
.acts a.pri{background:var(--purple);border-color:var(--purple);color:#0b0b12}

.wrap{max-width:1060px;margin:0 auto;padding:0 1.2rem 4rem}
.avis{max-width:880px;margin:1.4rem auto 0;padding:.7rem 1rem;border:1px solid var(--border);
  border-left:3px solid var(--orange);border-radius:8px;background:var(--panel);
  font-size:.82rem;color:var(--light);text-align:left}
.avis strong{color:var(--text)}

section.box{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:1.1rem 1.2rem;margin:1rem 0}
section.box h2{font-size:1.15rem;margin-bottom:.5rem}
section.box h3{font-size:1.02rem;margin-bottom:.5rem}
.lead{color:var(--light);font-size:.9rem;margin:.2rem 0 .9rem}
.lead strong,.lead b{color:var(--text)}
.mut{color:var(--muted);font-size:.78rem}
.mono{font-family:var(--mono)}

/* El propòsit. Es distingeix de la resta de caixes a posta: és l'única que no
   informa de res —diu per a què és tot plegat— i si es veiés igual que les
   altres es llegiria com una més i se saltaria. */
section.box.proposit{border-left:3px solid var(--purple);
  background:linear-gradient(120deg,rgba(224,64,251,.08),rgba(0,176,255,.05) 60%,transparent),var(--panel)}
section.box.proposit h2{font-size:clamp(1.2rem,2.6vw,1.5rem)}
.gran{font-size:clamp(.98rem,2vw,1.1rem);color:var(--light);margin:.5rem 0 1rem;max-width:760px}
.gran b{color:var(--text)}
.passa{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.85rem .9rem}
.passa .ic{font-size:1.4rem;line-height:1}
.passa h3{font-size:.98rem;margin:.35rem 0 .3rem}
.passa p{margin:0;font-size:.85rem;color:var(--light)}
.passa p b{color:var(--text)}

.xifres{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin:1.2rem 0}
.xifra{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.8rem .9rem}
.xifra b{display:block;font-size:1.5rem;font-family:var(--mono);color:var(--purple);line-height:1.1}
.xifra span{font-size:.78rem;color:var(--muted)}

.graella{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.7rem;margin:.9rem 0}
.fitxa{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.85rem .9rem}
.fitxa .ic{font-size:1.3rem;line-height:1}
.fitxa h3{font-size:.98rem;margin:.35rem 0 .3rem}
.fitxa p{margin:.2rem 0;font-size:.84rem;color:var(--light)}
.fitxa a{font-size:.82rem;font-weight:600;text-decoration:none}
.fitxa .k{font-family:var(--mono);font-size:.64rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}

.heroi{background:var(--card);border:1px solid var(--border);border-top:2px solid var(--purple);
  border-radius:12px;padding:.9rem}
.heroi h3{font-size:1rem}
.heroi .rol{color:var(--purple);font-size:.8rem;font-weight:600;margin:.15rem 0 .5rem}
.heroi dl{margin:0;font-size:.83rem}
.heroi dt{font-family:var(--mono);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:.45rem}
.heroi dd{margin:.1rem 0 0;color:var(--light)}
.heroi .lletra{font-style:italic;color:var(--light);font-size:.82rem;border-left:2px solid var(--border);padding-left:.55rem;margin-top:.6rem}

.taula{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;font-size:.83rem}
th,td{padding:.5rem .55rem;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}
th{color:var(--muted);font-weight:600;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
td.n,th.n{text-align:right;font-family:var(--mono);white-space:nowrap}
tr.te td{background:rgba(0,230,118,.06)}

.est{font-size:.66rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:.13rem .45rem;border-radius:20px;white-space:nowrap}
.est.si{background:rgba(0,230,118,.16);color:var(--green)}
.est.no{background:rgba(255,145,0,.16);color:var(--orange)}

.nota{font-size:.84rem;color:var(--light);border-left:2px solid var(--border);padding-left:.65rem;margin:.8rem 0}
.nota b{color:var(--text)}

footer{border-top:1px solid var(--border);background:var(--panel);padding:1.6rem 1.2rem 2.4rem}
footer .f{max-width:1060px;margin:0 auto;font-size:.82rem;color:var(--muted);display:flex;gap:1.2rem;flex-wrap:wrap}
footer a{color:var(--light)}
@media (max-width:560px){nav.barra{padding:.5rem .7rem}nav.barra .dret{display:none}}
`.trim();

/* ══ L'ESQUELET ══════════════════════════════════════════════════════════════ */
const nav = actual => `<nav class="barra" aria-label="Principal">
<a class="marca" href="/">Comando <span>Molekulon</span></a>
${PAGINES.map(p => `<a class="l" href="${p.f === 'index.html' ? '/' : '/' + p.f.replace(/\.html$/, '')}"${p.f === actual ? ' aria-current="page"' : ''}>${esc(p.nav)}</a>`).join('\n')}
<a class="l dret" href="${SOS}/sos" rel="noopener">Obre el SOS ↗</a>
</nav>`;

const peu = `<footer>
<div class="f">
<span>Comando Molekulon · un projecte de <a href="${SOS}" rel="noopener">TeamTowers Humà</a></span>
<span>L'eina que hi ha a sota és el <a href="${SOS}/sos" rel="noopener">SOS</a>, i és lliure</span>
<span class="mut">Aquesta web es genera de les dades, no s'escriu a mà.</span>
</div>
</footer>`;

const jsonld = p => JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: p.t,
  description: p.desc,
  url: url(p.f),
  inLanguage: 'ca',
  isPartOf: { '@type': 'WebSite', name: 'Comando Molekulon', url: DOMINI + '/' },
  publisher: { '@type': 'Organization', name: 'TeamTowers Humà', url: SOS }
});

const pagina = (p, cos) => `<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.tit)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url(p.f)}">
<meta property="og:title" content="${esc(p.tit)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url(p.f)}">
<meta property="og:locale" content="ca_ES">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonld(p)}</script>
<style>
${CSS}
</style>
</head>
<body>
<a class="skip" href="#principal">Ves al contingut</a>
${nav(p.f)}
<main id="principal">
${cos}
</main>
${peu}
</body>
</html>
`;

/* ══ PORTADA ═════════════════════════════════════════════════════════════════ */
/* La tesi surt del JSON tal com està escrita a l'altre repositori, amb els seus
   enllaços interns. Aquí aquells enllaços apunten a pàgines que encara són al
   SOS, i per això es reescriuen abans de pintar-los: una portada amb un enllaç
   mort és el pitjor lloc possible per tenir-ne un. */
const cap = txt => txt
  .replace(/href="molekulandia\.html"/g, `href="${SOS}/molekulandia"`)
  .replace(/href="index\.html#\/([a-z]+)"/g, `href="${SOS}/sos#/$1"`)
  .replace(/href="([a-z-]+)\.html"/g, `href="${SOS}/$1"`);

const fonsHtml = () => FONS ? `
<div class="fons" aria-hidden="true">
<iframe title="${esc(FONS.titol)}" tabindex="-1" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"
 src="https://www.youtube-nocookie.com/embed/${FONS.id}?autoplay=1&amp;mute=1&amp;loop=1&amp;playlist=${FONS.id}&amp;controls=0&amp;rel=0&amp;modestbranding=1&amp;playsinline=1&amp;disablekb=1&amp;iv_load_policy=3"></iframe>
</div>
<div class="vel" aria-hidden="true"></div>` : '';

const portada = () => `
<header class="hero${FONS ? ' fosc' : ''}">
${fonsHtml()}
<div class="hero-inner">
<span class="tag">${esc(D.tesi.entrada)}</span>
<h1><em>${esc(D.tesi.titol)}</em></h1>
<p class="sub">${cap(D.tesi.sub)}</p>
<p class="crida">${PROPOSIT.crida}</p>
<div class="acts">
<a class="pri" href="${SOS}/sos#/alta">Fes el teu personatge</a>
<a href="/personatges">Els ${NUM.herois} personatges</a>
<a href="/peli">El guió de la intro</a>
</div>
${FONS ? `<p class="credit">De fons, el videoclip de <b>${esc(FONS.qui)}</b> —el tema que obre la intro—,
sense so i sense controls. <a href="${FONS.url}" rel="noopener">Mira'l sencer ↗</a></p>` : ''}
<p class="avis"><strong>Aquesta web s'està muntant.</strong> El projecte té deu anys de
material —dos còmics, una banda, ${NUM.publicades} peces publicades i un programa d'aula—
i fins ara vivia dins d'una eina de gestió. Aquí s'hi està traslladant. El que
encara no s'hi ha mogut porta enllaç al lloc on és, i el que encara no existeix
ho diu.</p>
</div>
</header>

<div class="wrap">

<section class="box proposit">
<h2>${esc(PROPOSIT.titol)}</h2>
<p class="gran">${PROPOSIT.entrada}</p>
<div class="graella">
${PROPOSIT.passes.map(x => `<div class="passa">
<div class="ic">${x.ic}</div>
<h3>${esc(x.t)}</h3>
<p>${x.d}</p>
</div>`).join('\n')}
</div>
<p class="nota"><b>Molekulandia</b> és el poble on això ja està dibuixat: onze edificis
on entrar i nou professions, i cap d'ells és un despatx.
<a href="${SOS}/molekulandia" rel="noopener">Mira com és ↗</a></p>
</section>

<div class="xifres">
<div class="xifra"><b>${mil(NUM.objectiu)}</b><span>superherois que falten. El comptador de debò és el registre públic, i comença a zero a posta.</span></div>
<div class="xifra"><b>${NUM.herois}</b><span>personatges canònics, amb el seu poder i la seva superarma</span></div>
<div class="xifra"><b>${NUM.publicades}</b><span>peces publicades entre capítols, videoclips, temes i directes</span></div>
<div class="xifra"><b>${NUM.plans}</b><span>plans escrits de la intro · ${NUM.durada} · ${NUM.filmats} ja tenen material</span></div>
</div>

<section class="box">
<h2>De què està fet això</h2>
<p class="lead">Sis paraules que no volen dir res si no diuen <strong>on</strong> passen.
Cadascuna porta la pantalla on això és una cosa que es fa.</p>
<div class="graella">
${D.eixos.map(e => `<div class="fitxa">
<div class="ic">${e.ic}</div>
<h3>${esc(e.nom)}</h3>
<p>${cap(e.que)}</p>
</div>`).join('\n')}
</div>
</section>

<section class="box">
<h2>Com hi entra una persona</h2>
<p class="lead">Quatre passos, i cap d'ells demana un compte ni una contrasenya.
La clau te la fa el navegador i no surt del teu aparell.</p>
<div class="graella">
${D.passos.map(s => `<div class="fitxa">
<p class="k">Pas ${s.n}</p>
<div class="ic">${s.ic}</div>
<h3>${esc(s.t)}</h3>
<p>${cap(s.d)}</p>
<p><a href="${SOS}/sos#/${s.ruta}" rel="noopener">${esc(s.cta)} ↗</a></p>
</div>`).join('\n')}
</div>
<p class="nota">I el decorat és <b>${esc(D.decorat.t)}</b>: ${esc(D.decorat.d)}
<a href="${SOS}/molekulandia" rel="noopener">Obre el poble ↗</a></p>
</section>

<section class="box">
<h2>El que encara viu al SOS</h2>
<p class="lead">Aquestes pàgines existeixen i funcionen. Són al domini de
<strong>teamtowershuma.com</strong> mentre no es traslladin aquí; l'enllaç porta
a la de debò, no a una còpia.</p>
<div class="graella">
${AL_SOS.map(x => `<div class="fitxa">
<div class="ic">${x.ic}</div>
<h3>${esc(x.t)}</h3>
<p>${esc(x.d)}</p>
<p><a href="${SOS}${x.h}" rel="noopener">Obre-la ↗</a></p>
</div>`).join('\n')}
</div>
</section>

<section class="box">
<h2>El que aquesta web encara no té</h2>
<p class="lead">Dit aquí perquè es vegi, i no a una nota interna.</p>
<ul class="lead">
<li><b>Imatges.</b> Ni una vinyeta, ni una portada de còmic, ni un retrat. El material existeix en paper i encara no és aquí.</li>
<li><b>On es compren els còmics.</b> Se n'han publicat dos i aquesta web encara no diu on.</li>
<li><b>Qui ho signa.</b> Avís legal, contacte i llicència del que hi ha publicat.</li>
<li><b>${NUM.pendents} peces de mitjans</b> nomenades i sense adreça. Surten a <a href="/musica">la banda</a> dient-ho.</li>
</ul>
</section>

</div>`;

/* ══ ELS PERSONATGES ═════════════════════════════════════════════════════════ */
const personatges = () => `
<header class="hero">
<div class="hero-inner">
<span class="tag">El repartiment</span>
<h1>Els <em>${NUM.herois} personatges</em> canònics</h1>
<p class="sub">Cadascun porta tres coses: <strong>el seu poder al còmic</strong>,
<strong>la seva superarma</strong> i <strong>què vol dir dins d'un equip de debò</strong>.
La tercera és la que fa que aquest relat visqui dins d'una eina de gestió i no en un fullet a part.</p>
<p class="avis"><strong>El repartiment no està tancat.</strong> Aquests catorze són
els que surten als còmics i als vídeos. Els següents surten de qui hi entri: un personatge
del Comando és una persona de debò amb el que sap fer i el que pot deixar.</p>
</div>
</header>

<div class="wrap">
<div class="graella">
${D.herois.map(h => `<article class="heroi">
<h3>${esc(h.name)}</h3>
<p class="rol">${esc(h.role)}</p>
<dl>
<dt>Poder</dt><dd>${esc(h.power)}</dd>
<dt>Superarma</dt><dd>${esc(h.arma)}</dd>
<dt>En un equip</dt><dd>${esc(h.vna)}</dd>
<dt>On surt</dt><dd>${esc(h.on)}</dd>
</dl>
${h.lletra ? `<p class="lletra">${esc(h.lletra)}</p>` : ''}
</article>`).join('\n')}
</div>

<section class="box">
<h3>I el teu</h3>
<p class="lead">Nom, població, fins a cinc superpoders i les teves superarmes —el que
saps fer i el que pots deixar. Es fa al navegador, no puja enlloc i si te'n vas t'ho endús tot.</p>
<p><a href="${SOS}/sos#/alta" rel="noopener">Fes el teu personatge ↗</a></p>
</section>
</div>`;

/* ══ LA PEL·LÍCULA ═══════════════════════════════════════════════════════════ */
const peli = () => {
  const p = D.intro.plans;
  const perFilmar = p.filter(x => !x.de);
  return `
<header class="hero">
<div class="hero-inner">
<span class="tag">Esborrany de guió</span>
<h1>La intro, <em>pla a pla</em></h1>
<p class="sub">${NUM.plans} plans i ${NUM.durada}. <strong>${NUM.filmats} surten de
material que ja existeix</strong> i ${perFilmar.length} s'han de fer —la major part,
vinyetes ja dibuixades que s'han d'animar, no rodatge nou.</p>
<p class="avis"><strong>Això és un esborrany.</strong> La veu en off, els noms i
l'ordre són una proposta per corregir, no un guió tancat. Es publica igualment perquè
un guió que només veu qui l'escriu no el corregeix ningú.</p>
</div>
</header>

<div class="wrap">

<section class="box">
<h2>El mètode que hi ha a sota</h2>
<p class="lead">La història no és decoració. El que el Comando ensenya, dit sense
personatges, és que <strong>un superheroi és dues coses alhora</strong>: <b>sap què
sap fer</b> i <b>ho posa on serveixi a algú altre</b>. I la tercera peça, que és la
que fa que això no sigui només per a artistes: si no tens la creativitat, te la posa
una màquina.</p>
</section>

<section class="box">
<h2>El guió</h2>
<div class="taula">
<table>
<thead><tr><th class="n">#</th><th class="n">Temps</th><th>Pla</th><th>Imatge</th><th>Veu en off</th><th>D'on surt</th></tr></thead>
<tbody>
${(() => { let t = 0; return p.map(x => {
  const ini = t; t += x.s;
  return `<tr${x.de ? ' class="te"' : ''}>
<td class="n">${x.n}</td>
<td class="n">${mmss(ini)}–${mmss(t)}</td>
<td><b>${esc(x.titol)}</b>${x.retol ? `<br><span class="mut mono">${esc(x.retol)}</span>` : ''}</td>
<td>${esc(x.img)}</td>
<td>«${esc(x.veu)}»</td>
<td>${x.de ? `<span class="est si">material</span>` : '<span class="est no">a filmar</span>'}</td>
</tr>`; }).join('\n'); })()}
</tbody>
</table>
</div>
<p class="nota">Els plans marcats <b>material</b> surten de peces ja publicades — es
poden veure a <a href="/musica">la banda</a>. Els altres ${perFilmar.length} encara no existeixen.</p>
</section>

<section class="box">
<h2>El que falta per tenir-la</h2>
<p class="lead">Ordenat pel que costa, de menys a més.</p>
<ul class="lead">
<li><b>Dos plans són captura de pantalla</b> de l'aplicació amb els comptadors corrent: es poden gravar avui.</li>
<li><b>La major part de la resta és material del còmic</b>: vinyetes dibuixades que s'han d'animar o moure.</li>
<li><b>Tres plans necessiten rodatge nou</b> o muntatge d'arxiu que encara no s'ha triat.</li>
<li><b>I una veu.</b> El text hi és; qui el diu, encara no s'ha decidit.</li>
</ul>
</section>

</div>`;
};

/* ══ LA BANDA ════════════════════════════════════════════════════════════════ */
const MENA = { llista: 'La sèrie', videoclip: 'Videoclip', tema: 'Tema', directe: 'Directe' };
const musica = () => {
  const grup = k => D.videos.filter(v => v.mena === k);
  const bloc = k => {
    const l = grup(k); if (!l.length) return '';
    return `<section class="box">
<h2>${esc(MENA[k])}</h2>
<div class="graella">
${l.map(v => `<div class="fitxa">
<h3>${esc(v.titol)}</h3>
${v.qui.length ? `<p class="k">${v.qui.map(esc).join(' · ')}</p>` : ''}
<p>${esc(v.d)}</p>
${v.url
  ? `<p><a href="${v.url.startsWith('http') ? v.url : SOS + '/SOS/' + v.url}" rel="noopener">Obre ↗</a></p>`
  : '<p><span class="est no">encara no té adreça</span></p>'}
</div>`).join('\n')}
</div>
</section>`;
  };
  return `
<header class="hero">
<div class="hero-inner">
<span class="tag">Música i vídeo</span>
<h1>La banda del <em>Comando</em></h1>
<p class="sub">${NUM.publicades} peces publicades i ${NUM.pendents} que encara no tenen
adreça. <strong>Les segones també surten</strong>: una porta que no obre és pitjor que
no tenir-la, però amagar que existeix és pitjor que totes dues.</p>
<p class="avis">Mazinguer i Horacio Motomachi no tenien talents aparents, i van fer el
que fan els Blues Brothers: <strong>muntar una banda</strong> i recórrer els pobles per
trobar, un a un, els ${mil(NUM.objectiu)} superherois amagats a plena vista. La banda no
il·lustra el projecte: és com es recluta.</p>
</div>
</header>

<div class="wrap">
${['llista', 'videoclip', 'tema', 'directe'].map(bloc).join('\n')}
</div>`;
};

/* ══ EL SITEMAP ══════════════════════════════════════════════════════════════ */
const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGINES.map(p => `<url><loc>${url(p.f)}</loc></url>`).join('\n')}
</urlset>
`;

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
const COSSOS = { 'index.html': portada, 'personatges.html': personatges, 'peli.html': peli, 'musica.html': musica };
const sortida = () => {
  const l = PAGINES.map(p => [p.f, pagina(p, COSSOS[p.f]().trim())]);
  l.push(['sitemap.xml', sitemap()]);
  return l;
};

/* Res s'escriu quan aquest fitxer es llegeix des d'un altre: `tools/check.js`
   el necessita per saber quines pàgines hi ha d'haver, i una guarda que
   reescriu el que ha de comprovar no comprova res. */
module.exports = { PAGINES, AL_SOS, DOMINI, SOS, NUM, sortida };
if (require.main !== module) return;

if (CHECK) {
  console.log('\nGuarda de les pàgines · surten de data/comando.json');
  let mal = 0;
  for (const [f, html] of sortida()) {
    const cami = join(ARREL, f);
    if (!existsSync(cami)) { mal++; console.log(`  ✗ ${f} no hi és: corre \`node tools/build.js\``); }
    else if (readFileSync(cami, 'utf8') !== html) { mal++; console.log(`  ✗ ${f} està vell: corre \`node tools/build.js\``); }
    else console.log(`  ✓ ${f}`);
  }
  console.log(mal ? `\n❌ ${mal} ${mal === 1 ? 'fitxer' : 'fitxers'} fora de lloc.` : '\n✅ El que hi ha al disc és el que surt de les dades.');
  process.exit(mal ? 1 : 0);
}

for (const [f, html] of sortida()) writeFileSync(join(ARREL, f), html);
console.log(`✅ ${PAGINES.length} pàgines i el sitemap · ${NUM.herois} herois, ` +
  `${NUM.peces} peces (${NUM.pendents} sense enllaç), ${NUM.plans} plans (${NUM.durada})`);
