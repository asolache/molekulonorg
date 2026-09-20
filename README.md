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
| `index.html` | La portada: la tesi, els sis eixos, com s'hi entra i què encara viu al SOS |
| `personatges.html` | Els catorze herois: poder, superarma i què vol dir cadascun en un equip |
| `peli.html` | El guió de la intro, pla a pla, amb què està filmat i què no |
| `musica.html` | Els capítols, els videoclips, els temes i els directes |
| `tools/build.js` | El generador. **Aquí és on s'edita el que diu la web** |
| `tools/sync.js` | Baixa les dades de dalt i avisa si la còpia s'ha quedat vella |
| `tools/check.js` | Set regles sobre el que cap generador veurà mai |
| `data/comando.json` | Les dades. Importades, mai editades |

Quatre pàgines i no dotze. Les altres vuit del pla —el còmic, l'escola traslladada,
qui ho signa, premsa— necessiten material que encara no hi és: imatges, dades
legals i enllaços de compra. Publicar-les buides seria ensenyar una casa amb les
habitacions pintades i sense terra.

## El que aquesta web encara no té

Es diu aquí i es diu també a la portada, perquè una llista de mancances amagada
a un README és una llista que no existeix.

- **Imatges.** Ni una vinyeta, ni una portada de còmic, ni un retrat.
- **On es compren els còmics.** Se n'han publicat dos.
- **Avís legal, contacte i llicència** del que hi ha publicat.
- **Quatre peces de mitjans** nomenades i sense adreça: Pigmentón, Fraktalman,
  Tekno Kartoffeln i el taller filmat. Surten a `/musica` dient-ho.

## Desplegament

Netlify serveix el repositori tal com és (`publish = "."`, sense `command`): el
que se serveix és exactament el que es pot llegir aquí, sense cap passa
intermèdia que ningú mira.

El domini és a **Porkbun** i els servidors de nom són els de **Netlify DNS**
(`dns1..dns4.p09.nsone.net`).

---

*Un projecte de [TeamTowers Humà](https://teamtowershuma.com). L'eina és lliure;
el còmic i la música, encara no tenen llicència escrita — i mentre no la tinguin,
aquest README no en promet cap.*
