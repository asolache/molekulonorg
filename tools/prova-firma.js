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
const { daqui, casos } = require('./firma.js');

(async () => {
  const aqui = daqui();
  console.log('Prova de la marca «comprovat al SOS»');
  const llista = await casos(aqui);
  let fails = 0;
  for (const [diu, f, esperat] of llista) {
    const ok = (await aqui.valida(f)) === esperat;
    if (!ok) fails++;
    console.log(`  ${ok ? '✓' : '✗'} ${diu}`);
  }
  console.log(fails ? `\n❌ ${fails} cas${fails === 1 ? '' : 'os'} que no fan el que han de fer.` : '\n✅ La marca només surt amb una firma bona.');
  process.exit(fails ? 1 : 0);
})();
