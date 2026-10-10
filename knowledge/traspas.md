# Traspàs · tot el que s'ha fet, i per on es continua

> Escrit el 2026-10-10 des de la sessió on es va fer tot això, que era al
> repositori **teamtowershuma**. A partir d'ara el projecte es porta des del seu
> propi projecte de Claude Code, i aquest document existeix perquè **la sessió
> nova no hagi de reconstruir res d'una conversa que no pot llegir**.
>
> El que no és aquí dins, no existeix.

---

## 1 · Les tres cases, i què mana a cadascuna

| Repositori | Què hi viu | Qui hi mana |
|---|---|---|
| **`asolache/molekulonorg`** (públic) | La web molekulon.org: la cara pública del relat | Aquest repositori. **És on es treballa ara** |
| **`asolache/teamtowershuma`** (públic) | El SOS, l'aplicació i **les dades del Comando** | Les llistes canòniques. D'aquí baixen les dades |
| **`asolache/comando-molekulon-canon`** (privat) | El final, l'argument de la pel·lícula, l'estil de la font | El material que **no pot sortir** a cap web |

**La regla que ho ordena tot**: el relat va a molekulon.org, l'eina es queda a
teamtowershuma. Si una pàgina explica qui són i què va passar, se'n va; si
explica com es fa servir una cosa, es queda.

### El canal de dades, que és el que no s'ha de trencar

```
teamtowershuma/SOS/tools/build-comando.js      ← aquí es declaren els personatges,
        │                                         els mitjans i el guió de la intro
        ├─ escriu SOS/molekulon-data.json      ← i `--check` el vigila al CI
        ▼
molekulonorg/tools/sync.js                     ← el baixa (cada dilluns el compara)
        ▼
molekulonorg/data/comando.json                 ← la còpia. MAI s'edita aquí
        ▼
molekulonorg/tools/build.js                    ← genera les sis pàgines
```

**Si cal canviar un nom d'heroi, un vídeo o un pla del guió: es canvia a dalt.**
Editar-ho aquí sembla que funciona i es desfà sol el proper dilluns.

---

## 2 · Què s'ha construït, en ordre

Divuit commits a `molekulonorg`, i quatre PR a `teamtowershuma`.

### A molekulon.org

| | |
|---|---|
| `fde1be4` | L'esquelet: 4 pàgines generades, guardes, CI, Netlify |
| `fe7b913` | El videoclip d'Horacio corrent de fons a la portada |
| `69c3424` | La portada diu **per a què** serveix i no només de què està feta |
| `c882c05` | El lector del còmic, muntat i encara buit |
| `f609e73` · `96a9438` | La portada i les 7 pàgines del primer còmic |
| `cbabcb2` | El tema de la pàgina 7, i el lector aprèn SoundCloud |
| `f5eba57` | Els enllaços de compra dels dos números |
| `f6f466f` → `da40a49` | Els personatges passen de fitxa a **cromo**: 11 cares de 14 |
| `3a2b155` · `cab0ad5` | **La landing de la història** i les quatre preguntes |
| `f3b7971` · `ab58268` | L'estudi de l'alta: cromo primer, i personatges secrets |
| `466a9a7` | El **kit narratiu**, i la landing hi enllaça |
| `1dc184f` | El README diu on som |

### A teamtowershuma

| PR | Què hi entra |
|---|---|
| **#162** | El pla de molekulon.org, i l'export `molekulon-data.json` |
| **#164** | El tema de Mazinguer a la llista, i el camp `soundcloud` |
| **#165** | «Espermatozoide soy», i l'ordre del trasllat |
| **#166** | L'heroi passa a dir-se **Afrodita** (tercera i última volta) |

### Al canon privat

L'argument de la pel·lícula compost des del còmic: el missatge, l'estil de la
font, els tres actes —els tres còmics són **la primera pel·lícula**— i la
palanca de realitat del final. Més les pàgines 8 i 9 llegides i no publicades, i
la decisió del comptador visible des del principi.

---

## 3 · Les regles de la casa, que no són gust meu

Qui continuï això s'hi trobarà i val més saber per què hi són:

