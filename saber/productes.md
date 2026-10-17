# Productes · el que aquí ja s'automatitza

Les funcions d'aquest projecte que podrien servir a qualsevol altre. La matriu
les llegeix amb `cervell.js --recull` i les adopta o les descarta; no entren
soles al catàleg. **Són propostes:** sense preu i per validar amb l'autor.

## Producte — El cromo sense compte

Una pàgina on qualsevol es fa un personatge, el veu pintat al moment i el
baixa, sense registrar-se. Si el vol a la col·lecció, l'envia: el navegador li
guarda una clau d'edició i a la base de dades només n'hi ha el resum. Amb la
mateixa clau el canvia o el retira des de qualsevol aparell. La IA, si la vol,
la posa qui escriu. Aquí: `/kit`, `../sql/001_comando_cromos.sql`.

## Producte — La col·lecció moderada a mitges

El primer enviament de cada persona l'aprova l'autor amb un clic; els canvis
d'algú ja aprovat surten sols, i retirar-se no espera ningú. La clau de
moderador no és a cap fitxer, i la porta es tanca sola si algú la prova a cegues.
Aquí: `/personatges`, `/modera`, `../sql/002_auditoria_cervell.sql`.

## Producte — La marca que es comprova

Un perfil d'un lloc es lliga amb la identitat firmada d'un altre (el `did` del
SOS) i la marca només surt si el navegador de qui mira comprova la firma. Cap
servidor ha de ser de confiança. Aquí: la veda 3 i `../tools/prova-firma.js`.

## Producte — Les dades de la matriu, copiades i vigilades

Una web que pinta dades que es declaren en un altre repositori: en té una
còpia per construir-se sense xarxa, i un treball setmanal avisa si s'ha quedat
vella. Aquí: `../tools/sync.js` i la veda 1.
