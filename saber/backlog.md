# Backlog

La font de veritat del desenvolupament (veda 160 heretada). Cada bloc diu **qui
ho va demanar, quan, què es demana i com es tanca**. Cada PR fusionat es tanca
aquí amb el que s'ha mesurat. El README i el traspàs no copien aquesta llista:
la citen.

## Pendent

### Aplicar `sql/002_auditoria_cervell.sql` (demanat 2026-10-17)

**Demanat per:** l'Àlvar, a l'auditoria («corrígelo»). **Què:** treure la marca
`sos` de `directori_cromos` i posar fre a la clau de moderador.
**Com es tanca:** aplicat al projecte Teamtowershuma com a migració, i provat
com a `anon`: deu claus dolentes tanquen `/modera` quinze minuts, i
`directori_cromos` ja no porta `sos`. Fins llavors la web nova funciona igual
amb el SQL vell (la marca ja es decideix al navegador).

### La còpia de la firma, vigilada contra la de dalt (demanat 2026-10-17)

**Demanat per:** l'auditoria. **Què:** `canon`, `didDe` i `valida` de
`../tools/build.js` són còpia de `SOS/online.html` de teamtowershuma; si allà
canvien, aquí deixaria de quadrar cap firma (veda 71). **Com es tanca:** el
treball setmanal de `sync.js` compara també aquestes funcions.

### Cap porta pública cap a `claude.ai` (demanat 2026-10-11)

**Demanat per:** l'Àlvar, quan el kit era un artefacte privat (veda 2).
**Què:** que `../tools/check.js` peti si una pàgina enllaça un artefacte de
Claude. **Com es tanca:** la regla al `check.js`, vista petar amb un enllaç de
prova.

### El que espera una decisió de l'autor (des del 2026-10-10)

**Demanat per:** el traspàs. Les cinc que frenen feina:

1. **Les adreces canòniques de SoundCloud** dels dos temes. Les que hi ha són
   curtes (`on.soundcloud.com`) i el reproductor no les resol: mentre ho siguin,
   la pàgina enllaça en comptes d'incrustar.
2. **El repartiment de cançons** de les pàgines 1 a 6 del primer còmic. Ara
   porten una proposta, i el lector ho diu: «(proposta, a confirmar)».
3. **Si es publiquen les pàgines 8 i 9** del primer còmic, llegides i guardades
   al canon.
4. **Electroplasman i Afrodita**: dues identificacions que són lectura de la
   vinyeta, i la pàgina ho avisa damunt de la imatge.
5. **Qui signa**: nom fiscal, NIF, contacte i llicència. Sense això no s'obre el
   directori d'altes, perquè guardar correus és guardar dades personals.

**Com es tanca:** cada punt, amb la resposta de l'autor i el canvi fet.

## Fet

### L'auditoria amb el cervell (demanat 2026-10-17)

**Demanat per:** l'Àlvar: «audita el proyecto con el nuevo cerebro» i
«corrígelo y hazlo todo integrado con el codex y las estrategias compartidas».
**Fet:** cervell instal·lat en català amb 59 vedes heretades, `knowledge/` passa
a `saber/`, vedes pròpies 1 a 3, `productes.md` per a la matriu, la marca
«comprovat al SOS» comprovada amb la firma al navegador i `tools/prova-firma.js`
i `guardas/cervell.js --check` al CI.

### Com fem servir la IA (demanat 2026-10-17)

**Fet:** `/ia` amb el compromís i el comptador comú de la matriu (veda 167
heretada), enllaçada des de les nou pàgines (PR #6).

### El kit, el cromo i la col·lecció viva (demanat 2026-10-11)

**Fet:** `/kit`, `/personatges` llegint el Supabase del SOS i `/modera` amb
aprovació mixta (PR #5). Detall a `traspas.md` §4 i §4bis.
