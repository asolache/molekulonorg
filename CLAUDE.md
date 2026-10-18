# Molekulon.org · com s'hi treballa

Abans d'escriure res, llegeix en aquest ordre: `saber/MAPA.md`, `saber/codex.md`,
`saber/per-a-la-ia.md`, `saber/taxonomia.md` i `saber/traspas.md`.

## Comunicació

- Gastar pocs tokens explicant el procés: no narrar exploracions, plans
  intermedis ni justificacions pas a pas.
- Publicar **només el resum final del que s'ha fet**, un cop fet.
- Avisos curts només si hi ha un canvi de direcció o un bloqueig de debò.
- Format: llista breu. Sense preàmbuls del tipus «ara faré…».

## Aquest projecte

- Web estàtica a Netlify, publicada des de `main`. Les pàgines es generen:
  s'edita `tools/build.js` o `data/`, mai un `.html`.
- Abans d'empènyer: `node tools/build.js --check && node tools/check.js && node tools/prova-firma.js && node guardas/cervell.js --check`.
- És filla de TeamTowers: el cervell es posa al dia amb
  `node ../teamtowershuma/SOS/tools/cervell.js --actualitza .` i el que s'aprèn
  aquí puja amb `--recull`. Després d'actualitzar, `node guardas/cervell.js`.
