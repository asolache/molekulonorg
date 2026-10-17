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
/* La mostra dels còmics. És l'única dada que s'edita en aquest repositori: quines
   pàgines es publiquen i quin tema sona a cada una és una decisió editorial
   d'aquesta web, no un estat del SOS. Les cançons, però, segueixen sent les de
   dalt — `tema` hi és un `id` de `comando.json`. */
const M = JSON.parse(readFileSync(join(ARREL, 'data', 'mostra.json'), 'utf8'));
const PECA = Object.fromEntries(D.videos.map(v => [v.id, v]));
/* Els retrats dels cromos. Van a part de `comando.json` perquè són una decisió
   d'aquesta web —quin tros de quina vinyeta fa de cara de qui— i no una dada del
   SOS. Qui mana sobre els noms segueix sent la llista canònica. */
const C = JSON.parse(readFileSync(join(ARREL, 'data', 'cromos.json'), 'utf8'));
const RETRAT = Object.fromEntries(C.retrats.map(r => [r.heroi, r]));
const PAGS_MOSTRA = M.comics.reduce((a, c) => a + c.pagines.length, 0);
const MOSTRA1 = M.comics[0].pagines.length;

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
  { f: 'historia.html', nav: 'La història', t: 'La història',
    tit: 'La història · Comando Molekulon',
    desc: 'De la frase que ho va encendre tot fins al tercer acte, que s\'està rodant ara. El còmic, la banda i la pel·lícula, en ordre i en imatges.' },
  { f: 'personatges.html', nav: 'Els personatges', t: 'Els personatges',
    tit: 'Els personatges · Comando Molekulon',
    desc: 'Els catorze herois del còmic i, darrere, els personatges de la gent que s\'hi apunta: el que sap fer cadascú, la seva superarma i què vol dir dins d\'un equip.' },
  { f: 'peli.html', nav: 'La pel·lícula', t: 'La pel·lícula',
    tit: 'La pel·lícula · Comando Molekulon',
    desc: 'El guió de la intro, pla a pla: què està filmat, què s\'ha de filmar i d\'on surt cada imatge. Un esborrany per corregir, no un guió tancat.' },
  { f: 'musica.html', nav: 'La banda', t: 'La banda',
    tit: 'La banda · Comando Molekulon',
    desc: 'Els capítols, els videoclips, els temes i els directes del Comando. I el que encara no té adreça, dit com el que és.' },
  /* El lector de la mostra. `menu` es calcula i no es decideix: mentre no hi
     hagi ni una pàgina publicada, la pàgina existeix però no s'enllaça des del
     menú ni surt al sitemap. Una porta al no-res és pitjor que cap porta, i una
     pàgina buida indexada és pitjor que totes dues. El dia que hi entri la
     primera pàgina, entra sola al menú. */
  { f: 'comic.html', nav: 'El còmic', t: 'El còmic', menu: PAGS_MOSTRA > 0,
    tit: 'El còmic · Comando Molekulon',
    desc: 'La mostra dels dos còmics, pàgina a pàgina i cada una amb la cançó que li toca. Així és com es van publicar: còmic i disc, per llegir-los alhora.' },
  /* El kit va al menú: és la porta d'entrada al Comando, i una porta que
     només s'enllaça des del fons d'una landing no la troba ningú. */
  { f: 'kit.html', nav: 'Fes-te el personatge', t: 'Fes-te el personatge',
    tit: 'Fes-te el personatge · el kit del Comando Molekulon',
    desc: 'Quatre preguntes i surt el teu cromo del Comando, amb la fitxa i el text del vídeo ja escrits. Sense compte de res, i si vols, l\'envies a la col·lecció.' },
  /* Com es fa servir la IA: fora del menú (no és el relat) però al peu de totes
     les pàgines i al sitemap. La regla és la veda 167 de TeamTowers. */
  { f: 'ia.html', nav: 'La IA', t: 'Com fem servir la IA', menu: false, mapa: true,
    tit: 'Com fem servir la IA · Comando Molekulon',
    desc: 'Què fa la IA en aquesta web i què fem nosaltres, el que es pot comprovar a l\'historial i el compromís de gastar el mínim per token.' },
  /* La moderació dels cromos: ni menú, ni sitemap, ni cercadors. */
  { f: 'modera.html', nav: 'Moderar', t: 'Moderar els cromos', menu: false, noindex: true,
    tit: 'Moderar els cromos · Comando Molekulon',
    desc: 'La cua de cromos que la gent envia des del kit, per aprovar-los, rebutjar-los o retirar-los. Només per a qui té clau de moderador.' }
];

/* Les pàgines que encara viuen al SOS. S'enllacen amb el seu domini sencer i
   marcades, perquè qui hi clica ha de saber que canvia de casa.
   El banc de temps i la biblioteca no tenen adreça curta a l'altra casa
   (teamtowershuma.com/banc-temps dona 404, comprovat el 2026-10-10): s'enllacen
   pel fitxer fins que allà se'ls declari la regla com a /escola o /joc. */
