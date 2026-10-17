#!/usr/bin/env node
/* La prova de la marca «comprovat al SOS»
 * ─────────────────────────────────────────────────────────────────────────
 * La marca la decideix el navegador: comprova la firma de la fitxa del SOS amb
 * el codi que hi ha a `personatges.html`. Una comprovació de firma que ningú
 * ha vist fallar no se sap si comprova res (veda 50), i la primera versió de
 * la marca no comprovava res. Això treu aquell codi de la pàgina generada,
 * fabrica fitxes firmades de debò i falses, i peta si en dona una per bona que
 * no ho és o al revés.
 *
 * Ús:  node tools/prova-firma.js
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const html = readFileSync(join(__dirname, '..', 'personatges.html'), 'utf8');
const a = html.indexOf('var te = new TextEncoder();'), b = html.indexOf('function marcaSOS');
if (a < 0 || b < a) { console.log('✗ No trobo el codi de la firma a personatges.html.'); process.exit(1); }
const { valida, didDe, canon } = new Function(html.slice(a, b) + '; return { valida, didDe, canon };')();

const te = new TextEncoder();
const parametres = alg => alg === 'Ed25519' ? { name: 'Ed25519' } : { name: 'ECDSA', hash: 'SHA-256' };
async function fitxa(nick, pair, alg, didAltri) {
  const pubJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const did = didAltri || await didDe(alg, pubJwk);
  const f = { tipus: 'sos-online-fitxa', did, nick, nom: 'Prova' };
  const sig = await crypto.subtle.sign(parametres(alg), pair.privateKey, te.encode(canon(f)));
  return Object.assign(f, { signer: { did, alg, pubJwk }, sig: Buffer.from(sig).toString('base64url'), sigTs: 1 });
}

(async () => {
  const ed = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const ec = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const bona = await fitxa('nigiri', ed, 'Ed25519');
  const casos = [
    ['una fitxa firmada amb Ed25519 és vàlida', bona, true],
    ['una fitxa firmada amb ECDSA P-256 és vàlida', await fitxa('nigiri', ec, 'ECDSA-P256'), true],
    ['canviar el nick d\'una fitxa firmada la invalida', { ...bona, nick: 'intrus' }, false],
    ['una firma brossa no passa', { ...bona, sig: 'AAAA' }, false],
    ['el did d\'una altra persona, firmat amb la clau pròpia, no passa', await fitxa('intrus', ec, 'ECDSA-P256', bona.did), false],
    ['una fitxa sense firma no passa', { did: bona.did, nick: 'nigiri' }, false],
  ];
  console.log('Prova de la marca «comprovat al SOS»');
  let fails = 0;
  for (const [diu, f, esperat] of casos) {
    const ok = (await valida(f)) === esperat;
    if (!ok) fails++;
    console.log(`  ${ok ? '✓' : '✗'} ${diu}`);
  }
  console.log(fails ? `\n❌ ${fails} cas${fails === 1 ? '' : 'os'} que no fan el que han de fer.` : '\n✅ La marca només surt amb una firma bona.');
  process.exit(fails ? 1 : 0);
})();
