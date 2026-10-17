# Taxonomia · on va cada cosa

Cada carpeta és exactament una de cinc cares, i la cara diu **què se'n pot
fer**. Una IA no pregunta: llegeix el nom de la carpeta i escriu. Per això cada
carpeta es declara aquí, i `MAPA.md` es genera de l'arbre de debò.

| Cara | Què és | Regla d'entrada |
|---|---|---|
| **llei** | Les regles que governen la resta | Si es trenca, invalida la feina feta |
| **obra** | La cosa mateixa: el que fa servir la gent | Una sola font de veritat per cosa |
| **prova** | El que comprova que l'obra compleix la llei | Ha de petar quan toca, i només llavors |
| **saber** | El que sabem i encara no és obra | Es cita, no es copia |
| **arxiu** | El que va ser | Es conserva; no es llegeix com a present |

Res de `misc/` ni `temp/`: un calaix sense criteri d'entrada s'omple sol i no
es buida mai.

## Declaració de cares

Format: `- ruta · cara · una línia del que hi entra`. El generador llegeix
aquesta llista i res més. Crear una carpeta sense declarar-la trenca el CI.

- `saber` · saber · El cervell: mapa, codex, contracte de la IA, taxonomia, backlog, productes, el traspàs i l'estudi d'alta. `heredado/` ve de TeamTowers i no s'edita
- `data` · obra · Les dades de les pàgines: `comando.json` ve de teamtowershuma i no s'edita; `mostra.json` i `cromos.json`, sí
- `cromos` · obra · Els retrats dels cromos del còmic
- `mostra` · obra · Les pàgines del còmic que es publiquen al lector
- `tools` · obra · El generador de les pàgines, la sincronia amb teamtowershuma i les seves guardes (`check.js`, `prova-firma.js`)
- `sql` · obra · La base de dades dels cromos al Supabase del SOS: un fitxer per canvi, en ordre
- `herramientas` · obra · El que el projecte hereta per treballar: l'editor del mapa, revisar-lo i treure'n la web. No s'edita aquí
- `guardas` · prova · L'eina del cervell, heretada: peta al CI si el mapa o el contracte menteixen
- `.github` · prova · El CI: les guardes a cada empenta i la sincronia de dades cada dilluns