const AL_SOS = [
  { h: '/molekulandia', ic: '🏘', t: 'Molekulandia',
    d: 'El poble sencer: onze edificis on entrar i nou professions. El bar és el banc de temps i la ferreteria, la biblioteca de les coses.' },
  { h: '/molekulon', ic: '💧', t: 'Un estat líquid',
    d: 'Set federacions, onze cases i un esquelet de 19 nodes contra els 47 d\'un país sòlid. El món és una dada, i això ho demostra amb números.' },
  { h: '/escola', ic: '🏭', t: 'La Fàbrica de Superherois',
    d: 'El Comando a l\'aula, de 6 a 13 anys. Dues accions, guia metodològica i què es mira i què no a l\'avaluació.' },
  { h: '/formacio', ic: '🎓', t: 'Formació',
    d: 'Setze mòduls de N0 a N3, amb un itinerari sencer de Comando, reputació i multivers narratiu.' },
  { h: '/SOS/banc-temps.html', ic: '⏳', t: 'El Banc de Temps',
    d: 'Els superpoders, comptats: una hora val una hora, i el saldo que ho diu.' },
  { h: '/SOS/biblioteca.html', ic: '🔧', t: 'La Biblioteca de les Coses',
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
/* SoundCloud es pot incrustar, però el seu reproductor només sap resoldre
   l'adreça **canònica** (`soundcloud.com/qui/què`). Els enllaços curts que dona
   el botó de compartir (`on.soundcloud.com/…`) obren bé al navegador i el widget
   no els resol: incrustar-los ensenyaria una caixa d'error amb el nostre marc al
   voltant. Mentre l'adreça sigui curta, la peça s'enllaça en comptes
   d'incrustar-se — i el dia que arribi la llarga, sona sense sortir de la web
   sense tocar cap altra cosa. */
const widgetSC = u => /^https?:\/\/(www\.)?soundcloud\.com\//.test(String(u || ''))
  ? 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(u) +
    '&color=%23e040fb&auto_play=true&hide_related=true&show_comments=false&show_teaser=false'
  : null;
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

/* ══ EL CROMO ════════════════════════════════════════════════════════════
   La fitxa de text deia qui és cadascú i no feia que en volguessis un. Un cromo
   sí: té cara, té número i es col·lecciona. La cara surt de la portada del segon
   còmic, que és l'única imatge on hi surten tots tocant alhora.

   El marc té proporció fixa encara que el retrat no hi sigui: una col·lecció on
   les caselles ballen d'alçada no sembla una col·lecció, sembla una llista. */
.cromos{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.8rem;margin:1rem 0}
.cromo{background:linear-gradient(160deg,rgba(224,64,251,.12),rgba(0,176,255,.06) 55%,transparent),var(--card);
  border:1px solid var(--border);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.cromo .marc{position:relative;aspect-ratio:3/4;background:#05050a;overflow:hidden}
.cromo .marc img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.cromo .buit{display:flex;align-items:center;justify-content:center;height:100%;
  color:var(--muted);font-size:.76rem;text-align:center;padding:1rem;
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.03) 0 10px,transparent 10px 20px)}
.cromo .num{position:absolute;top:.5rem;left:.5rem;font-family:var(--mono);font-size:.72rem;font-weight:700;
  background:rgba(11,11,18,.82);color:var(--gold);padding:.15rem .45rem;border-radius:6px}
.cromo .avis-retrat{position:absolute;bottom:0;left:0;right:0;font-size:.66rem;color:var(--light);
  background:rgba(11,11,18,.78);padding:.25rem .45rem}
.cromo .cos{padding:.8rem .85rem;display:flex;flex-direction:column;gap:.35rem}
.cromo h3{font-size:1rem}
.cromo .rol{color:var(--purple);font-size:.78rem;font-weight:600}
.cromo dl{margin:0;font-size:.8rem}
.cromo dt{font-family:var(--mono);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:.4rem}
.cromo dd{margin:.1rem 0 0;color:var(--light)}
.cromo .lletra{font-style:italic;color:var(--light);font-size:.78rem;border-left:2px solid var(--border);padding-left:.5rem;margin-top:.5rem}

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

/* ══ EL LECTOR DE LA MOSTRA ══════════════════════════════════════════════
   Una pàgina de còmic es llegeix en vertical i sencera: si cal fer scroll per
   veure'n el peu, els globus es llegeixen en dos temps i la pàgina es perd. Per
   això la imatge s'ajusta a l'alçada de la finestra i no a l'amplada. */
/* La portada va al costat de la sinopsi i no dins del lector: és el que et fa
   agafar el còmic, no la primera pàgina de la història. */
.capsa-portada{display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin:.6rem 0 1rem}
.capsa-portada img{width:190px;border:1px solid var(--border);border-radius:10px;background:#000}
.capsa-portada .q{flex:1 1 320px;min-width:280px}
.lector{margin:.9rem 0}
.full{position:relative;background:#000;border:1px solid var(--border);border-radius:12px;overflow:hidden;
  display:flex;align-items:center;justify-content:center;min-height:50vh}
.full img{display:block;max-height:78vh;width:auto;max-width:100%}
.full img[hidden]{display:none}
.controls{display:flex;align-items:center;justify-content:center;gap:.7rem;margin:.7rem 0 .2rem}
.controls button{font:inherit;font-size:.9rem;font-weight:700;padding:.45rem .9rem;border-radius:9px;cursor:pointer;
  border:1px solid var(--border);background:var(--card);color:var(--text)}
.controls button:disabled{opacity:.35;cursor:default}
.controls .comptador{font-family:var(--mono);font-size:.82rem;color:var(--muted);min-width:5.5rem;text-align:center}
.so{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;justify-content:center;
  font-size:.84rem;color:var(--light);margin:.5rem 0 0}
.so b{color:var(--text)}
.so button{font:inherit;font-size:.8rem;font-weight:700;padding:.3rem .75rem;border-radius:20px;cursor:pointer;
  border:1px solid var(--purple);background:rgba(224,64,251,.14);color:var(--purple)}
.so .cap{height:0;overflow:hidden;width:0}
.so .cap.veu{height:auto;width:100%;flex-basis:100%;margin-top:.5rem}
.so iframe{width:0;height:0;border:0}
.so .cap.veu iframe{width:100%;height:120px;border-radius:10px}
.so .fora{font-size:.8rem}
.buit{border-color:var(--orange)}

/* ══ LA LANDING DE LA HISTÒRIA ═══════════════════════════════════════════
   Les altres pàgines informen; aquesta ha de fer que t'hi fiquis. Per tant mana
   la imatge i el text hi va a sobre, i cada acte ocupa la pantalla sencera: el
   que es veu alhora és el que es llegeix alhora.

   No hi ha cap guió de desplaçament ni cap animació lligada al scroll. Un
   efecte que es mou mentre llegeixes fa que tornis a començar la frase, i això
   és exactament el contrari del que una història necessita. */
.acte{position:relative;min-height:88vh;display:flex;align-items:center;overflow:hidden;isolation:isolate;
  padding:3.5rem 1.2rem;border-bottom:1px solid var(--border)}
.acte .fons-img{position:absolute;inset:0;z-index:-2}
.acte .fons-img img{width:100%;height:100%;object-fit:cover;object-position:center 30%;filter:saturate(.85)}
.acte .vel-acte{position:absolute;inset:0;z-index:-1;
  background:linear-gradient(180deg,rgba(11,11,18,.92),rgba(11,11,18,.78) 45%,rgba(11,11,18,.97))}
.acte .dins{max-width:900px;margin:0 auto;width:100%}
.acte .numero{font-family:var(--mono);font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--purple);font-weight:700;margin-bottom:.7rem}
.acte h2{font-size:clamp(1.6rem,4.4vw,2.6rem);margin-bottom:.9rem;line-height:1.08}
.acte p{font-size:clamp(.98rem,1.9vw,1.12rem);color:var(--light);max-width:720px;margin:.6rem 0}
.acte p b{color:var(--text)}

.cita{font-size:clamp(1.3rem,3.6vw,2rem);line-height:1.25;font-weight:700;color:var(--text);
  border-left:3px solid var(--purple);padding-left:1rem;margin:.5rem 0 1rem;max-width:760px}
.cita span{display:block;font-size:.82rem;font-weight:400;color:var(--light);margin-top:.6rem;letter-spacing:.02em}

/* La tira de pàgines. Es passa amb el dit al mòbil i amb la roda a l'escriptori:
   és una tira de còmic, i una graella la convertiria en un catàleg. */
.tira{display:flex;gap:.7rem;overflow-x:auto;padding:.3rem .1rem 1rem;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.tira figure{margin:0;flex:0 0 clamp(180px,42vw,260px);scroll-snap-align:center}
.tira img{width:100%;border:1px solid var(--border);border-radius:10px;background:#000;display:block}
.tira figcaption{font-size:.76rem;color:var(--muted);margin-top:.4rem;line-height:1.35}

/* El guió, en forma de taulell: número gros i la veu en off. Aquí no hi va la
   taula de /peli —allà hi és sencera—, hi va el que es veu. */
.plans{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.6rem;margin:1rem 0}
.pla{background:rgba(20,20,32,.78);border:1px solid var(--border);border-radius:12px;padding:.75rem .8rem}
.pla .n{font-family:var(--mono);font-size:1.5rem;font-weight:700;color:var(--purple);line-height:1}
.pla h4{font-size:.9rem;margin:.3rem 0 .3rem}
.pla p{font-size:.8rem;margin:0;color:var(--light)}
.pla .est{margin-top:.5rem;display:inline-block}

.vids{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:.6rem;margin:1rem 0}
.vid{display:block;text-decoration:none;background:rgba(20,20,32,.78);border:1px solid var(--border);
  border-radius:12px;padding:.7rem .75rem;color:var(--text)}
.vid:hover{border-color:var(--purple)}
.vid b{display:block;font-size:.88rem}
.vid span{font-size:.75rem;color:var(--muted)}

/* Les tres preguntes. Són el final de la pàgina i el principi de tot: el que
   demanem no és una donació, és un vídeo de 30 segons. */
.pregunta{display:flex;gap:.9rem;align-items:flex-start;background:rgba(20,20,32,.7);
  border:1px solid var(--border);border-left:3px solid var(--purple);border-radius:12px;padding:.9rem 1rem;margin:.6rem 0}
.pregunta .q{font-family:var(--mono);font-size:1.3rem;font-weight:700;color:var(--purple);line-height:1}
.pregunta h4{font-size:1rem;margin-bottom:.25rem}
.pregunta p{font-size:.86rem;margin:0}

footer{border-top:1px solid var(--border);background:var(--panel);padding:1.6rem 1.2rem 2.4rem}
footer .f{max-width:1060px;margin:0 auto;font-size:.82rem;color:var(--muted);display:flex;gap:1.2rem;flex-wrap:wrap}
footer a{color:var(--light)}
@media (max-width:560px){nav.barra{padding:.5rem .7rem}nav.barra .dret{display:none}}
`.trim();

/* ══ L'ESQUELET ══════════════════════════════════════════════════════════════ */
const nav = actual => `<nav class="barra" aria-label="Principal">
<a class="marca" href="/">Comando <span>Molekulon</span></a>
${PAGINES.filter(p => p.menu !== false).map(p => `<a class="l" href="${p.f === 'index.html' ? '/' : '/' + p.f.replace(/\.html$/, '')}"${p.f === actual ? ' aria-current="page"' : ''}>${esc(p.nav)}</a>`).join('\n')}
<a class="l dret" href="${SOS}/sos" rel="noopener">Obre el SOS ↗</a>
</nav>`;

const peu = `<footer>
<div class="f">
<span>Comando Molekulon · un projecte de <a href="${SOS}" rel="noopener">TeamTowers Humà</a></span>
<span>L'eina que hi ha a sota és el <a href="${SOS}/sos" rel="noopener">SOS</a>, i és lliure</span>
<span class="mut">Aquesta web es genera de les dades, no s'escriu a mà, i es fa amb IA a la vista: <a href="/ia">com</a>.</span>
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
<meta name="description" content="${esc(p.desc)}">${p.noindex ? '\n<meta name="robots" content="noindex,nofollow">' : ''}
<link rel="canonical" href="${url(p.f)}">
<meta property="og:title" content="${esc(p.tit)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url(p.f)}">
<meta property="og:locale" content="ca_ES">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonld(p)}</script>
<style>
${CSS}${p.f === 'kit.html' ? KIT_CSS : ''}${p.f === 'personatges.html' ? GENT_CSS : ''}${p.f === 'modera.html' ? MODERA_CSS : ''}${p.f === 'ia.html' ? IA_CSS : ''}
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
<a class="pri" href="/historia">Entra a la història</a>
<a href="${KIT}">Fes-te el personatge</a>
<a href="/personatges">Els ${NUM.herois} personatges</a>
${MOSTRA1 ? `<a href="/comic">Llegeix el còmic</a>` : ''}
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
<li><b>La mostra del segon còmic.</b> Del primer n'hi ha ${MOSTRA1} pàgines a <a href="/comic">el còmic</a>; del segon, cap encara —i tots dos es poden comprar.</li>
<li><b>Qui ho signa.</b> Avís legal, contacte i llicència del que hi ha publicat.</li>
<li><b>${NUM.pendents} peces de mitjans</b> nomenades i sense adreça. Surten a <a href="/musica">la banda</a> dient-ho.</li>
<li><b>Retrats dels personatges.</b> Les fitxes són de text: el dibuix existeix en paper i encara no és aquí.</li>
</ul>
</section>

</div>`;

/* ══ ELS PERSONATGES ═════════════════════════════════════════════════════════ */
const cromo = (h, i) => {
  const r = RETRAT[h.name];
  return `<article class="cromo">
<div class="marc">
<span class="num">${String(i + 1).padStart(2, '0')} / ${D.herois.length}</span>
${r ? `<img src="${esc(r.img)}" alt="${esc(h.name)}, retallat de la portada del segon còmic" loading="lazy">
${r.pendent ? '<span class="avis-retrat">Retrat a confirmar per l\'autor</span>'
  : (r.font ? `<span class="avis-retrat">${esc(r.font)}</span>` : '')}`
  : '<div class="buit">Encara sense retrat</div>'}
</div>
<div class="cos">
<h3>${esc(h.name)}</h3>
<p class="rol">${esc(h.role)}</p>
<dl>
<dt>Poder</dt><dd>${esc(h.power)}</dd>
<dt>Superarma</dt><dd>${esc(h.arma)}</dd>
<dt>En un equip</dt><dd>${esc(h.vna)}</dd>
<dt>On surt</dt><dd>${esc(h.on)}</dd>
</dl>
${h.lletra ? `<p class="lletra">${esc(h.lletra)}</p>` : ''}
</div>
</article>`;
};

const personatges = () => `
<header class="hero">
<div class="hero-inner">
<span class="tag">La col·lecció</span>
<h1>Els <em>cromos</em> del Comando</h1>
<p class="sub">Cadascun porta tres coses: <strong>el seu poder al còmic</strong>,
<strong>la seva superarma</strong> i <strong>què vol dir dins d'un equip de debò</strong>.
La tercera és la que fa que aquest relat visqui dins d'una eina de gestió i no en un fullet a part.</p>
<p class="avis"><strong>El repartiment no està tancat.</strong> Els ${NUM.herois} primers són
els que surten als còmics i als vídeos; els que van darrere són de la gent que hi ha entrat amb <a href="${KIT}">el kit</a>. Un personatge
del Comando és una persona de debò amb el que sap fer i el que pot deixar.</p>
</div>
</header>

<div class="wrap">
<section class="box">
<h2>${C.retrats.length} de ${NUM.herois} ja tenen cara</h2>
<p class="lead">Les cares surten de <b>${esc(C.font.titol)}</b>, que és l'única imatge on
hi surten tots tocant alhora. Els que encara no en tenen ho diuen: <b>un marc buit és més
honest que la cara d'un altre</b>.</p>
</section>

<div class="cerca"><input type="search" id="q" placeholder="Busca un nom, un superpoder, una superarma o un lloc" aria-label="Busca a la col·lecció"><span id="q-n" role="status"></span></div>
<div class="cromos" id="cromos">
${D.herois.map(cromo).join('\n')}
</div>
<p class="gent-estat" id="gent-estat" role="status">Darrere dels ${NUM.herois} del còmic hi van els de la gent que s'hi apunta, un cop aprovats. Carregant…</p>
<noscript><p class="gent-estat">Els cromos de la gent es llegeixen en directe i necessiten JavaScript.</p></noscript>

<section class="box">
<h3>I el teu</h3>
<p class="lead">El teu nom de guerra, fins a cinc superpoders i les teves superarmes —el que
saps fer i el que pots deixar—, i com es veu el personatge. Quatre preguntes, sense compte de
res. Si l'envies i l'autor l'aprova, surt <strong>en aquesta mateixa llista</strong>, darrere dels del còmic.
<b>Hi surt el personatge, no la persona.</b></p>
<p><a href="${KIT}">Fes-te el personatge →</a></p>
</section>
</div>
<script>${CROMO_JS}
CROMO.API.url = ${JSON.stringify(SUPA.url)}; CROMO.API.key = ${JSON.stringify(SUPA.key)};
${GENT_JS}</script>`;

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

/* ══ EL CÒMIC ════════════════════════════════════════════════════════════════
   Els dos còmics es van publicar **amb el seu disc**, per llegir cada pàgina
   amb la cançó que li toca. Una galeria d'imatges no seria la mateixa cosa: el
   que es reprodueix aquí no és el còmic, és **com es llegeix**.

   Per això el lector té tres peces i cap més: la pàgina sencera, els dos
   botons, i una barra que diu què sona i deixa posar-ho. El so no arrenca sol
   —una pàgina que et crida quan l'obres es tanca— i no es reinicia quan dues
   pàgines seguides comparteixen tema, que és el cas normal.

   Mentre no hi hagi imatges, la pàgina no s'inventa cap maqueta: diu què hi
   haurà i què falta perquè hi sigui. */
const llibre = c => {
  const n = c.pagines.length;
  if (!n) return `<p class="nota buit"><b>D'aquest encara no hi ha cap pàgina publicada.</b>
Quan hi siguin es llegiran aquí, una a una i cada una amb la seva cançó — que és
com es va publicar en paper.</p>`;
  const temes = c.pagines.map(p => PECA[p.tema]).filter(Boolean);
  /* El lector es porta els seus temes a sobre, i no hi ha cap crida a res: són
     tres camps per peça i van a l'atribut. Un `fetch` d'un JSON per a dotze
     línies de dades seria una petició més i un estat més per fallar. */
  const mapa = {};
  for (const t of temes) {
    const fora = t.soundcloud || (/^https?:/.test(t.url) ? t.url : null);
    mapa[t.id] = { id: t.id, titol: t.titol, yt: idYouTube(t.url), sc: widgetSC(t.soundcloud || t.url), url: fora };
  }
  /* Un tema que l'autor encara no ha confirmat es marca. Fer passar una
     proposta meva per una decisió seva és la manera més fàcil que es quedi
     així per sempre, perquè ningú sap que s'havia de mirar. */
  const pendents = c.pagines.filter(p => p.tema_pendent).map(p => p.n);
  return `<div class="lector" data-lector="${esc(c.id)}" data-temes="${esc(JSON.stringify(mapa))}"
 data-pendents="${esc(JSON.stringify(pendents))}">
<div class="full">
${c.pagines.map((p, i) => `<img src="${esc(p.img)}" alt="${esc(p.alt || `${c.titol}, pàgina ${p.n}`)}"${i ? ' hidden' : ''}${i > 1 ? ' loading="lazy"' : ''} data-tema="${esc(p.tema || '')}">`).join('\n')}
</div>
<div class="controls">
<button type="button" data-va="-1" disabled>← Anterior</button>
<span class="comptador">1 / ${n}</span>
<button type="button" data-va="1">Següent →</button>
</div>
<div class="so">
<span>Sona: <b class="tema">${esc(temes[0] ? temes[0].titol + (c.pagines[0].tema_pendent ? ' (proposta, a confirmar)' : '') : 'encara sense tema assignat')}</b></span>
<button type="button" data-posa>▶ Posa-la</button>
${(() => {
  /* L'enllaç neix amb una adreça de debò, no amb un `#` que el guió omplirà:
     una porta escrita buida és una porta buida si el guió no arrenca, i la
     guarda d'aquest repositori no en deixa passar cap. */
  const primer = temes.find(t => t.soundcloud || /^https?:/.test(t.url));
  return primer ? `<a class="fora" href="${esc(primer.soundcloud || primer.url)}" rel="noopener" hidden>Escolta-la a SoundCloud ↗</a>` : '';
})()}
<span class="cap"></span>
</div>
</div>`;
};

const comic = () => `
<header class="hero">
<div class="hero-inner">
<span class="tag">Mostra</span>
<h1>Un còmic que <em>es llegeix amb música</em></h1>
<p class="sub">Els dos números es van publicar <strong>amb el seu disc</strong>: cada pàgina
té la seva cançó i es llegeixen alhora. Això d'aquí és <strong>una mostra</strong>, no el
còmic sencer.</p>
${PAGS_MOSTRA ? '' : `<p class="avis"><strong>Encara no hi ha cap pàgina aquí.</strong> El
lector ja està muntat i el que falta són les imatges i dir quin tema sona a cada
pàgina. Mentre no hi siguin, aquesta pàgina no surt ni al menú ni als cercadors:
existeix per poder-la acabar, no per ensenyar-la.</p>`}
</div>
</header>

<div class="wrap">
${M.comics.map(c => `<section class="box">
<h2>${esc(c.titol)}</h2>
${c.portada ? `<div class="capsa-portada">
<img src="${esc(c.portada)}" alt="${esc(c.portada_alt || 'Portada de ' + c.titol)}" width="190">
<div class="q"><p class="lead">${esc(c.sinopsi)}</p>
<p class="mut">${c.pagines.length ? `${c.pagines.length} pàgines de mostra` : 'Mostra encara per obrir'}</p></div>
</div>` : `<p class="lead">${esc(c.sinopsi)}</p>`}
${llibre(c)}
${(c.compra && c.compra.length) ? `<p class="nota"><b>El número sencer, en paper.</b> ${c.compra.map(x =>
  `<a href="${esc(x.url)}" rel="noopener">Compra'l en ${esc(x.llengua.toLowerCase())} ↗</a>`).join(' · ')}</p>`
  : '<p class="mut">On es compra: pendent de dir-ho aquí.</p>'}
</section>`).join('\n')}

${M.trailer ? `<section class="box">
<h2>El tràiler</h2>
<div class="taula"><a href="${esc(M.trailer)}" rel="noopener">Mira'l ↗</a></div>
</section>` : ''}

<section class="box">
<h3>Per què còmic i disc alhora</h3>
<p class="lead">Cada personatge té la seva superarma, el seu vers i el seu tema. El
dibuix i la música no il·lustren la història: <b>en són la matèria</b>, i separar-los
deixa les dues meitats dient menys del que diuen juntes. A la
<a href="/musica">pàgina de la banda</a> hi ha les peces publicades, i a
<a href="/peli">la pel·lícula</a>, el guió que en surt.</p>
</section>
</div>
${PAGS_MOSTRA ? SCRIPT : ''}`;

/* El guió del lector. Cinc funcions i cap dependència: el que fa és canviar
   quina imatge es veu i, quan el tema canvia de debò, carregar el reproductor.
   Va al final del cos i no al cap, així que quan corre ja hi és tot. */
const SCRIPT = `<script>
(function(){
for (const l of document.querySelectorAll('[data-lector]')) {
  const fulls = [...l.querySelectorAll('.full img')];
  const comptador = l.querySelector('.comptador');
  const tema = l.querySelector('.tema');
  const cap = l.querySelector('.cap');
  const posa = l.querySelector('[data-posa]');
  const TEMES = JSON.parse(l.dataset.temes || '{}');
  const PENDENTS = new Set(JSON.parse(l.dataset.pendents || '[]'));
  let i = 0, sonant = null;

  const pinta = () => {
    fulls.forEach((f, k) => f.hidden = k !== i);
    comptador.textContent = (i + 1) + ' / ' + fulls.length;
    l.querySelector('[data-va="-1"]').disabled = i === 0;
    l.querySelector('[data-va="1"]').disabled = i === fulls.length - 1;
    const t = TEMES[fulls[i].dataset.tema];
    tema.textContent = t ? (t.titol + (PENDENTS.has(i + 1) ? ' (proposta, a confirmar)' : ''))
      : 'encara sense tema assignat';
    /* Si la pàgina nova porta el mateix tema, no es toca res: rebobinar una
       cançó a cada pàgina és la manera més ràpida que la tanquin. */
    if (sonant && t && t.id !== sonant) sona(t);
    else if (sonant && !t) { cap.innerHTML = ''; cap.className = 'cap'; sonant = null; }
    /* Una peça que no es pot incrustar no amaga el botó i prou: ensenya la
       porta que sí que hi ha. */
    const potSonar = !!(t && (t.yt || t.sc));
    posa.hidden = !potSonar;
    const fora = l.querySelector('.fora');
    if (fora) {
      fora.hidden = potSonar || !(t && t.url);
      if (t && t.url) fora.href = t.url;
    }
  };
  const sona = t => {
    if (!t || (!t.yt && !t.sc)) { cap.innerHTML = ''; cap.className = 'cap'; sonant = null; return; }
    const src = t.yt
      ? 'https://www.youtube-nocookie.com/embed/' + t.yt + '?autoplay=1&rel=0&playsinline=1'
      : t.sc;
    cap.className = t.yt ? 'cap' : 'cap veu';
    cap.innerHTML = '<iframe title="' + t.titol.replace(/"/g, '&quot;') + '" allow="autoplay" src="' + src + '"></iframe>';
    sonant = t.id;
  };

  l.addEventListener('click', e => {
    const b = e.target.closest('[data-va]');
    if (b) { i = Math.min(fulls.length - 1, Math.max(0, i + Number(b.dataset.va))); pinta(); }
    if (e.target.closest('[data-posa]')) sona(TEMES[fulls[i].dataset.tema]);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && i < fulls.length - 1) { i++; pinta(); }
    if (e.key === 'ArrowLeft' && i > 0) { i--; pinta(); }
  });
  pinta();
}
})();
</scr` + `ipt>`;

/* ══ LA HISTÒRIA · la landing ════════════════════════════════════════════════
   L'encàrrec: que algú que arriba sense saber res **es fiqui a la pel·lícula**.
   Per tant aquesta pàgina no explica el projecte —això ja ho fa la portada—,
   explica **la seqüència**: d'on surt, què passa, on s'ha quedat i què se li
   demana a qui ho llegeix.

   Comença per la frase, perquè és per on va començar de debò: una broma d'en
   Groucho Marx que, mirada de prop, és un fet. I acaba amb una càmera de mòbil,
   perquè l'únic que separa un espectador d'un personatge és gravar-se trenta
   segons contestant tres preguntes.

   Les imatges són les que ja hi ha: les pàgines publicades del primer còmic i
   la portada del segon. Si un dia se'n publiquen més, aquesta pàgina les agafa
   soles. */
const CAPS = {
  1: 'L\'escuadrilla travessa l\'hiperespai. Ningú la veu.',
  2: 'Els del Comando, d\'un en un, preguntant-se on van.',
  3: 'El Gran Molekulon mira la Terra, i li fa mal.',
  4: 'La decisió: el que cal canviar no és el món, és la banda sonora.',
  5: 'L\'encàrrec, amb xifra: cent cinquanta mil.',
  6: 'I el perquè: ja els va guanyar tots, abans de néixer.',
  7: 'Només un arriba. I d\'allà en surt una cançó.'
};

/* Com es publica el vídeo. Això és una **proposta operativa**, no una dada del
   model: el canal, el format del títol i les etiquetes els decideix l'autor, i
   per això es declaren aquí on es canvien en una línia i no escampats pel text.

   L'etiqueta no és decoració ni màrqueting: **és el mecanisme**. Si el vídeo la
   porta, el Comando el troba cercant-la; si no la porta, no hi ha cap safata on
   hagi arribat. I això és literalment el que diu la història —no els reclutem,
   els trobem—, aplicat a una caixa de cerca. */
/* El kit del Comando viu a /kit, en aquesta mateixa web (vegeu «El kit, a
   casa»). Abans era un artefacte de Claude, i un artefacte privat era una porta
   tancada per a tothom menys per a qui el va fer. */
const KIT = '/kit';

const PUBLICAR = {
  durada: '30 a 60 segons',
  titol: 'Comando Molekulon · el teu nom de guerra · la teva població',
  etiquetes: ['comandomolekulon', 'molekulon', 'superpoders', 'la teva població'],
  canal: 'https://youtube.com/@comandomolekulon'
};

const historia = () => {
  const pags = M.comics[0].pagines;
  const cursa = pags.find(x => x.n === 6);
  const acteII = D.intro.plans.filter(p => p.n >= 7 && p.n <= 12);
  const peces = D.videos.filter(v => v.url && v.mena !== 'tema');
  const retalla = (t, n) => t.length > n ? t.slice(0, n).replace(/[\s,;:]+\S*$/, '') + '…' : t;
  return `
<section class="acte">
${cursa ? `<div class="fons-img"><img src="${esc(cursa.img)}" alt="" aria-hidden="true"></div>
<div class="vel-acte"></div>` : ''}
<div class="dins">
<p class="numero">D'on surt tot això</p>
<p class="cita">«Si estás deprimido, recuerda que eres el espermatozoide que ganó.»
<span>La frase és d'en Groucho Marx. El projecte sencer surt d'aquí.</span></p>
<p>Mirada de prop, <b>no és una broma: és un fet</b>. Vas travessar tenebres i obstacles
per fer el miracle de ser aquí, i vas guanyar una cursa de dos-cents milions.
<b>Néixer ja va ser la teva primera gesta</b>, i no et va fer falta cap superpoder
perquè ja el tenies.</p>
<p>D'aquesta frase en va sortir una cançó, de la cançó un còmic, del còmic una banda,
i de la banda una pel·lícula que encara no existeix. Això és la seqüència, en ordre.</p>
<div class="acts"><a class="pri" href="#acte-1">Comença la història ↓</a>
<a href="${KIT}">Fes-te el personatge →</a></div>
</div>
</section>

<section class="acte" id="acte-1">
<div class="dins">
<p class="numero">Acte I · el primer còmic</p>
<h2>L'encàrrec: no els heu de fabricar, els heu de <em>trobar</em></h2>
<p>El Gran Molekulon mira la Terra i decideix que el que cal canviar no és el món:
<b>és la banda sonora</b>. Envia dos deixebles a reclutar ${mil(NUM.objectiu)} superherois,
i ells dubten que en puguin reunir tants. La resposta és la que ho capgira tot:
<b>ja hi són</b>, escampats, fent coses més petites del que saben fer.</p>
<div class="tira">
${pags.map(x => `<figure>
<img src="${esc(x.img)}" alt="${esc(x.alt)}" loading="lazy">
<figcaption>${esc(CAPS[x.n] || `Pàgina ${x.n}`)}</figcaption>
</figure>`).join('\n')}
</div>
<p><a href="/comic">Llegeix-les amb la seva cançó →</a></p>
</div>
</section>

<section class="acte">
<div class="fons-img"><img src="${esc(M.comics[1].portada)}" alt="" aria-hidden="true"></div>
<div class="vel-acte"></div>
<div class="dins">
<p class="numero">Acte II · el segon còmic</p>
<h2>La caiguda: no s'han quedat sense ganes, <em>sense combustible</em></h2>
<p>El segon número és on el projecte diu contra què va. No contra un enemic de fora:
contra <b>una utopia que col·lapsa pel seu propi pes</b> perquè ningú va posar regles
d'intercanvi, contra <b>un vilà que no ataca sinó que ofereix</b> —et crea la necessitat
i després te la cobra—, i contra els dos que ja tens a casa: la por que paralitza
abans de començar i el rumor que corroeix la confiança.</p>
<div class="plans">
${acteII.map(x => `<div class="pla">
<div class="n">${x.n}</div>
<h4>${esc(x.titol)}</h4>
<p>${esc(retalla(x.veu, 125))}</p>
${x.de ? '<span class="est si">ja filmat</span>' : '<span class="est no">per filmar</span>'}
</div>`).join('\n')}
</div>
<p><a href="/peli">El guió sencer, pla a pla →</a></p>
</div>
</section>

<section class="acte">
<div class="dins">
<p class="numero">I això no és només dibuix</p>
<h2>La banda existeix, i ha tocat</h2>
<p>${NUM.publicades} peces publicades entre capítols, videoclips i directes. No són
material promocional: <b>són la part de la pel·lícula que ja està rodada</b>, i tres plans
del guió surten d'aquí. Mira'n un abans de seguir —és el camí més curt per entendre
de què va això.</p>
<div class="vids">
${peces.map(v => `<a class="vid" href="${esc(v.url)}" rel="noopener">
<b>${esc(v.titol)}</b>
<span>${v.qui.length ? esc(v.qui.join(' · ')) : esc(MENA[v.mena])} ↗</span>
</a>`).join('\n')}
</div>
<p><a href="/musica">Totes les peces, també les que encara no tenen adreça →</a></p>
</div>
</section>

<section class="acte">
<div class="dins">
<p class="numero">Acte III · s'està rodant ara</p>
<h2>El final no està publicat. <em>Tu hi surts.</em></h2>
<p>El tercer acte no es pot escriure en una taula, perquè depèn de quanta gent hi hagi.
<b>Cada persona que hi entra i aporta de debò és un node més</b>, i el repartiment es tanca
quan siguem ${mil(NUM.objectiu)}. Avui el comptador va per zero, i és de debò: surt del
registre públic i no d'un número inventat.</p>
<p>Entrar-hi no és donar diners ni omplir un formulari llarg. És <b>gravar-te un minut</b>
contestant les quatre preguntes de sempre —les mateixes que es fan a l'aula i als
tallers—, i el vídeo el fas amb el mòbil que tens a la mà.</p>

<div class="pregunta"><span class="q">1</span><div>
<h4>Qui ets?</h4>
<p>El teu nom, o el nom que vulguis portar al Comando, i d'on ets. Res més.</p>
</div></div>
<div class="pregunta"><span class="q">2</span><div>
<h4>Quins superpoders tens?</h4>
<p>El que saps fer i podries ensenyar o donar en hores. Fins a cinc. No cal que soni
important: cosir, escoltar, arreglar bicicletes i fer que la gent es parli també hi compten.</p>
</div></div>
<div class="pregunta"><span class="q">3</span><div>
<h4>I quines superarmes?</h4>
<p>El que tens i no fas servir cada dia, i que algú altre podria fer servir. Una escala,
una càmera, un local, una furgoneta, un taladre.</p>
</div></div>

<div class="pregunta"><span class="q">4</span><div>
<h4>I ara ensenya'l: fes-ne una demo</h4>
<p>La part que ho canvia tot. <b>No ho expliquis, fes-ho</b>: deu segons germinant,
soldant, afinant, amassant, explicant una cosa difícil fàcil. Un superpoder dit és una
promesa; <b>un superpoder ensenyat ja és una prova</b>, i és el que fa que algú del teu
barri et vingui a buscar.</p>
</div></div>

<p>Amb això ja ets un personatge: <b>no un avatar inventat</b>, sinó el que ja fas,
amb nom i amb superarma. I si no et surt explicar-ho, <b>no t'has de quedar fora per
això</b>: el kit del Comando et fa les quatre preguntes i te'n torna el nom de guerra, el
relat i el títol del vídeo ja escrits. <a href="${KIT}">Obre el kit →</a></p>

<h3 id="com-es-penja">I on es penja</h3>
<p>El vídeo el puges <b>tu</b> a YouTube, des del teu compte, i queda teu. No hi ha cap
formulari que se'l quedi ni cap safata nostra on acabi. El que el fa trobable és
<b>l'etiqueta</b>, i això és exactament el que diu la història: <b>no et reclutem, et
trobem</b>.</p>
<div class="pregunta"><span class="q">▶</span><div>
<h4>Les quatre coses que ha de portar</h4>
<p><b>Durada:</b> ${esc(PUBLICAR.durada)}. · <b>Títol:</b> <span class="mono">${esc(PUBLICAR.titol)}</span>.
· <b>Etiquetes:</b> ${PUBLICAR.etiquetes.map(t => `<span class="mono">#${esc(t.replace(/ /g, ''))}</span>`).join(' ')}.
· <b>Visibilitat: públic</b> —si és ocult, l'etiqueta no serveix de res i ningú el troba.</p>
</div></div>
<p>A la descripció, les quatre respostes escrites i l'adreça d'aquesta pàgina. Quan hi
siguis, el teu capítol és al mateix lloc que els dels altres:
<a href="${PUBLICAR.canal}" rel="noopener">el canal del Comando ↗</a>.</p>
<p class="mut"><b>El que això vol dir, dit clar:</b> un vídeo públic a YouTube és públic,
i aquesta decisió la prens tu. Al Comando hi surt <b>el personatge, no la persona</b>: el
vídeo pot ser amb màscara, de disfressa, de mans o en off, i el títol porta el nom de guerra
i no el teu. Però <b>pseudònim no vol dir anònim</b>: qui et conegui et reconeixerà per la
veu o pel taller, i si el puges des del teu canal personal, el canal diu qui ets. Si vols
el secret de debò, obre un canal a nom del personatge. La
fitxa del SOS és una altra cosa i es queda al teu aparell. <b>I a l'aula, no.</b> Els
vídeos de criatures no es publiquen: a l'escola l'exercici es fa sense penjar res, i això
ho explica la guia de la Fàbrica de Superherois.</p>
<div class="acts">
<a class="pri" href="${KIT}">Fes-te el personatge →</a>
<a href="${SOS}/sos#/alta" rel="noopener">Apunta'l al SOS ↗</a>
<a href="/personatges">Mira els ${NUM.herois} cromos</a>
</div>
<p class="mut">El format del títol i les etiquetes són una proposta de la casa: si no
t'encaixen, el que compta és que l'etiqueta hi sigui perquè algú et pugui trobar.</p>
</div>
</section>`;
};

/* ══ EL KIT, A CASA ══════════════════════════════════════════════════════════
   El kit vivia en un artefacte de Claude, i això el feia una porta tancada: un
   artefacte privat només l'obre qui el va fer, i qui no té compte de Claude no
   hi entra encara que es comparteixi. El kit és qui obre la porta del Comando,
   i la porta ha d'obrir-se per a tothom.

   Fa tres coses, i cadascuna funciona encara que la següent no arribi:

   1 · **La fitxa i el cromo.** Les quatre preguntes, com es veu el personatge
       i un cromo pintat al moment que es pot baixar en PNG. Sense IA i sense
       xarxa: és el mateix dibuix de la Fàbrica de Superherois del SOS
       (teamtowershuma SOS/escola.html), crescut per a adults i amb antifaç,
       perquè el directori és de personatges secrets.
   2 · **El text del vídeo i el de la IA.** La IA la posa qui escriu, des del seu
       compte, enganxant el text a qualsevol xat (estudi d'alta, §5).
   3 · **L'enviament al directori.** Va al Supabase del SOS (vegeu «El directori,
       viu» més avall) i queda pendent fins que l'autor l'aprova. */
const KIT_CSS = `
.kit .q{display:grid;gap:.3rem;padding:.85rem 0;border-top:1px dashed var(--border)}
.kit .q:first-of-type{border-top:0}
.kit label{font-weight:700}
.kit .q label b{color:var(--purple);margin-right:.4rem}
.kit .ajuda{font-size:.84rem;color:var(--muted);margin:0}
.kit input[type=text],.kit input[type=url],.kit textarea{font:inherit;width:100%;min-width:0;background:var(--card);color:var(--text);
  border:1px solid var(--border);border-radius:10px;padding:.55rem .7rem}
.kit textarea{min-height:4.2rem;resize:vertical}
.kit input:focus,.kit textarea:focus{outline:2px solid var(--purple);outline-offset:1px}
.kit .exemple{font-size:.84rem;color:var(--light);background:var(--card);border-radius:10px;padding:.6rem .8rem;margin:.4rem 0 0}
.kit button{font:inherit;font-weight:700;cursor:pointer;border-radius:10px}
.kit .fer{font-size:.95rem;padding:.65rem 1.2rem;background:var(--purple);border:1px solid var(--purple);color:#0b0b12}
.kit .fer:disabled{opacity:.5;cursor:default}
.kit .seg{font-size:.9rem;padding:.6rem 1rem;background:transparent;border:1px solid var(--border);color:var(--text)}
.kit .botons{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem}
.kit .estat{min-height:1.3em;font-size:.86rem;color:var(--orange)}
.kit .estat.ok{color:var(--green)}
.kit .bloc{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.8rem .9rem;margin-top:.9rem}
.kit .bloc h3{display:flex;justify-content:space-between;align-items:center;gap:.6rem;font-size:.98rem}
.kit .copia{font-size:.78rem;padding:.25rem .7rem;background:transparent;border:1px solid var(--border);color:var(--text)}
.kit .copia.fet{background:var(--green);border-color:var(--green);color:#0b0b12}
.kit pre{font-family:var(--mono);font-size:.82rem;white-space:pre-wrap;word-break:break-word;margin:.5rem 0 0;color:var(--light)}
.kit .llengua{display:flex;gap:.3rem;justify-content:flex-end}
.kit .llengua button{font-size:.76rem;padding:.2rem .6rem;background:transparent;border:1px solid var(--border);color:var(--light)}
.kit .llengua button[aria-pressed="true"]{background:var(--text);color:#0b0b12}
.kit-graella{display:grid;gap:1.2rem;align-items:start}
@media (min-width:860px){.kit-graella{grid-template-columns:minmax(0,1fr) 320px}.kit-cromo{position:sticky;top:64px}}
.kit-cromo canvas{width:100%;max-width:320px;display:block;margin:0 auto;border-radius:14px;border:1px solid var(--border);background:var(--card)}
.kit-cromo .botons{justify-content:center}
.aspecte{display:grid;gap:.55rem;padding:.85rem 0;border-top:1px dashed var(--border)}
.aspecte .fila{display:grid;grid-template-columns:7.5rem 1fr;gap:.5rem;align-items:center}
@media (max-width:520px){.aspecte .fila{grid-template-columns:1fr}}
.aspecte .k{font-size:.8rem;color:var(--muted)}
.tries{display:flex;flex-wrap:wrap;gap:.3rem}
.tries button{font-size:.8rem;font-weight:600;padding:.25rem .6rem;background:transparent;border:1px solid var(--border);color:var(--light);border-radius:999px}
.tries button[aria-pressed="true"]{background:var(--text);color:#0b0b12;border-color:var(--text)}
.tries button.color{width:1.7rem;height:1.7rem;padding:0;border:2px solid var(--border)}
.tries button.color[aria-pressed="true"]{outline:2px solid var(--text);outline-offset:2px}
.kit .accepto{display:flex;gap:.55rem;align-items:flex-start;font-weight:400;color:var(--light);font-size:.88rem}
.kit .accepto input{margin-top:.3rem}
.kit .clau{font-family:var(--mono);font-size:.95rem;background:var(--bg);border:1px dashed var(--purple);border-radius:8px;padding:.5rem .7rem;word-break:break-all;margin:.4rem 0 0}
.kit details{margin-top:.8rem}
.kit summary{cursor:pointer;font-weight:600;color:var(--light);font-size:.9rem}
`;

/* ══ EL CROMO, PINTAT ════════════════════════════════════════════════════════
   Un sol dibuix per al kit i per al directori: si fossin dos, el cromo que fas
   i el que surt publicat acabarien sent dos cromos diferents.

   Les opcions són llistes tancades i el dibuix només sap pintar el que hi ha a
   les llistes. Al directori això és una guarda, no un gust: el que arriba de
   la base de dades ho ha escrit qualsevol, i `aspecte()` torna al valor de
   sempre tot el que no hi sigui. El text es pinta al canvas, que no interpreta
   res; el que va a l'HTML passa per `textContent`.

   El guió va amb `String.raw` perquè les barres de les expressions regulars
   arribin a la pàgina tal com s'escriuen. No porta cap `${`: aquí no hi ha res a
   interpolar, i si algun dia n'hi hagués, el generador el pintaria abans d'hora. */
const CROMO_JS = String.raw`
var CROMO = (function(){
  "use strict";
  var O = {
    col: ["#e040fb","#00b0ff","#00e676","#ff9100","#ffd700","#e53935","#5e35b1","#00acc1","#f5f5f7","#26262f"],
    pell: ["#f8d5c2","#f0c3a0","#d9a271","#b87d4f","#8d5524","#5c3a21"],
    cabell: [["curt","Curt"],["llarg","Llarg"],["arrissat","Arrissat"],["trenes","Trenes"],["monyo","Monyo"],["rapat","Rapat"]],
    colCab: ["#2b2b2b","#5d4037","#a1662f","#e0b34a","#c62828","#7e57c2","#26c6da","#eeeeee"],
    ulls: ["#3e2723","#5d4037","#2e7d32","#1565c0","#6a1b9a","#00838f"],
    roba: [["capa","Amb capa"],["caputxa","Amb caputxa"],["armilla","Amb armilla"],["res","Sense res"]],
    mascara: [["antifac","Antifaç"],["ulleres","Ulleres"],["res","Sense"]],
    emblema: ["⚡","★","🌀","🔥","🌿","🎵","🛡️","🐝","🌊","🦅","♾️","❤️","🔧","🎨","🍲","🌱"]
  };
  var BASE = { col1: "#e040fb", col2: "#00e676", pell: "#f0c3a0", cabell: "curt", colCab: "#5d4037",
               ulls: "#3e2723", roba: "capa", mascara: "antifac", emblema: "⚡" };
  var ids = function(l){ return l.map(function(x){ return x[0]; }); };
  var VALID = { col1: O.col, col2: O.col, pell: O.pell, cabell: ids(O.cabell), colCab: O.colCab,
                ulls: O.ulls, roba: ids(O.roba), mascara: ids(O.mascara), emblema: O.emblema };

  function aspecte(a){
    var r = {};
    Object.keys(BASE).forEach(function(k){
      var v = a && a[k];
      r[k] = VALID[k].indexOf(v) >= 0 ? v : BASE[k];
    });
    return r;
  }
  function atzar(){
    var t = function(l){ return l[Math.floor(Math.random() * l.length)]; };
    var c1 = t(O.col);
    return { col1: c1, col2: t(O.col.filter(function(c){ return c !== c1; })), pell: t(O.pell),
             cabell: t(O.cabell)[0], colCab: t(O.colCab), ulls: t(O.ulls), roba: t(O.roba)[0],
             mascara: t(O.mascara)[0], emblema: t(O.emblema) };
  }

  /* El mateix criteri de nick que el SOS (build-convits.js, normNick): un sol
     espai de noms per a les dues cases. */
  function nick(s){
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20).replace(/-+$/, "");
  }

  function cap(x, f, cx, cy){
    x.fillStyle = f.colCab;
    var arc = function(dx, dy, r, a0, a1){ x.beginPath(); x.arc(cx + dx, cy + dy, r, a0 || 0, a1 || 7); x.fill(); };
    if (f.cabell === "rapat") { arc(0, 0, 54, Math.PI * 1.08, Math.PI * 1.92); return; }
    if (f.cabell === "arrissat") { [[-38,-30],[0,-46],[38,-30],[-52,-4],[52,-4]].forEach(function(d){ arc(d[0], d[1], 24); }); return; }
    arc(0, -6, 55, Math.PI, 0);
    if (f.cabell === "llarg") { x.fillRect(cx - 58, cy - 8, 20, 96); x.fillRect(cx + 38, cy - 8, 20, 96); }
    if (f.cabell === "trenes") { x.fillRect(cx - 62, cy - 4, 18, 74); x.fillRect(cx + 44, cy - 4, 18, 74); arc(-53, 74, 13); arc(53, 74, 13); }
    if (f.cabell === "monyo") arc(0, -62, 24);
  }

  /* Un nom llarg no pot sortir del cromo. Primer s'encongeix la lletra i només
     es retalla si ni així hi cap. */
  function encabeix(x, txt, cx, y, ample, gran, petit, pes){
    var m = gran, s = String(txt);
    do { x.font = pes + " " + m + "px system-ui,sans-serif"; if (x.measureText(s).width <= ample) break; m -= 1; } while (m > petit);
    if (x.measureText(s).width > ample) {
      while (s.length > 1 && x.measureText(s + "…").width > ample) s = s.slice(0, -1);
      s += "…";
    }
    x.fillText(s, cx, y);
  }

  /* f = { nom, lloc, poders[], armes[], nick, aspecte } */
  function pinta(cv, d){
    var W = 600, H = 840, x = cv.getContext("2d"), f = aspecte(d.aspecte), cx = 300, cy = 250;
    var g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, f.col1); g.addColorStop(1, "#0b0b12");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(0,0,0,.32)"; x.fillRect(0, 0, W, H);
    x.strokeStyle = f.col2; x.lineWidth = 10; x.strokeRect(7, 7, W - 14, H - 14);
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.fillStyle = "rgba(255,255,255,.75)"; x.font = "700 17px system-ui,sans-serif";
    x.fillText("C O M A N D O   M O L E K U L O N", cx, 52);

    if (f.roba === "capa") {
      x.fillStyle = f.col2; x.beginPath();
      x.moveTo(cx - 46, cy + 18); x.lineTo(cx - 104, cy + 236); x.lineTo(cx + 104, cy + 236); x.lineTo(cx + 46, cy + 18);
      x.closePath(); x.fill();
    }
    x.fillStyle = f.col1;
    x.fillRect(cx - 40, cy + 150, 30, 86); x.fillRect(cx + 10, cy + 150, 30, 86);
    x.fillRect(cx - 76, cy + 38, 26, 104); x.fillRect(cx + 50, cy + 38, 26, 104);
    x.fillStyle = f.pell;
    x.beginPath(); x.arc(cx - 63, cy + 150, 15, 0, 7); x.fill();
    x.beginPath(); x.arc(cx + 63, cy + 150, 15, 0, 7); x.fill();
    x.fillStyle = f.col1;
    x.beginPath(); if (x.roundRect) x.roundRect(cx - 52, cy + 18, 104, 140, 16); else x.rect(cx - 52, cy + 18, 104, 140); x.fill();
    if (f.roba === "armilla") { x.fillStyle = f.col2; x.fillRect(cx - 52, cy + 18, 26, 140); x.fillRect(cx + 26, cy + 18, 26, 140); }
    x.fillStyle = f.col2; x.fillRect(cx - 54, cy + 118, 108, 18);
    x.font = "46px system-ui,sans-serif"; x.textBaseline = "middle"; x.fillStyle = "#fff";
    x.fillText(f.emblema, cx, cy + 72);
    x.fillStyle = f.pell; x.beginPath(); x.arc(cx, cy - 40, 54, 0, 7); x.fill();
    cap(x, f, cx, cy - 40);
    if (f.roba === "caputxa") {
      x.fillStyle = f.col2; x.beginPath(); x.arc(cx, cy - 40, 60, Math.PI, 0); x.fill();
      x.fillRect(cx - 60, cy - 42, 120, 10);
    }
    /* L'antifaç va abans dels ulls: és la identitat secreta, i els ulls s'hi
       veuen a través. */
    if (f.mascara === "antifac") {
      x.fillStyle = f.col2; x.beginPath();
      if (x.roundRect) x.roundRect(cx - 50, cy - 58, 100, 28, 14); else x.rect(cx - 50, cy - 58, 100, 28);
      x.fill();
    }
    x.fillStyle = f.ulls;
    x.beginPath(); x.arc(cx - 19, cy - 44, 8, 0, 7); x.fill();
    x.beginPath(); x.arc(cx + 19, cy - 44, 8, 0, 7); x.fill();
    if (f.mascara === "ulleres") {
      x.strokeStyle = f.col2; x.lineWidth = 5;
      x.beginPath(); x.arc(cx - 19, cy - 44, 15, 0, 7); x.stroke();
      x.beginPath(); x.arc(cx + 19, cy - 44, 15, 0, 7); x.stroke();
      x.beginPath(); x.moveTo(cx - 4, cy - 44); x.lineTo(cx + 4, cy - 44); x.stroke();
    }
    x.strokeStyle = "rgba(0,0,0,.55)"; x.lineWidth = 3;
    x.beginPath(); x.arc(cx, cy - 22, 16, .25, Math.PI - .25); x.stroke();

    x.textBaseline = "alphabetic"; x.fillStyle = "#fff";
    encabeix(x, d.nom || "El teu nom de guerra", cx, 548, 500, 46, 24, "800");
    x.fillStyle = "rgba(255,255,255,.6)";
    encabeix(x, (d.lloc || "").toUpperCase(), cx, 578, 480, 16, 12, "600");
    x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(70, 598); x.lineTo(W - 70, 598); x.stroke();

    var p = (d.poders || []).slice(0, 3), a = (d.armes || []).slice(0, 2);
    x.fillStyle = "rgba(255,255,255,.55)"; x.font = "400 15px system-ui,sans-serif";
    x.fillText("SUPERPODERS", cx, 628);
    x.fillStyle = "#fff";
    if (!p.length) { x.fillStyle = "rgba(255,255,255,.4)"; encabeix(x, "Encara per dir", cx, 656, 500, 21, 15, "600"); }
    p.forEach(function(t, i){ encabeix(x, t, cx, 656 + i * 26, 500, 21, 15, "600"); });
    var ya = 656 + Math.max(1, p.length) * 26 + 16;
    x.fillStyle = "rgba(255,255,255,.55)"; x.font = "400 15px system-ui,sans-serif";
    x.fillText("SUPERARMES", cx, ya);
    x.fillStyle = a.length ? "#fff" : "rgba(255,255,255,.4)";
    encabeix(x, a.length ? a.join(" · ") : "Encara per dir", cx, ya + 28, 500, 19, 13, "600");

    x.fillStyle = "rgba(255,255,255,.5)"; x.font = "400 14px system-ui,sans-serif";
    x.fillText("molekulon.org" + (d.nick ? "  ·  @" + d.nick : ""), cx, 818);
    return cv;
  }

  /* ── El directori, al Supabase del SOS ──────────────────────────────────── */
  var API = { url: "", key: "" };
  function rpc(nom, cos){
    return fetch(API.url + "/rest/v1/rpc/" + nom, {
      method: "POST",
      headers: { apikey: API.key, Authorization: "Bearer " + API.key, "Content-Type": "application/json" },
      body: JSON.stringify(cos || {})
    }).then(function(r){
      return r.json().catch(function(){ return null; }).then(function(j){
        if (!r.ok) { var e = new Error((j && j.message) || ("HTTP " + r.status)); e.codi = j && j.message; throw e; }
        return j;
      });
    });
  }
  /* Només YouTube, i sencer: és l'únic enllaç que un cromo pot portar. */
  function video(u){
    u = String(u || "").trim();
    return /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]{11}/.test(u) ? u : "";
  }
  return { O: O, BASE: BASE, aspecte: aspecte, atzar: atzar, nick: nick, pinta: pinta, rpc: rpc, video: video, API: API };
})();
`;

const KIT_JS = String.raw`
(function(){
  "use strict";
  var T = {
    ca: {
      senseNom: "Sense nom encara",
      cap: ["Nom de guerra","Població","Superpoders","Superarmes","Demo"],
      sap: "Sap ", porta: " Porta ", i: " i ", demo: " A la demo: ",
      soc: "Sóc un dels 150.000. ",
      ia: ["Ets qui escriu les fitxes de personatge del Comando Molekulon, un còmic i una banda del Penedès que vol fer una pel·lícula amb 150.000 persones reals. Escriu en català.",
           "El to: frases curtes i afirmatives, humor abans que èpica, i cap superlatiu. La imatge fantàstica ha d'anomenar una cosa que de debò passa quan aquesta persona fa el que sap fer. Mai diguis que algú és increïble o especial: digues què fa.",
           "Torna'm tres noms de guerra curts que surtin del que sé fer (si ja en tinc un, posa'l primer), un relat de dues o tres frases en segona persona (màxim 40 paraules) i una frase que digui què es veurà als deu segons de vídeo. No inventis res que no t'hagi dit.",
           "El que sé i el que tinc:"]
    },
    es: {
      senseNom: "Sin nombre aún",
      cap: ["Nombre de guerra","Población","Superpoderes","Superarmas","Demo"],
      sap: "Sabe ", porta: " Lleva ", i: " y ", demo: " En la demo: ",
      soc: "Soy uno de los 150.000. ",
      ia: ["Eres quien escribe las fichas de personaje del Comando Molekulon, un cómic y una banda del Penedès que quiere hacer una película con 150.000 personas reales. Escribe en castellano.",
           "El tono: frases cortas y afirmativas, humor antes que épica, y ningún superlativo. La imagen fantástica tiene que nombrar algo que de verdad pasa cuando esta persona hace lo que sabe hacer. Nunca digas que alguien es increíble o especial: di qué hace.",
           "Devuélveme tres nombres de guerra cortos que salgan de lo que sé hacer (si ya tengo uno, ponlo primero), un relato de dos o tres frases en segunda persona (máximo 40 palabras) y una frase que diga qué se verá en los diez segundos de vídeo. No inventes nada que no te haya dicho.",
           "Lo que sé y lo que tengo:"]
    }
  };
  /* Els errors de la base de dades, dits a la persona. El codi és el que
     llença «envia_cromo» (sql/001_comando_cromos.sql). */
  var ERR = {
    nick_ocupat: "Aquest nom de guerra ja és d'algú altre. Tria'n un altre, o recupera el teu amb la clau.",
    nick_reservat: "Aquest nom és d'un dels catorze herois del còmic. Tria'n un de teu.",
    nick_forma: "El nom de guerra ha de tenir almenys dues lletres o números.",
    fitxa_incompleta: "Falten el nom de guerra (de 2 a 40 caràcters) o els superpoders (d'1 a 5).",
    massa_seguit: "Massa enviaments seguits. Torna-ho a provar d'aquí a una estona.",
    res_a_retirar: "No hi ha cap cromo amb aquest nom per retirar.",
    clau_curta: "La clau d'edició no és vàlida.",
    did_forma: "El did del SOS no té la forma bona: comença per did:sos: i es copia sencer del teu perfil."
  };
  var DESA = "molekulon_cromo";
  var lang = "ca", asp = CROMO.aspecte(CROMO.BASE);
  var $ = function(id){ return document.getElementById(id); };
  var llista = function(s){ return s.split(/[,\n;]+/).map(function(x){ return x.trim(); }).filter(Boolean); };
  var etiqueta = function(s){ return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); };
  var desat = function(){ try { var j = JSON.parse(localStorage.getItem(DESA) || "null"); return j && j.nick && j.clau ? j : null; } catch (e) { return null; } };
  var desa = function(v){ try { localStorage.setItem(DESA, JSON.stringify(v)); } catch (e) {} };

  function llegeix(){
    return { nom: $("k-nom").value.trim().slice(0, 40), poders: llista($("k-poders").value).slice(0, 5).map(function(x){ return x.slice(0, 60); }),
             armes: llista($("k-armes").value).slice(0, 5).map(function(x){ return x.slice(0, 60); }),
             demo: $("k-demo").value.trim().slice(0, 160), lloc: $("k-lloc").value.trim().slice(0, 60) };
  }
  function nickDe(v){ var d = desat(); return d ? d.nick : CROMO.nick(v.nom); }

  function redibuixa(){
    var v = llegeix();
    CROMO.pinta($("k-cv"), { nom: v.nom, lloc: v.lloc, poders: v.poders, armes: v.armes, nick: nickDe(v), aspecte: asp });
    var n = nickDe(v);
    $("k-nick").textContent = n ? "@" + n : "—";
  }

  /* Els controls surten de les llistes del dibuix: la pantalla no pot oferir
     una opció que el dibuix no sap pintar. */
  function tries(){
    var O = CROMO.O;
    var fila = function(id, opcions, clau, color){
      var c = $(id); c.innerHTML = "";
      opcions.forEach(function(o){
        var v = Array.isArray(o) ? o[0] : o, b = document.createElement("button");
        b.type = "button";
        if (color) { b.className = "color"; b.style.background = v; b.setAttribute("aria-label", v); }
        else b.textContent = Array.isArray(o) ? o[1] : o;
        b.setAttribute("aria-pressed", String(asp[clau] === v));
        b.addEventListener("click", function(){ asp[clau] = v; tries(); redibuixa(); });
        c.appendChild(b);
      });
    };
    fila("a-col1", O.col, "col1", true); fila("a-col2", O.col, "col2", true);
    fila("a-pell", O.pell, "pell", true); fila("a-cabell", O.cabell, "cabell");
    fila("a-colCab", O.colCab, "colCab", true); fila("a-ulls", O.ulls, "ulls", true);
    fila("a-roba", O.roba, "roba"); fila("a-mascara", O.mascara, "mascara"); fila("a-emblema", O.emblema, "emblema");
  }

  function munta(){
    var t = T[lang], v = llegeix();
    /* Es refà a cada tecla, com el cromo: no hi ha cap botó de «munta» entre
       el que escrius i el que en surt. Sense superpoders encara no hi ha res
       a dir al vídeo, i els blocs esperen. */
    $("k-sortida").hidden = !v.poders.length;
    if (!v.poders.length) return;
    var nom = v.nom || t.senseNom;
    var fitxa = [
      t.cap[0] + ": " + nom,
      v.lloc ? t.cap[1] + ": " + v.lloc : null,
      t.cap[2] + ": " + v.poders.join(", "),
      v.armes.length ? t.cap[3] + ": " + v.armes.join(", ") : null,
      v.demo ? t.cap[4] + ": " + v.demo : null
    ].filter(Boolean).join("\n");
    var relat = (t.sap + v.poders.slice(0, 3).join(", ") + ".") +
      (v.armes.length ? t.porta + v.armes.slice(0, 2).join(t.i) + "." : "") +
      (v.demo ? t.demo + v.demo.replace(/\.$/, "") + "." : "");
    var tags = ["comandomolekulon", "molekulon", "superpoders"];
    if (v.lloc) tags.push(etiqueta(v.lloc));
    v.poders.slice(0, 2).forEach(function(p){ var e = etiqueta(p); if (e && tags.indexOf(e) < 0) tags.push(e); });
    var titol = "Comando Molekulon · " + nom + (v.lloc ? " · " + v.lloc : "");
    var yt = [titol, "", fitxa, "", relat, "", t.soc + "https://molekulon.org", "",
              tags.map(function(x){ return "#" + x; }).join(" ")].join("\n");
    var ia = [t.ia[0], "", t.ia[1], "", t.ia[2], "", t.ia[3], fitxa].join("\n");
    $("k-yt").textContent = yt;
    $("k-ia").textContent = ia;
  }

  function baixa(){
    var v = llegeix(), a = document.createElement("a");
    a.href = $("k-cv").toDataURL("image/png");
    a.download = "cromo-" + (CROMO.nick(v.nom) || "comando") + ".png";
    document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); }, 120);
  }

  /* La clau d'edició. 24 bytes a l'atzar, en base64 d'URL: 32 caràcters que
     ningú endevina i que es poden copiar sense que se'n perdi cap. */
  function novaClau(){
    var b = new Uint8Array(24); crypto.getRandomValues(b);
    return btoa(String.fromCharCode.apply(null, b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function estatEnvia(txt, ok){ var e = $("e-estat"); e.textContent = txt; e.classList.toggle("ok", !!ok); }

  function pintaDesat(){
    var d = desat();
    $("e-desat").hidden = !d;
    if (d) { $("e-desat-nick").textContent = "@" + d.nick; $("e-clau").textContent = d.clau; }
  }

  function envia(retira){
    var v = llegeix(), d = desat();
    if (!retira) {
      if (!v.nom || !v.poders.length) { estatEnvia("Per enviar-lo calen el nom de guerra i almenys un superpoder."); return; }
      if (!$("e-accepto").checked) { estatEnvia("Cal que marquis la casella: la col·lecció és per a persones adultes i per a personatges, no per a persones."); return; }
      var vu = $("e-video").value.trim();
      var dd = $("e-did").value.trim();
      if (dd && !/^did:sos:[a-z0-9-]{4,16}:[A-Za-z0-9_-]{16,64}$/.test(dd)) { estatEnvia(ERR.did_forma); return; }
      if (vu && !CROMO.video(vu)) { estatEnvia("L'enllaç del vídeo ha de ser de YouTube i sencer (https://www.youtube.com/watch?v=… o https://youtu.be/…)."); return; }
    } else if (!d) { estatEnvia("En aquest navegador no hi ha cap cromo teu desat."); return; }
    var n = d ? d.nick : CROMO.nick(v.nom), clau = d ? d.clau : novaClau();
    var fitxa = { nom: v.nom, lloc: v.lloc, poders: v.poders, armes: v.armes, demo: v.demo,
                  relat: $("e-relat").value.trim().slice(0, 300), video: CROMO.video($("e-video").value),
                  did: $("e-did").value.trim().slice(0, 100),
                  aspecte: asp, llengua: lang, v: 1 };
    if (retira) fitxa = { nom: v.nom || n, poders: ["—"], retirat: true, v: 1 };
    $("e-envia").disabled = true; $("e-retira").disabled = true;
    estatEnvia(retira ? "Retirant…" : "Enviant…");
    CROMO.rpc("envia_cromo", { p_nick: n, p_fitxa: fitxa, p_clau: clau, p_retira: !!retira }).then(function(r){
      desa({ nick: n, clau: clau }); pintaDesat(); redibuixa();
      /* Aprovació mixta: el primer cromo l'aprova l'autor, i els canvis d'un
         cromo ja aprovat surten sols. La base de dades diu quin dels dos ha estat. */
      estatEnvia(retira ? "Retirat. Ja no surt a la col·lecció." :
        r && r.estat === "aprovat" ? "Actualitzat. Els canvis ja surten a la col·lecció." :
        "Enviat. Ara és pendent: sortirà a la col·lecció quan l'autor l'aprovi. Guarda't la clau de sota.", true);
    }, function(e){
      estatEnvia(ERR[e.codi] || "No s'ha pogut enviar (" + e.message + "). La fitxa i el cromo segueixen aquí: torna-ho a provar.");
    }).then(function(){ $("e-envia").disabled = false; $("e-retira").disabled = false; });
  }

  /* Mirar com està i recuperar-lo en un altre aparell: amb el nick i la clau,
     «el_meu_cromo» torna l'última versió i en quin estat és. */
  var NOM_ESTAT = { pendent: "pendent d'aprovar", aprovat: "aprovat: surt a la col·lecció", rebutjat: "no aprovat", retirat: "retirat" };
  function recupera(n, clau){
    n = CROMO.nick(n); clau = String(clau || "").trim();
    if (!n || !clau) { estatEnvia("Calen el nom de guerra i la clau."); return; }
    estatEnvia("Buscant…");
    CROMO.rpc("el_meu_cromo", { p_nick: n, p_clau: clau }).then(function(r){
      if (!r) { estatEnvia("No hi ha cap cromo amb aquest nom i aquesta clau."); return; }
      desa({ nick: n, clau: clau }); pintaDesat();
      var f = r.fitxa || {};
      if (!f.retirat) {
        $("k-nom").value = f.nom || ""; $("k-poders").value = (f.poders || []).join(", ");
        $("k-armes").value = (f.armes || []).join(", "); $("k-demo").value = f.demo || "";
        $("k-lloc").value = f.lloc || ""; $("e-relat").value = f.relat || ""; $("e-video").value = f.video || ""; $("e-did").value = f.did || "";
        asp = CROMO.aspecte(f.aspecte); tries();
      }
      redibuixa();
      estatEnvia("@" + n + " · " + (NOM_ESTAT[r.estat] || r.estat) + (r.nota ? " · " + r.nota : ""), r.estat === "aprovat");
    }, function(e){ estatEnvia("No s'ha pogut consultar (" + e.message + ")."); });
  }

  ["k-nom", "k-poders", "k-armes", "k-lloc", "k-demo"].forEach(function(id){
    $(id).addEventListener("input", function(){ redibuixa(); munta(); });
  });
  $("k-baixa").addEventListener("click", baixa);
  $("k-atzar").addEventListener("click", function(){ asp = CROMO.atzar(); tries(); redibuixa(); });
  $("e-envia").addEventListener("click", function(){ envia(false); });
  $("e-retira").addEventListener("click", function(){
    if (confirm("Segur? El cromo deixarà de sortir a la col·lecció ara mateix.")) envia(true);
  });
  $("e-mira").addEventListener("click", function(){ var d = desat(); if (d) recupera(d.nick, d.clau); });
  $("e-recupera").addEventListener("click", function(){ recupera($("r-nick").value, $("r-clau").value); });
  document.querySelectorAll("#kit .copia").forEach(function(b){
    b.addEventListener("click", function(){
      var pre = $(b.dataset.de);
      if (!pre.textContent) return;
      var ok = function(){ b.classList.add("fet"); setTimeout(function(){ b.classList.remove("fet"); }, 1600); };
      var marca = function(){
        /* Si el porta-retalls no respon, el text queda seleccionat per copiar-lo
           a mà. Un botó que no fa res i no ho diu és pitjor. */
        var r = document.createRange(); r.selectNodeContents(pre);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      try { navigator.clipboard.writeText(pre.textContent).then(ok, marca); } catch (e) { marca(); }
    });
  });
  document.querySelectorAll("#kit [data-llengua]").forEach(function(b){
    b.addEventListener("click", function(){
      lang = b.dataset.llengua;
      document.querySelectorAll("#kit [data-llengua]").forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
      munta();
    });
  });
  tries(); pintaDesat(); redibuixa(); munta();
})();
`;

const fila = (id, k) => `<div class="fila"><span class="k">${k}</span><div class="tries" id="${id}"></div></div>`;

const kit = () => `
<header class="hero">
<div class="hero-inner">
<span class="tag">El kit del Comando</span>
<h1>Fes-te <em>el personatge</em></h1>
<p class="sub">Quatre preguntes, com et veus, i surt el teu <strong>cromo</strong> amb la fitxa i el text del
vídeo ja escrits. <strong>No cal compte de res.</strong> Si el vols a <a href="/personatges#cromos">la col·lecció</a>,
al costat dels del còmic, l'envies des d'aquí mateix.</p>
</div>
</header>
<div class="wrap">
<section class="box kit" id="kit">
<div class="llengua" role="group" aria-label="Llengua de la fitxa">
<button type="button" data-llengua="ca" aria-pressed="true">CAT</button>
<button type="button" data-llengua="es" aria-pressed="false">CAST</button>
</div>
<div class="kit-graella">
<div>
<div class="q"><label for="k-nom"><b>1</b>Qui ets, al Comando?</label>
<p class="ajuda">El teu <strong>nom de guerra</strong>, no el teu nom. Si encara no en tens, la IA te'n pot proposar tres (més avall).</p>
<input type="text" id="k-nom" maxlength="40" autocomplete="off"></div>
<div class="q"><label for="k-poders"><b>2</b>Quins superpoders tens?</label>
<p class="ajuda">El que saps fer i podries ensenyar o donar en hores. Fins a cinc, separats per comes. No cal que soni important.</p>
<textarea id="k-poders"></textarea></div>
<div class="q"><label for="k-armes"><b>3</b>I quines superarmes?</label>
<p class="ajuda">El que tens i no fas servir cada dia, i que algú altre podria fer servir. Una escala, una càmera, un local, un trepant.</p>
<textarea id="k-armes"></textarea></div>
<div class="q"><label for="k-demo"><b>4</b>Què ensenyaràs a la demo?</label>
<p class="ajuda">Els deu segons del vídeo on es veu el superpoder funcionant. No ho expliquis: fes-ho.</p>
<input type="text" id="k-demo" maxlength="160" autocomplete="off"></div>
<div class="q"><label for="k-lloc"><b>·</b>D'on ets?</label>
<p class="ajuda">Població o comarca, perquè et trobin a prop. Si no ho vols dir, deixa-ho buit.</p>
<input type="text" id="k-lloc" maxlength="60" autocomplete="off"></div>
<div class="aspecte" role="group" aria-label="Com es veu el personatge">
<label>Com es veu el teu personatge</label>
<p class="ajuda">El dibuix és del personatge, no teu: per això porta antifaç de sèrie. Es pinta sol mentre tries.</p>
${fila('a-col1', 'Vestit')}${fila('a-col2', 'Segon color')}${fila('a-pell', 'Pell')}${fila('a-cabell', 'Cabell')}
${fila('a-colCab', 'Color del cabell')}${fila('a-ulls', 'Ulls')}${fila('a-roba', 'Roba')}${fila('a-mascara', 'Màscara')}
${fila('a-emblema', 'Emblema')}
</div>
<p class="exemple"><strong>Exemple</strong>: Reciclator · soldar, desmuntar electrodomèstics, veure què es pot
arreglar · un taller amb torn i soldador, una furgoneta · munta una llanterna amb una ampolla i un carregador vell.</p>
</div>
<div class="kit-cromo">
<canvas id="k-cv" width="600" height="840" aria-label="El teu cromo, tal com queda"></canvas>
<p class="ajuda" style="text-align:center;margin-top:.4rem">El teu identificador: <strong id="k-nick">—</strong></p>
<div class="botons"><button type="button" class="fer" id="k-baixa">⬇ Baixa el cromo</button>
<button type="button" class="seg" id="k-atzar">🎲 Sorpresa</button></div>
</div>
</div>

<div id="k-sortida" hidden>
<div class="bloc"><h3><span>Per al vídeo de YouTube</span><button type="button" class="copia" data-de="k-yt">Copia</button></h3>
<p class="ajuda">Títol, descripció i etiquetes. <strong>L'etiqueta és el que fa que et trobin</strong>, i el vídeo ha de ser públic.</p>
<pre id="k-yt"></pre></div>
<div class="bloc"><h3><span>Vols que te l'escrigui una IA?</span><button type="button" class="copia" data-de="k-ia">Copia</button></h3>
<p class="ajuda">Copia això i enganxa-ho al xat que facis servir (Claude o qualsevol altre). Et tornarà tres noms de
guerra i el relat amb el to del Comando. El relat el pots enganxar a sota, abans d'enviar el cromo.</p>
<pre id="k-ia"></pre></div>
</div>
</section>

<section class="box kit" id="envia">
<h2>Envia'l a la col·lecció</h2>
<p class="lead"><a href="/personatges#cromos">Els personatges</a> és una sola llista: els del còmic i, darrere, els de la gent. <strong>Hi surt el personatge,
no tu</strong>: el que hi ha al cromo, el relat i el vídeo. No et demanem ni nom, ni correu, ni telèfon.
El primer cromo l'aprova a mà l'autor del Comando, i mentre no ho fa no el veu ningú. <strong>Un cop aprovat, els teus canvis surten sols.</strong></p>
<div class="q"><label for="e-relat">El relat <span class="ajuda">(opcional)</span></label>
<p class="ajuda">El que t'ha escrit la IA, o el que t'escriguis tu. Dues o tres frases.</p>
<textarea id="e-relat" maxlength="300"></textarea></div>
<div class="q"><label for="e-video">El vídeo de la demo <span class="ajuda">(opcional ara, necessari per aprovar-lo)</span></label>
<p class="ajuda">L'enllaç de YouTube, públic. Si vols el secret de debò, penja'l des d'un canal a nom del personatge.</p>
<input type="url" id="e-video" placeholder="https://www.youtube.com/watch?v=…" autocomplete="off"></div>
<div class="q"><label for="e-did">El teu did del SOS <span class="ajuda">(opcional)</span></label>
<p class="ajuda">Si ja tens perfil al <a href="${SOS}/SOS/online.html" rel="noopener">directori del SOS ↗</a>, enganxa
aquí el teu <code>did:sos:…</code>. Si allà fas servir el mateix @nick que aquí, el cromo porta la marca
<strong>comprovat al SOS</strong>. Per sortir a la col·lecció no cal.</p>
<input type="text" id="e-did" placeholder="did:sos:…" autocomplete="off" spellcheck="false"></div>
<label class="accepto"><input type="checkbox" id="e-accepto"> Sóc major d'edat, el vídeo és meu, i accepto que el
personatge surti a la col·lecció de molekulon.org si l'autor l'aprova.</label>
<div class="botons"><button type="button" class="fer" id="e-envia">Envia'l a la col·lecció</button></div>
<p class="estat" id="e-estat" role="status" aria-live="polite"></p>

<div class="bloc" id="e-desat" hidden>
<h3><span>El teu cromo és <span id="e-desat-nick"></span></span><button type="button" class="copia" data-de="e-clau">Copia la clau</button></h3>
<p class="ajuda"><strong>Aquesta és la teva clau d'edició.</strong> Amb ella pots canviar el cromo, mirar si
ja és aprovat o retirar-lo, des d'aquí o des d'un altre aparell. Guarda-la: <strong>no la podem recuperar</strong>,
perquè no tenim el teu correu. Si tornes a enviar, s'envia una versió nova del mateix cromo; si ja estava aprovat, surt a l'instant.</p>
<pre class="clau" id="e-clau"></pre>
<div class="botons"><button type="button" class="seg" id="e-mira">Mira com està</button>
<button type="button" class="seg" id="e-retira">Retira'l de la col·lecció</button></div>
</div>

<details>
<summary>Ja tens un cromo i ets en un altre aparell?</summary>
<div class="q"><label for="r-nick">Nom de guerra</label><input type="text" id="r-nick" autocomplete="off"></div>
<div class="q"><label for="r-clau">Clau d'edició</label><input type="text" id="r-clau" autocomplete="off" spellcheck="false"></div>
<div class="botons"><button type="button" class="seg" id="e-recupera">Recupera'l</button></div>
</details>
</section>

<section class="box">
<h3>Les regles, abans que les preguntis</h3>
<ul class="lead">
<li><strong>Identitat secreta.</strong> Al Comando hi surt el personatge, no la persona: ni nom, ni cognoms, ni edat, ni manera de contactar-te.</li>
<li><strong>El vídeo pot ser amb màscara</strong>, de disfressa, de mans o en off. El que ha de sortir és la demo, no la teva cara.</li>
<li><strong>Pseudònim no vol dir anònim.</strong> Qui et conegui et reconeixerà per la veu o pel taller. Si vols el secret de debò, penja'l des d'un canal a nom del personatge.</li>
<li><strong>Menors no.</strong> Això és per a persones adultes. A l'aula es fa amb <a href="${SOS}/escola" rel="noopener">la Fàbrica de Superherois ↗</a>, sense penjar res.</li>
<li><strong>Es publica</strong> el que respon les quatre preguntes, porta un vídeo que és seu i és d'una persona de debò. <strong>No es publica</strong> el que ataca algú.</li>
<li><strong>Es pot retirar</strong> quan vulguis, sense donar explicacions: amb la clau, surt de la col·lecció a l'instant.</li>
</ul>
<div class="acts"><a href="/historia#com-es-penja">Com es penja el vídeo</a><a href="/personatges#cromos">Mira la col·lecció</a></div>
</section>
</div>
<script>${CROMO_JS}
CROMO.API.url = ${JSON.stringify(SUPA.url)}; CROMO.API.key = ${JSON.stringify(SUPA.key)};
${KIT_JS}</script>`;

/* ══ ELS CROMOS DE LA GENT, VIUS ═════════════════════════════════════════════
   Una sola llista: els catorze del còmic i, a continuació, els de la gent que
   s'hi ha apuntat. Els catorze es generen com sempre; els de la gent es llegeixen
   **en directe** del Supabase del SOS (projecte Teamtowershuma, el mateix que el
   directori de /SOS/online) i s'afegeixen a la mateixa graella. Un cromo
   aprovat surt a l'instant, sense tocar el repositori ni tornar a desplegar.
   Les regles de la taula són a `sql/001_comando_cromos.sql`.

   Per què aquí no hi ha `data/directori.json` com proposava l'estudi d'alta
   (opció A): l'encàrrec és que la fitxa vagi a una base de dades que s'actualitzi
   des de la web, que és l'opció C del mateix estudi, i la infraestructura ja hi
   era. El que es manté de l'estudi és el que importava: aprovació a mà,
   personatges secrets, cap dada personal, i el pont amb el SOS per un `did`
   opcional (§3) que dona la marca «comprovat al SOS» quan l'última fitxa amb
   firma vàlida d'aquell `did` porta el mateix @nick (vegeu marcaSOS).

   La clau és **publicable per disseny**. El que protegeix les dades és que la
   taula és tancada i només s'hi entra per tres funcions (vegeu el SQL). */
const SUPA = { url: 'https://grkgrceioxktmbwdhvmm.supabase.co', key: 'sb_publishable_xsEfyOqJ5tJwaxcoH_CiNg_SlsqDZb1' };

const GENT_CSS = `
.cerca{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin:1rem 0 0}
.cerca input{font:inherit;flex:1;min-width:12rem;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:.55rem .7rem}
.cerca span{font-size:.84rem;color:var(--muted)}
.cromo.gent .marc{aspect-ratio:5/7}
.cromo.gent canvas{width:100%;height:100%;display:block}
.cromo.gent .rol a{font-weight:600;text-decoration:none}
.cromo .sos{display:inline-block;font-size:.7rem;font-weight:700;color:var(--green);border:1px solid var(--green);border-radius:999px;padding:.05rem .5rem;margin-left:.3rem}
.gent-estat{color:var(--light);font-size:.9rem}
`;

const GENT_JS = String.raw`
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var graella = $("cromos");
  var el = function(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var str = function(x, n){ return typeof x === "string" ? x.slice(0, n) : ""; };
  var arr = function(x){ return Array.isArray(x) ? x.filter(function(s){ return typeof s === "string"; }).map(function(s){ return s.slice(0, 60); }).slice(0, 5) : []; };

  /* Mateixa forma que els cromos del còmic —marc, nom, rol, dl—, perquè la
     llista es llegeixi com una sola col·lecció. Tot el text va per textContent:
     el que arriba de la base de dades ho ha escrit qualsevol. */
  function targeta(c){
    var f = c.fitxa || {};
    var d = { nom: str(f.nom, 40), lloc: str(f.lloc, 60), poders: arr(f.poders), armes: arr(f.armes), nick: c.nick, aspecte: f.aspecte };
    var a = el("article", "cromo gent"), marc = el("div", "marc"), cv = document.createElement("canvas");
    cv.width = 600; cv.height = 840;
    CROMO.pinta(cv, d);
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Cromo de " + d.nom);
    marc.appendChild(cv); a.appendChild(marc);
    var cos = el("div", "cos");
    cos.appendChild(el("h3", "", d.nom));
    var rol = el("p", "rol", "@" + c.nick + (d.lloc ? " · " + d.lloc : ""));
    if (c.sos === true) { var s = el("span", "sos", "comprovat al SOS"); s.title = "La seva última fitxa al SOS, amb la firma comprovada en aquest navegador, porta aquest mateix @nick"; rol.appendChild(s); }
    cos.appendChild(rol);
    var dl = el("dl");
    var fila = function(k, v){ if (!v) return; dl.appendChild(el("dt", "", k)); dl.appendChild(el("dd", "", v)); };
    fila("Superpoders", d.poders.join(" · "));
    fila("Superarmes", d.armes.join(" · "));
    fila("La demo", str(f.demo, 160));
    cos.appendChild(dl);
    if (f.relat) cos.appendChild(el("p", "lletra", str(f.relat, 300)));
    var v = CROMO.video(f.video), enl = [];
    if (v) enl.push(["Mira la demo ↗", v]);
    if (c.sos === true) enl.push(["El directori del SOS ↗", "https://teamtowershuma.com/SOS/online.html"]);
    if (enl.length) {
      var p = el("p", "rol");
      enl.forEach(function(e, i){
        var l = el("a", "", e[0]); l.href = e[1]; l.rel = "noopener nofollow"; l.target = "_blank";
        if (i) p.appendChild(document.createTextNode(" · "));
        p.appendChild(l);
      });
      cos.appendChild(p);
    }
    a.appendChild(cos);
    return a;
  }

  var tots = [], gent = 0;
  function compta(){
    var q = $("q").value.trim().toLowerCase(), n = 0;
    tots.forEach(function(a){
      var ok = !q || a.textContent.toLowerCase().indexOf(q) >= 0;
      a.hidden = !ok; if (ok) n++;
    });
    $("q-n").textContent = q ? n + (n === 1 ? " cromo" : " cromos") + " amb «" + q + "»"
      : graella.children.length - gent + " del còmic" + (gent ? " · " + gent + " de la gent" : "");
  }
  function refa(){ tots = Array.prototype.slice.call(graella.children); compta(); }
  $("q").addEventListener("input", compta);
  refa();

  /* ── La marca «comprovat al SOS», comprovada de debò ──────────────────────
     La taula del SOS (online_fitxes) accepta files de qualsevol: la integritat
     no la dona el permís, la dona la firma, i Postgres no la pot comprovar. Per
     això la marca no surt de la base de dades sinó d'aquí: per cada did es
     llegeixen les seves fitxes i es pren **la més nova amb firma vàlida**, com
     fa /SOS/online. Abans es prenia l'última fila, i qualsevol podia posar el
     did d'una altra persona i el seu nick, i sortir «comprovat» (veda 61).

     «canon», «didDe» i «valida» són còpia literal de «_canon», «_didFromJwk» i
     «fitxaValida» de teamtowershuma SOS/online.html. Si divergissin, cap firma
     del SOS quadraria aquí: si allà canvien, es canvien aquí. */
  var te = new TextEncoder();
  var b64u = function(b){ var s = "", u = new Uint8Array(b); for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  var unb64u = function(t){ var s = (t + "===".slice((t.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/"), bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  function canon(v){
    if (v === null || typeof v !== "object") return JSON.stringify(v);
    if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
    var k = Object.keys(v).filter(function(x){ return x !== "sig" && x !== "signer" && x !== "sigTs" && x !== "hash" && v[x] !== undefined; }).sort();
    return "{" + k.map(function(x){ return JSON.stringify(x) + ":" + canon(v[x]); }).join(",") + "}";
  }
  function didDe(alg, jwk){
    return crypto.subtle.digest("SHA-256", te.encode(canon(jwk))).then(function(h){ return "did:sos:" + alg.toLowerCase() + ":" + b64u(h).slice(0, 32); });
  }
  function valida(f){
    if (!f || typeof f !== "object" || !f.sig || !f.signer || !f.signer.pubJwk || !f.signer.alg) return Promise.resolve(false);
    if (!f.did || f.signer.did !== f.did) return Promise.resolve(false);
    var alg = f.signer.alg, ed = alg === "Ed25519";
    return didDe(alg, f.signer.pubJwk).then(function(d){
      if (d !== f.did) return false;
      return crypto.subtle.importKey("jwk", f.signer.pubJwk, ed ? { name: "Ed25519" } : { name: "ECDSA", namedCurve: "P-256" }, true, ["verify"])
        .then(function(k){ return crypto.subtle.verify(ed ? { name: "Ed25519" } : { name: "ECDSA", hash: "SHA-256" }, k, unb64u(f.sig), te.encode(canon(f))); });
    }).catch(function(){ return false; });
  }
  /* La primera vàlida de la llista, que ja ve de la més nova a la més vella. */
  function primeraValida(llista){
    return llista.reduce(function(p, f){ return p.then(function(t){ return t || valida(f).then(function(ok){ return ok ? f : null; }); }); }, Promise.resolve(null));
  }
  function marcaSOS(files){
    var dids = files.map(function(c){ var d = c.fitxa && c.fitxa.did; return typeof d === "string" && /^did:sos:[a-z0-9-]{4,16}:[A-Za-z0-9_-]{16,64}$/.test(d) ? d : null; })
      .filter(function(d, i, a){ return d && a.indexOf(d) === i; });
    if (!dids.length || !(window.crypto && crypto.subtle)) return Promise.resolve(files);
    return fetch(CROMO.API.url + "/rest/v1/online_fitxes?select=did,fitxa&order=creat.desc&limit=500&did=in.(" + dids.map(encodeURIComponent).join(",") + ")", {
      headers: { apikey: CROMO.API.key, Authorization: "Bearer " + CROMO.API.key }
    }).then(function(r){ return r.ok ? r.json() : []; }).then(function(rows){
      var per = {};
      (Array.isArray(rows) ? rows : []).forEach(function(r){ (per[r.did] = per[r.did] || []).push(r.fitxa); });
      return Promise.all(dids.map(function(d){ return primeraValida(per[d] || []).then(function(f){ return [d, f]; }); }));
    }).then(function(parells){
      var bona = {};
      parells.forEach(function(p){ bona[p[0]] = p[1]; });
      files.forEach(function(c){
        var f = bona[c.fitxa && c.fitxa.did];
        c.sos = !!f && f.nick === c.nick && f.retirada !== true;
      });
      return files;
    }, function(){ return files; });
  }

  CROMO.rpc("directori_cromos", {}).then(function(files){
    files = Array.isArray(files) ? files : [];
    $("gent-estat").textContent = files.length ? ""
      : "Encara no hi ha cap cromo de la gent aprovat. El primer pot ser el teu.";
    return marcaSOS(files);
  }).then(function(files){
    files.forEach(function(c){ graella.appendChild(targeta(c)); });
    gent = files.length;
    refa();
  }, function(){
    $("gent-estat").textContent = "Ara mateix no s'han pogut llegir els cromos de la gent. No és que no n'hi hagi: torna-ho a provar d'aquí a una estona.";
  });
})();
`;

/* ══ LA MODERACIÓ ════════════════════════════════════════════════════════════
   Aprovar un cromo és un clic, no una visita al panell de Supabase. La pàgina
   no s'enllaça des d'enlloc, no surt al sitemap i porta `noindex`, però el que
   la protegeix no és amagar-la: és la clau de moderador. Les funcions
   `modera_llista` i `modera_cromo` (sql/001_comando_cromos.sql) no fan res
   sense una clau que quadri amb `comando_moderadors`, i aquella taula no la pot
   llegir ningú des de fora. Per afegir algú que moderi, s'hi insereix el resum
   SHA-256 de la seva clau. */
/* Les classes del giny de la matriu (js/ia-a-la-vista.js). */
const IA_CSS = `
.iav-cifra{font-size:clamp(1.6rem,5vw,2.2rem);font-weight:700}
.iav-nota{color:var(--light);font-size:.85rem}
.iav-llista{list-style:none;margin-top:.6rem;padding:0}
.iav-llista li{display:flex;gap:.6rem;align-items:baseline;border-top:1px solid var(--border);padding:.45rem 0;font-size:.85rem}
.iav-llista a{flex:1;min-width:0;overflow-wrap:anywhere}
.iav-tag{flex:none;font-size:.72rem;padding:1px 8px;border-radius:999px;border:1px solid var(--border);color:var(--muted)}
.iav-tag.iav-ia{border-color:var(--purple);color:var(--text)}
`;

const MODERA_CSS = `
.mod .clau{display:flex;gap:.5rem;flex-wrap:wrap}
.mod input,.mod textarea{font:inherit;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:.5rem .7rem}
.mod .clau input{flex:1;min-width:14rem;font-family:var(--mono)}
.mod button{font:inherit;font-weight:700;cursor:pointer;border-radius:10px;padding:.45rem .9rem;border:1px solid var(--border);background:transparent;color:var(--text)}
.mod button.si{background:var(--green);border-color:var(--green);color:#0b0b12}
.mod button.no{border-color:var(--orange);color:var(--orange)}
.mod .filtres{display:flex;gap:.4rem;flex-wrap:wrap;margin:.8rem 0}
.mod .filtres button[aria-pressed="true"]{background:var(--text);color:#0b0b12}
.mod .estat{min-height:1.3em;font-size:.86rem;color:var(--orange)}
.mod-llista{display:grid;gap:.8rem}
.mod-fila{display:grid;grid-template-columns:150px 1fr;gap:.9rem;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:.7rem}
@media (max-width:560px){.mod-fila{grid-template-columns:1fr}.mod-fila canvas{max-width:200px}}
.mod-fila canvas{width:100%;border-radius:8px;display:block}
.mod-fila h3{font-size:1rem}
.mod-fila p{margin:.25rem 0;font-size:.84rem;color:var(--light)}
.mod-fila .k{font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.mod-fila .accions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem;align-items:center}
.mod-fila .accions input{flex:1;min-width:10rem;font-size:.84rem}
.est-pendent{color:var(--orange)}.est-aprovat{color:var(--green)}.est-rebutjat,.est-retirat{color:var(--muted)}
`;

const MODERA_JS = String.raw`
(function(){
  "use strict";
  var $ = function(id){ return document.getElementById(id); };
  var CLAU = "molekulon_moderador", files = [], filtre = "pendent";
  var el = function(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var clau = function(){ return $("m-clau").value.trim(); };
  var estat = function(t){ $("m-estat").textContent = t || ""; };
  try { $("m-clau").value = localStorage.getItem(CLAU) || ""; } catch (e) {}

  function fila(c){
    var f = c.fitxa || {}, a = el("article", "mod-fila"), cv = document.createElement("canvas");
    cv.width = 600; cv.height = 840;
    CROMO.pinta(cv, { nom: String(f.nom || ""), lloc: String(f.lloc || ""), poders: f.poders || [], armes: f.armes || [], nick: c.nick, aspecte: f.aspecte });
    a.appendChild(cv);
    var cos = el("div");
    cos.appendChild(el("h3", "", (f.nom || c.nick) + "  ·  @" + c.nick));
    var e = el("p", "k est-" + c.estat, c.estat + " · enviat " + new Date(c.creat).toLocaleString("ca-ES") + (f.retirat ? " · l'ha retirat la persona" : ""));
    cos.appendChild(e);
    var txt = function(k, v){ if (!v) return; cos.appendChild(el("p", "k", k)); cos.appendChild(el("p", "", v)); };
    txt("Superpoders", (f.poders || []).join(" · "));
    txt("Superarmes", (f.armes || []).join(" · "));
    txt("La demo", f.demo); txt("El relat", f.relat); txt("did", f.did);
    var v = CROMO.video(f.video);
    if (v) { var p = el("p"), l = el("a", "", "Mira el vídeo ↗"); l.href = v; l.target = "_blank"; l.rel = "noopener nofollow"; p.appendChild(l); cos.appendChild(p); }
    else cos.appendChild(el("p", "est-pendent", "Sense vídeo de YouTube"));
    var ac = el("div", "accions"), nota = el("input");
    nota.placeholder = "Nota per a la persona (opcional)"; nota.value = c.nota || "";
    var boto = function(txt, cls, nou){
      var b = el("button", cls, txt); b.type = "button";
      b.addEventListener("click", function(){ decideix(c, nou, nota.value); });
      ac.appendChild(b);
    };
    if (c.estat !== "aprovat") boto("Aprova", "si", "aprovat");
    if (c.estat === "pendent") boto("Rebutja", "no", "rebutjat");
    if (c.estat === "aprovat") boto("Retira", "no", "retirat");
    ac.appendChild(nota);
    cos.appendChild(ac);
    a.appendChild(cos);
    return a;
  }

  function pinta(){
    var l = $("m-llista"); l.innerHTML = "";
    var vis = files.filter(function(c){ return filtre === "tots" || c.estat === filtre; });
    vis.forEach(function(c){ l.appendChild(fila(c)); });
    var n = files.filter(function(c){ return c.estat === "pendent"; }).length;
    $("m-n").textContent = n + (n === 1 ? " pendent" : " pendents");
    if (!vis.length) l.appendChild(el("p", "lead", "Res en aquesta llista."));
  }

  /* La porta no peta amb una clau dolenta: ho diu, perquè l'intent quedi
     anotat (sql/002_auditoria_cervell.sql). */
  var PORTA = {
    no_moderador: "Aquesta clau no és de moderador.",
    massa_intents: "Massa intents amb una clau dolenta: la moderació es tanca uns minuts. Mentrestant, es pot fer des de Supabase."
  };
  function carrega(){
    if (!clau()) { estat("Cal la clau de moderador."); return; }
    estat("Carregant…");
    CROMO.rpc("modera_llista", { p_clau: clau() }).then(function(r){
      if (r && r.error) { estat(PORTA[r.error] || "No s'ha pogut carregar (" + r.error + ")."); return; }
      try { localStorage.setItem(CLAU, clau()); } catch (e) {}
      files = Array.isArray(r) ? r : []; estat(""); $("m-tauler").hidden = false; pinta();
    }, function(e){ estat(PORTA[e.codi] || "No s'ha pogut carregar (" + e.message + ")."); });
  }

  function decideix(c, nou, nota){
    estat("Desant…");
    CROMO.rpc("modera_cromo", { p_clau: clau(), p_id: c.id, p_estat: nou, p_nota: nota || null }).then(function(r){
      if (r && r.error) { estat(PORTA[r.error] || "No s'ha pogut desar (" + r.error + ")."); return; }
      c.estat = nou; c.nota = nota; estat("@" + c.nick + " · " + nou); pinta();
    }, function(e){ estat("No s'ha pogut desar (" + e.message + ")."); });
  }

  $("m-entra").addEventListener("click", carrega);
  $("m-clau").addEventListener("keydown", function(e){ if (e.key === "Enter") carrega(); });
  document.querySelectorAll("[data-filtre]").forEach(function(b){
    b.addEventListener("click", function(){
      filtre = b.dataset.filtre;
      document.querySelectorAll("[data-filtre]").forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
      pinta();
    });
  });
  if (clau()) carrega();
})();
`;

const modera = () => `
<div class="wrap">
<section class="box mod">
<h2>Moderar els cromos</h2>
<p class="lead">Els cromos que la gent envia des del <a href="${KIT}">kit</a>. Aprovar-ne un el posa a
<a href="/personatges#cromos">la col·lecció</a> a l'instant; retirar-lo el treu igual de ràpid.</p>
<div class="clau"><input type="password" id="m-clau" placeholder="Clau de moderador" autocomplete="current-password" aria-label="Clau de moderador">
<button type="button" class="si" id="m-entra">Entra</button></div>
<p class="estat" id="m-estat" role="status" aria-live="polite"></p>
<div id="m-tauler" hidden>
<div class="filtres" role="group" aria-label="Quins cromos">
<button type="button" data-filtre="pendent" aria-pressed="true">Pendents · <span id="m-n"></span></button>
<button type="button" data-filtre="aprovat" aria-pressed="false">Aprovats</button>
<button type="button" data-filtre="tots" aria-pressed="false">Tots</button>
</div>
<div class="mod-llista" id="m-llista"></div>
</div>
</section>
</div>
<script>${CROMO_JS}
CROMO.API.url = ${JSON.stringify(SUPA.url)}; CROMO.API.key = ${JSON.stringify(SUPA.key)};
${MODERA_JS}</script>`;

/* ══ LA IA ═══════════════════════════════════════════════════════════════════
   Veda 167 de TeamTowers: el que fa la IA es mostra llegint-lo de l'historial.
   El giny és el de la matriu i s'hi enllaça, no es copia (veda 71). El que hi
   ha dins el div és el recanvi si GitHub no respon. */
const REPO = 'asolache/molekulonorg';
const ia = () => `
<div class="wrap">
<section class="box proposit">
<h2>Com fem servir la IA</h2>
<p class="lead">Aquesta web es fa amb Claude, i ho diem. El compromís és de l'Àlvar Solache:
<b>cobri el que cobri per token, el codex sempre serà el més intel·ligent possible al menor cost energètic.</b></p>
</section>
<section class="box">
<h3>Què fa la IA i què fem nosaltres</h3>
<p class="lead">Claude escriu el codi i els textos que se li demanen, i proposa cada canvi en un PR que porta la seva firma.
Abans d'escriure llegeix el codex de <a href="${SOS}/SOS/vedes.html" rel="noopener">TeamTowers</a>, per no repetir errors ja pagats.
Nosaltres demanem, decidim i acceptem: res no es publica sense que algú ho fusioni. El relat, els personatges i la música són de la gent del Comando.</p>
</section>
<section class="box">
<h3>El que es pot comprovar</h3>
<p class="lead">No ho escrivim a mà: surt de l'historial públic cada cop que obres la pàgina. Un commit fet amb Claude porta la línia <code>Co-Authored-By: Claude</code>.</p>
<div class="iav" data-ia-a-la-vista="${REPO}"><p class="mut">L'historial és a <a href="https://github.com/${REPO}/commits/main" rel="noopener">github.com/${REPO}</a>.</p></div>
</section>
<section class="box">
<h3>El que costa</h3>
<p class="lead">El preu per token el posa qui ven el model; el que es gasta ho decidim nosaltres. Cada tasca va amb el model més petit que la fa bé.
El cost real, amb la font i la data del preu, és a <a href="${SOS}/conecta/#ia" rel="noopener">teamtowershuma.com/conecta</a>, i l'han de pagar els ingressos recurrents dels serveis.
L'energia no la mesurem directament: els tokens en són l'aproximació, i ho diem així.</p>
</section>
</div>
<script src="${SOS}/js/ia-a-la-vista.js" defer></script>`;

/* ══ EL SITEMAP ══════════════════════════════════════════════════════════════ */
const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGINES.filter(p => p.menu !== false || p.mapa).map(p => `<url><loc>${url(p.f)}</loc></url>`).join('\n')}
</urlset>
`;

/* ══ ESCRIURE ════════════════════════════════════════════════════════════════ */
const COSSOS = { 'index.html': portada, 'historia.html': historia, 'personatges.html': personatges, 'peli.html': peli, 'musica.html': musica, 'comic.html': comic, 'kit.html': kit, 'modera.html': modera, 'ia.html': ia };
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