1. **El que es pot derivar, es deriva.** Cap xifra ni cap llista s'escriu a mà a
   una pàgina: surt de `data/` i la pinta `tools/build.js`. Editar un `.html`
   d'aquest repositori no serveix de res: el proper `build.js` ho desfà, i
   `build.js --check` peta al CI abans.
2. **El que es promet, ho vigila una guarda.** `tools/check.js` té deu regles,
   i cadascuna tapa una manera concreta que això es podria podrir **sense
   petar**: una pàgina sense `canonical`, un enllaç a un fitxer que no hi és,
   una porta cap a `null`, un cromo d'un nom que ja no existeix. Si una guarda
   molesta, es mira si té raó abans de treure-la.
3. **El que falta, es diu.** Una peça sense adreça es pinta dient que encara no
   hi és. Un heroi sense retrat porta un marc buit. Una identificació que és
   lectura meva porta «a confirmar» damunt de la imatge. **Prometre una porta
   tancada és pitjor que no tenir-la.**
4. **Una imatge que arriba és per llegir**, no per publicar, fins que l'autor
   digui el contrari.

---

## 4 · El kit narratiu

- **Adreça**: https://claude.ai/artifact/13VhvsbsTQhgauoxMDfRY3
- És un artefacte de Claude, **fora d'aquest repositori**. La landing hi enllaça
  per la constant `KIT` de `tools/build.js`.
- **La IA la posa qui l'obre, des del seu compte.** El projecte no paga res per
  cada personatge que es crea: era la condició de l'encàrrec.
- **Funciona sense IA**: qui no tingui compte de Claude munta la fitxa igual amb
  el que ha escrit.
- ⚠️ **Està publicat en privat.** Mentre no es comparteixi («qualsevol amb
  l'enllaç»), el botó principal de la landing porta a una porta tancada.

---

## 5 · El que espera una decisió de l'autor

Les cinc que frenen feina, amb el motiu:

1. **Les adreces canòniques de SoundCloud** dels dos temes. Les que hi ha són
   enllaços curts (`on.soundcloud.com`) i el reproductor no els resol: mentre
   siguin curts, la pàgina enllaça en comptes d'incrustar. Amb l'adreça llarga,
   sona dins de la web sense tocar res més.
2. **El repartiment de cançons** de les pàgines 1 a 6 del primer còmic.
3. **Si es publiquen les pàgines 8 i 9**, llegides i guardades al canon.
4. **Electroplasman i Afrodita**: les dues identificacions de la vinyeta que
   segueixen sent lectura meva.
5. **Qui signa**: nom fiscal, NIF, contacte i llicència. **Sense això no s'obre
   el directori d'altes**, perquè guardar correus de gent és guardar dades
   personals encara que el que es publiqui siguin pseudònims.

---

## 6 · El que la sessió d'origen no ha pogut comprovar

Dit perquè ningú ho doni per provat:

- **Que molekulon.org carregui.** Aquell contenidor no tenia sortida a internet
  fora d'un proxy que bloquejava els hosts externs. Les redireccions
  (`/historia`, `/comic`), el certificat i el vídeo de fons **no s'han vist mai
  funcionant**.
- **El vídeo de fons de la portada**, pel mateix motiu: a les captures hi surt
  el marc de l'iframe sense carregar.
- **La crida real a Claude del kit.** El camí sense IA sí que s'ha executat i
  dona la fitxa correcta; el camí amb IA només es pot provar obrint la pàgina
  publicada.
- **Els enllaços d'Amazon i de SoundCloud**, que no s'han pogut obrir des d'allà.

---

## 7 · Per on es continua

L'ordre és el del pla, i cada passa funciona encara que la següent no arribi:

1. **El blog del Comando** (cinc entrades, són text: el trasllat més barat).
2. **Molekulandia** i **l'estat líquid**: ja són dades a teamtowershuma, només
   cal exportar-les com es va fer amb el Comando i generar-les aquí.
3. **La Fàbrica de Superherois**, que no es pot moure fins que hi hagi contacte
   i avís legal: allà hi escriuen escoles.
4. **El directori i l'alta**, segons `knowledge/alta-i-directori.md`.
5. **El joc**, l'últim: moure'l no desbloqueja res.

```sh
node tools/sync.js        # baixa les dades de teamtowershuma
node tools/build.js       # escriu les sis pàgines i el sitemap
node tools/check.js       # les deu guardes
```
