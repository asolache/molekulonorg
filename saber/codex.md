# Codex · les vedes

Cada veda és un error que ja es va cometre, escrit perquè ningú l'hagi de tornar
a aprendre. No és estil: és llei. Una veda nova entra amb **qui la va dir, quan,
l'error que evita i la guarda que la vigila**.

Aquí hi van **les vedes pròpies** d'aquest projecte. A més, el projecte hereta
les de TeamTowers que valen per a qualsevol (`vedes-heretades.md`): no s'editen
aquí, arriben amb cada actualització del cervell. Una regla que ja és heretada
es cita, no es reescriu. Si una veda pròpia val per a tothom, puja a la matriu
amb `cervell.js --recull`.

## Les regles de la casa, i quina veda heretada les diu

Les quatre regles de `traspas.md` §3 ja eren vedes de la matriu abans de ser
d'aquí:

| Regla de la casa | Veda heretada | Guarda |
|---|---|---|
| El que es pot derivar, es deriva | 98 i 71 | `../tools/build.js` amb `--check` |
| El que es promet, ho vigila una guarda | 50 i 155 | `../tools/check.js` |
| El que falta, es diu | 94 i 49 | `../tools/check.js` (portes buides) |
| Una imatge que arriba és per llegir | 47 | a mà: l'autor diu què es publica |

I les del cervell: sempre hi ha un backlog (160) i el cervell es comprova (161).

## Veda 1 — El relat no és d'aquí: es declara a la matriu i aquí se'n vigila la còpia

**Dit per l'Àlvar el 2026-10-10**, en treure molekulon.org de teamtowershuma.
Els catorze personatges, les peces de mitjans i el guió de la intro es declaren
una sola vegada a teamtowershuma ([SOS/tools/build-comando.js](https://github.com/asolache/teamtowershuma/blob/main/SOS/tools/build-comando.js)). Aquí n'hi ha
una còpia, `../data/comando.json`, perquè el lloc s'ha de poder construir sense
xarxa. Editar-la aquí sembla que funciona i es desfà sol el dilluns següent.

**Guarda:** `../tools/sync.js` amb `--check`, cada dilluns al CI.

## Veda 2 — Una porta pública no pot demanar el compte de ningú

**Dit per l'Àlvar el 2026-10-11:** el kit era un artefacte de Claude privat i
s'obria com una finestra privada per a tothom menys per a ell. Qui no tenia
compte no hi entrava ni compartint-lo. Ara el kit és `/kit`, a casa: munta la
fitxa sense IA, prepara el text per enganxar a qualsevol xat i la IA la posa qui
escriu, des del seu compte. El projecte no paga cap model ni guarda cap clau.

**Guarda:** `../tools/check.js` (cap enllaç intern a un fitxer que no hi sigui).
Que comprovi també que cap pàgina enllaça `claude.ai` queda al backlog.

## Veda 3 — Una marca de confiança es treu de la firma, no de l'última fila

**Trobat a l'auditoria amb el cervell, 2026-10-17.** La marca «comprovat al
SOS» es donava si l'última fila d'`online_fitxes` d'aquell `did` portava el
mateix @nick. Aquella taula accepta files de qualsevol i Postgres no en pot
comprovar la firma: n'hi havia prou de posar el `did` d'una altra persona per
sortir «comprovat» com ella. És la veda 61 heretada («no es diu verificat del
que no s'ha verificat») trencada per un `join`: quan es creua amb una taula
oberta d'«només afegir», es pren **l'última fila amb firma vàlida**, i la firma
la comprova qui pinta, no qui allotja.

**Guarda:** `../tools/prova-firma.js` al CI. Fabrica fitxes bones i falses i
peta si la pàgina en dona una per bona que no ho és. Es va veure petar abans de
donar-la per bona (veda 50).
