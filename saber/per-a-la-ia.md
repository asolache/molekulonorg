# Contracte de feina per a una IA

Aquest fitxer diu **com es treballa aquí**. `taxonomia.md` diu on va cada cosa
i `MAPA.md` què hi ha; això diu què fer i què no.

## 1 · L'ordre de lectura

1. `MAPA.md` — què hi ha i de quina cara és. Generat des de l'arbre.
2. `codex.md` — les vedes pròpies, i `vedes-heretades.md` — les que vénen de
   TeamTowers: cadascuna és un error que ja es va pagar en un altre projecte.
3. `taxonomia.md` — on va el que escriguis.
4. `traspas.md` — tot el que s'ha fet, les tres cases i el canal de dades.
5. `../CLAUDE.md` — com vol la comunicació qui treballa aquí.

## 2 · El que no es negocia

- **Una sola font de veritat per cosa.** Les pàgines surten de
  `../tools/build.js` i de `../data/`; un `.html` no s'edita mai.
- **El relat ve de dalt** (veda 1): `../data/comando.json` no s'edita aquí.
- **El canon privat no surt.** El final i l'argument de la pel·lícula viuen a
  un repositori privat i no entren ni aquí ni a cap web.
- **Tot canvi passa per PR**, i abans d'empènyer passen les quatre guardes:
  `../tools/build.js --check`, `../tools/check.js`, `../tools/prova-firma.js` i
  `../guardas/cervell.js --check`.
- **Res personal a git.** Els cromos són pseudònims i viuen a la base de dades,
  no al repositori.
- **La base de dades no es toca sense l'autor.** Cada canvi és un fitxer nou a
  `../sql/`, i s'aplica quan l'autor ho diu.

## 3 · Les IA que ja saben fer alguna cosa aquí

- **El mapa de valor:** la skill `../.claude/skills/mapa-de-valor/SKILL.md`
  acompanya una sessió amb el mètode VNA de Verna Allee. El mètode és a
  `heredado/vna-verna-allee.md`, el contracte per a un model a
  `heredado/ia-mapa-de-valor.md` i els patrons vistos a `heredado/vna-patrons.md`.
- **La proposta inicial:** la skill `../.claude/skills/propuesta-inicial/SKILL.md`,
  amb `../herramientas/tools/revisa-mapa.js` i `../herramientas/tools/web-del-mapa.js`.
  L'editor s'obre amb doble clic: `../herramientas/vna-suport.html`.
- **La revisió d'un PR:** `heredado/prompts/pr_review.md`, amb dictamen verd,
  groc o vermell.

Tot el de `heredado/` i `../herramientas/` ve de TeamTowers i no s'edita aquí.

## 4 · Els antipatrons que hem comès de debò

- **2026-10-17 · La marca de confiança treta de l'última fila** (veda 3). Una
  IA va escriure el `join` amb `online_fitxes` prenent l'última fila d'un `did`
  sense comprovar-ne la firma. L'hauria aturat `../tools/prova-firma.js`, que
  no existia.
