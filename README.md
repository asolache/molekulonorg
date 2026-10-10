# molekulon.org

La web pública del **Comando Molekulon**: un còmic, una banda i una pel·lícula
que encara no existeix, i que es farà amb 150.000 superherois reals.

L'eina que hi ha a sota —el **SOS**, on s'hi compten les hores, els objectes i
el coneixement que la gent posa al seu barri— viu a
[teamtowershuma.com](https://teamtowershuma.com) i al repositori
[`asolache/teamtowershuma`](https://github.com/asolache/teamtowershuma). Aquí
només hi ha **la cara pública del relat**.

---

## La regla que ordena tot el repositori

> **El contingut no és d'aquí.**

Els catorze personatges canònics, les disset peces de mitjans i els quinze plans
del guió de la intro es declaren **una sola vegada**, a
`SOS/tools/build-comando.js` del repositori de dalt. D'allà en surt
`SOS/molekulon-data.json`, i aquí n'hi ha una còpia a `data/comando.json`.

Per què una còpia i no una crida en directe: el lloc s'ha de poder construir
sense xarxa i sense dependre que un altre repositori respongui el dia del
desplegament. El preu d'una còpia és que divergeix; el que ho evita és
`tools/sync.js`, que la compara amb la de dalt cada dilluns.

**Per tant: `data/comando.json` no s'edita mai aquí, i les pàgines `.html`
tampoc.** Les dues coses es generen.

## Com s'hi treballa

```sh
node tools/sync.js       # baixa les dades de teamtowershuma (opcional)
node tools/build.js      # escriu les pàgines i el sitemap
node tools/check.js      # la guarda: canonical, enllaços, xifres, noms
```

I abans d'empènyer, el que corre el CI:

```sh
node tools/build.js --check && node tools/check.js
```

## Què hi ha

| Fitxer | Què és |
|---|---|
| `index.html` | La portada: la tesi, per a què serveix, els sis eixos i què encara viu al SOS |
| `historia.html` | **La landing de la història.** De la frase que ho va encendre tot fins a les quatre preguntes |
| `personatges.html` | Els catorze cromos: cara, poder, superarma i què vol dir cadascun en un equip |
| `peli.html` | El guió de la intro, pla a pla, amb què està filmat i què no |
| `musica.html` | Els capítols, els videoclips, els temes i els directes |
| `comic.html` | El lector de la mostra: pàgina a pàgina, cada una amb la seva cançó |
| `tools/build.js` | El generador. **Aquí és on s'edita el que diu la web** |
| `tools/sync.js` | Baixa les dades de dalt i avisa si la còpia s'ha quedat vella |
| `tools/check.js` | Deu regles sobre el que cap generador veurà mai |
| `data/comando.json` | Les dades del Comando. Importades, **mai editades aquí** |
| `data/mostra.json` | Quines pàgines del còmic es publiquen i quin tema sona a cada una. **Sí** que s'edita |
| `data/cromos.json` | Quin retrat fa de cara de qui. **Sí** que s'edita |
| `knowledge/alta-i-directori.md` | L'estudi de com entra la gent: cromo primer, SOS després |
| `knowledge/traspas.md` | **Comença per aquí.** Tot el que s'ha fet, les regles de la casa i per on es continua |

## El kit narratiu

L'alta amb IA **no viu en aquest repositori**: és un artefacte de Claude
publicat a part, i la landing hi enllaça.

- **Adreça**: https://claude.ai/artifact/13VhvsbsTQhgauoxMDfRY3
- **Per què allà**: la IA la posa qui obre la pàgina, des del seu compte. El
  projecte no paga res per cada personatge que es crea.
- **Funciona sense IA.** Qui no tingui compte de Claude munta la fitxa igual.
- Si algun dia canvia d'adreça, es canvia a la constant `KIT` de `tools/build.js`.

## On som

Al dia d'avui, i escrit aquí perquè qui obri el repositori no ho hagi de deduir:

| | |
|---|---|
| **Pàgines** | 6, totes generades i amb les deu guardes en verd |
| **Còmic 1** | Portada i 7 pàgines publicades, amb el seu tema |
| **Còmic 2** | Portada publicada i enllaç de compra. **Cap pàgina de mostra encara** |
| **Cromos** | 11 cares de 14. Falten El Aviador, Pigmentón i Fraktalman |
| **Compra** | Els dos números, el primer també en anglès |

### El que espera una decisió de l'autor

1. **Les adreces canòniques de SoundCloud** dels dos temes. Les que hi ha són
   enllaços curts (`on.soundcloud.com`), i el reproductor no els resol: mentre
   siguin curts, la pàgina enllaça en comptes d'incrustar.
2. **El repartiment de cançons** de les pàgines 1 a 6 del primer còmic. Ara
   porten una proposta, i el lector ho diu: «(proposta, a confirmar)».
3. **Si es publiquen les pàgines 8 i 9** del primer còmic, llegides i no
   publicades.
4. **Dos cromos sense confirmar**: Electroplasman i Afrodita són lectura meva de
   la vinyeta, i la pàgina ho avisa damunt de la imatge.
5. **Qui signa**: avís legal, contacte i llicència. Sense això no s'obre el
   directori d'altes (vegeu l'estudi).

## Desplegament

Netlify serveix el repositori tal com és (`publish = "."`, sense `command`): el
que se serveix és exactament el que es pot llegir aquí, sense cap passa
intermèdia que ningú mira.

El domini és a **Porkbun** i els servidors de nom són els de **Netlify DNS**
(`dns1..dns4.p09.nsone.net`). **El lloc ja és en línia a molekulon.org.**

---

*Un projecte de [TeamTowers Humà](https://teamtowershuma.com). L'eina és lliure;
el còmic i la música, encara no tenen llicència escrita — i mentre no la tinguin,
aquest README no en promet cap.*
