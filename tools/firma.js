/* La firma del SOS: el codi d'aquí, el de dalt i les fitxes de prova
 * ─────────────────────────────────────────────────────────────────────────
 * «canon», «didDe» i «valida» de `personatges.html` són una còpia de
 * «_canon», «_didFromJwk» i «fitxaValida» de teamtowershuma SOS/online.html
 * (veda 71). La còpia no és de text —allà és ES2017 compacte, aquí ES5— i per
 * això no es compara el text sinó el que fan: totes dues han de donar el mateix
 * resultat per a les mateixes fitxes. Ho fan servir `prova-firma.js` (a cada
 * empenta, només el codi d'aquí) i `sync.js` (cada setmana, contra el de dalt).
 */
'use strict';
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

/* El codi de la firma tal com el serveix la pàgina generada. */
function daqui() {
  const html = readFileSync(join(__dirname, '..', 'personatges.html'), 'utf8');
  const a = html.indexOf('var te = new TextEncoder();'), b = html.indexOf('function marcaSOS');
  if (a < 0 || b < a) throw new Error('no trobo el codi de la firma a personatges.html');
  return new Function(html.slice(a, b) + '; return { valida, didDe, canon };')();
}

/* Una definició de primer nivell de `online.html`, des del seu nom fins que
   tanca. Es llegeix caràcter a caràcter saltant cadenes, comentaris i el que
   va escapat, perquè «'{'» de `_canon` no obre res i «/\//g» de `_b64u` no és
   cap comentari. */
function definicio(src, nom) {
  const m = new RegExp(`^(?:async function ${nom}\\(|function ${nom}\\(|const ${nom}=)`, 'm').exec(src);
  if (!m) throw new Error(`no trobo «${nom}» a SOS/online.html`);
  let i = m.index, fons = 0, obert = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++;
    } else if (c === '\\') i++;
    else if (c === '/' && src[i + 1] === '*') i = src.indexOf('*/', i + 2) + 1;
    else if (c === '/' && src[i + 1] === '/') i = src.indexOf('\n', i) - 1;
    else if ('({['.includes(c)) { fons++; obert = true; }
    else if (')}]'.includes(c)) fons--;
    else if (obert && fons === 0 && (c === ';' || c === '\n')) break;
  }
  return src.slice(m.index, i + 1);
}

/* El codi de la firma de dalt, amb les peces de què depèn i res més. */
function dedalt(html) {
  const noms = ['_te', '_b64u', '_unb64u', 'sha256', '_signParams', '_importPub',
    '_canon', '_payload', '_didFromJwk', 'verifyRecord', 'fitxaValida'];
  const codi = noms.map(n => definicio(html, n)).join('\n');
  const { _canon, _didFromJwk, fitxaValida } = new Function(codi + '\nreturn { _canon, _didFromJwk, fitxaValida };')();
  return { canon: _canon, didDe: _didFromJwk, valida: async f => (await fitxaValida(f)).ok };
}

/* Fitxes de prova firmades de debò, i les maneres de falsificar-les que ja
   s'han vist o que es veuen venir. Es fabriquen amb el `didDe` i el `canon`
   que se li passen: si són els d'aquí, es prova que el codi d'aquí és bo. */
async function casos({ didDe, canon }) {
  const te = new TextEncoder();
  const parametres = alg => alg === 'Ed25519' ? { name: 'Ed25519' } : { name: 'ECDSA', hash: 'SHA-256' };
  async function fitxa(nick, pair, alg, didAltri) {
    const pubJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    const did = didAltri || await didDe(alg, pubJwk);
    const f = { tipus: 'sos-online-fitxa', did, nick, nom: 'Prova' };
    const sig = await crypto.subtle.sign(parametres(alg), pair.privateKey, te.encode(canon(f)));
    return Object.assign(f, { signer: { did, alg, pubJwk }, sig: Buffer.from(sig).toString('base64url'), sigTs: 1 });
  }
  /* El JWK tornant de Postgres com a `jsonb` arriba amb les claus en un altre
     ordre (veda 135 de dalt): el did no s'hi ha de moure. */
  const desordena = o => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.length - b.length || b.localeCompare(a)));
  const ed = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const ec = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const bona = await fitxa('nigiri', ed, 'Ed25519');
  return [
    ['una fitxa firmada amb Ed25519 és vàlida', bona, true],
    ['una fitxa firmada amb ECDSA P-256 és vàlida', await fitxa('nigiri', ec, 'ECDSA-P256'), true],
    ['el JWK amb les claus en un altre ordre segueix sent vàlid', { ...bona, signer: { ...bona.signer, pubJwk: desordena(bona.signer.pubJwk) } }, true],
    ['canviar el nick d\'una fitxa firmada la invalida', { ...bona, nick: 'intrus' }, false],
    ['una firma brossa no passa', { ...bona, sig: 'AAAA' }, false],
    ['el did d\'una altra persona, firmat amb la clau pròpia, no passa', await fitxa('intrus', ec, 'ECDSA-P256', bona.did), false],
    ['un signer amb un altre did no passa', { ...bona, signer: { ...bona.signer, did: 'did:sos:ed25519:' + 'x'.repeat(32) } }, false],
    ['una fitxa sense firma no passa', { did: bona.did, nick: 'nigiri' }, false],
  ];
}

module.exports = { daqui, dedalt, casos };
