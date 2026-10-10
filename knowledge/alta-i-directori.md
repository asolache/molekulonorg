# L'alta al Comando i el directori de cromos · estudi

> **Això és un estudi, no una obra feta.** Escrit el 2026-10-03 a partir d'un
> encàrrec que porta una crítica a dins, i la crítica és la part important:
>
> > «M'agrada tot el que s'ha fet del SOS, però **crec que és demanar massa** als
> > artistes i creadors o persones que s'apuntin al Comando.»
>
> Té raó, i val la pena dir per què abans de proposar res.

---

## 1 · El problema, dit sense embuts

El SOS demana, per entrar: fer-se una clau criptogràfica al navegador, entendre
què és un `did:`, guardar-se una còpia de seguretat que si es perd no la
recupera ningú, i aprendre un vocabulari —apunt, vistiplau, relé, node— que
existeix perquè la comptabilitat sigui verificable.

**Tot això és correcte per al que serveix.** Un banc de temps que no pugui
demostrar qui va donar què no val res, i per això el SOS és com és.

I és **massa** per a algú que ha vist un videoclip i vol sortir a la pel·lícula.
Aquella persona no ve a portar comptabilitat: ve a dir *jo sé fer això*. Posar-li
una cerimònia de claus al davant és perdre-la a la primera pantalla.

La confusió de fons és que **hi ha dues coses diferents amb el mateix botó**:

| | **El cromo** | **El perfil del SOS** |
|---|---|---|
| Què és | La teva fitxa al repartiment | La teva identitat comptable |
| Per a què | Que et vegin i et trobin | Que els teus apunts valguin com a prova |
| Qui el valida | **L'autor de l'obra** (tu) | **La criptografia** (ningú) |
| On viu | Públic, a molekulon.org | Al teu aparell, local-first |
| Cost d'entrar | Un formulari i un vídeo | Clau, còpia i vocabulari |
| És obligatori? | Per sortir al Comando, sí | **No** |

Separar-les no és una concessió: **és dir la veritat sobre dues coses que ja
eren diferents.**

---

## 2 · La proposta, en una frase

> **Primer el cromo. El SOS, després i només si vols.**
>
> I el cromo és **del superheroi, no de la persona**.

Qui prem «Fes el teu personatge» va a una alta de **molekulon.org**, no del SOS.
Omple quatre camps, enganxa l'enllaç del seu vídeo, i queda **pendent
d'aprovació**. Quan l'aprovis, el seu cromo surt al directori públic.

A la seva fitxa hi ha, a baix de tot i sense pressa, una porta que diu: *«Si a
més vols comptar les teves hores al barri, això es fa al SOS»*. Qui la prem fa
la clau; qui no, no se n'assabenta mai i igualment és al repartiment.

---

## 2bis · El directori és de personatges secrets

> **Decisió de l'autor, 2026-10-10: «només personatges superherois secrets».**

És la decisió que endreça tota la resta, i val la pena dir per què no és una
mesura de privacitat enganxada al final: **és el gènere**. Un superheroi té una
identitat secreta des que existeix el gènere, i el Comando no n'és excepció —
qui surt al còmic és Reciclator amb la seva escafandra, no el senyor que hi ha
a sota.

### Què es publica i què no

| Es publica | No es publica mai |
|---|---|
| El **nom de guerra** i el seu cromo | El nom i els cognoms de la persona |
| Els **superpoders** (el que sap fer) | L'adreça, el telèfon, el correu |
| Les **superarmes** (el que pot deixar) | L'edat i la data de naixement |
| La **població o comarca**, si la vol dir | Res que identifiqui una persona concreta |
| L'**enllaç del seu vídeo** | Cap dada de contacte, ni per a altres usuaris |

El correu de contacte es demana **per poder-te escriure tu**, i no surt enlloc.
És l'única dada personal del sistema, i existeix per una sola cosa: avisar que
el cromo s'ha aprovat i poder-lo retirar si qui el va enviar ho demana.

### El que això resol de cop

- **La por de donar la cara.** Qui no vol sortir amb el seu nom, no hi surt. El
  projecte no perd res: el que li interessa és el superpoder, no el DNI.
- **El vídeo deixa de ser una barrera.** Es pot gravar **amb màscara, de
  disfressa, de mans, d'esquena o en off**, i segueix valent: el que ha
  d'ensenyar és la demo —les mans germinant, soldant, afinant—, no la cara. I
  això és més del Comando que un primer pla.
- **Baixa el risc legal** d'un cop. Un directori de pseudònims amb un correu
  guardat i no publicat és una altra cosa que un directori de persones amb nom i
  cara. No desapareix la responsabilitat —segueix fent falta qui signa (§6)—,
  però la superfície és molt més petita.
- **Encaixa amb el SOS sense tocar res.** Allà la identitat ja és pseudònima: un
  `did:` no diu qui ets. Les dues cares del projecte diuen el mateix.

### El que obliga

- **El nom de guerra és l'identificador, i per tant ha de ser únic.** Dos
  Purplemans trenquen el directori. L'alta ha de mirar els nicks ja donats i els
  reservats dels fundadors abans de dir que sí.
- **No es pot prometre anonimat, només pseudonimat.** Qui pengi un vídeo amb la
  seva veu i el seu taller és reconeixible per qui el conegui, i això s'ha de dir
  a la pàgina en una línia. Prometre més del que es pot complir és el que la
  casa no fa.
- **El vídeo és de YouTube i és seu.** Si l'hi puja amb el seu compte personal,
  el seu compte diu qui és. La pàgina ho ha d'avisar i recomanar un canal a nom
  del personatge a qui vulgui el secret de debò.

---

## 3 · Les dues identitats, i com es lliguen sense duplicar-se

El perill real d'això és **tenir dos directoris**. El SOS ja en té un
(`online.html`): nicks, territori, fitxes signades. Si molekulon.org en fa un
altre, hi haurà dues llistes de gent que divergiran, i cap de les dues serà la
bona.

La regla que ho evita:

- **Un sol espai de nicks.** `@mazinguer` és el mateix nick aquí i allà. Els
  nicks reservats dels fundadors ja viuen a `build-convits.js`, i l'alta del
  Comando ha de mirar aquella mateixa llista abans de donar-ne cap.
- **Dues llistes amb feines diferents.** El directori del Comando és **el mur de
  cromos**: narratiu, públic, moderat per tu. El del SOS és **el cens del
  territori**: signat, sense moderador, local-first. No són el mateix i no han
  d'intentar ser-ho.
- **El pont és un camp opcional.** Cada cromo pot portar un `did` buit. El dia
  que la persona es faci el perfil del SOS, enganxa el seu `did` al cromo i la
  fitxa guanya una marca —*comprovable al SOS*— que les altres no tenen. **Cap
  cromo és menys cromo per no tenir-la.**

Això dona una escala natural i no un mur: mirar → sortir-hi → comptar-hi.

---

## 4 · Com es fa l'alta sense servidor, i amb la teva aprovació al mig

Quatre maneres, i la diferència entre elles és **qui fa la feina i quan es
trenca**.

| | Com | Cost | Es trenca quan |
|---|---|---|---|
| **A · Formulari + publicació a mà** | Un formulari (Netlify Forms o Google Forms) t'avisa per correu; tu afegeixes el cromo aprovat al repositori | Zero euros. **El teu temps, per cromo** | Arriben més de ~20 a la setmana |
| **B · Formulari → PR automàtic** | El formulari dispara una acció que obre un *pull request* amb el cromo pendent; **aprovar = fer merge** | Zero euros, i queda rastre públic de cada alta | Netlify Forms passa de 100 enviaments/mes (de pagament) |
| **C · Supabase** | Taula `cromos` amb estat `pendent/aprovat`. La web llegeix només els aprovats; tu aprovés des d'un panell | Gratis fins molt amunt. Cal muntar-ho | Mai, pràcticament. Però ja no tot viu al repositori |
| **D · Issue de GitHub** | L'alta obre una incidència; aprovar és posar-hi una etiqueta | Zero | **Ja està trencat**: demana compte de GitHub a un artista |

**La recomanació és A ara i C quan calgui**, i no B, encara que B sigui la més
elegant: afegir una peça automàtica entre una persona i tu, quan encara no saps
quantes persones vindran, és muntar una fàbrica per fer quatre cromos.

La **A** té una virtut que les altres no: el que es publica **és al repositori**,
o sigui que és llegible, verificable i es desplega sol. El dia que el teu temps
sigui el coll d'ampolla —i això es nota de seguida—, es passa a **C** sense tocar
la web, perquè el generador ja llegeix d'un JSON i llavors llegirà d'una taula.

### El que l'aprovació ha de dir, i on

Una cua de moderació sense regles escrites acaba sent una persona decidint a
l'instant i contradient-se. Tres línies i prou, publicades a la pàgina d'alta:

1. **Es publica** el que compleix les quatre preguntes i és d'una persona de
   debò.
2. **No es publica** el que no té vídeo o el vídeo no és seu, el que ataca algú,
   ni **res de menors d'edat** (vegeu §6).
3. **Es pot retirar**: un cromo es treu quan la persona ho demana, sense donar
   explicacions. I es diu **quant triga**.

I una cosa que has de prometre perquè no la prometis sense voler: **un termini**.
«En una setmana tindràs resposta» és sostenible; «ja ho miraré» fa que la gent
no sàpiga mai si ha entrat.

---

## 5 · La història amb IA, sense gastar API

L'encàrrec: que la persona pugui escriure's la història **sense que el projecte
pagui per cada generació**.

**Com se'n surt:** la IA la posa qui l'escriu, no qui la publica. Un **artefacte
de Claude** publicat corre al navegador de qui l'obre i, quan pregunta a Claude,
ho fa **des del compte d'aquella persona**. El projecte no hi posa cap clau i no
hi ha cap factura que creixi amb l'èxit.

**El que l'artefacte faria**, i és poca cosa i per això funciona:

1. Fa les quatre preguntes, una per pantalla.
2. En treu **el text de la fitxa** (nom de guerra, superpoders, superarmes) i un
   **paràgraf de personatge** amb el to del Comando.
3. En treu també **el títol i les etiquetes del vídeo**, ja escrits.
4. Al final: un botó de **copiar-ho tot**, i l'enllaç al formulari d'alta.

**La trampa que s'ha de tapar**: qui no tingui compte de Claude no pot fer servir
la part d'IA. Per tant l'artefacte **no pot ser l'única porta**. Ha de funcionar
igual sense IA —amb les respostes, omplint una plantilla— i, a més, hi ha d'haver
**un text per copiar i enganxar a qualsevol xat** que faci la mateixa feina.
L'IA és una ajuda per a qui no sap escriure's, no un peatge.

> **Per comprovar abans de construir-ho**: què necessita exactament un artefacte
> publicat per poder preguntar a Claude, i què veu qui l'obre sense compte. Fins
> que això no estigui comprovat, la plantilla i el text per copiar són el camí
> segseur.

---

## 6 · El que s'ha de dir a la cara, i ara

Tres coses que si no es diuen ara, es diran malament després.

**Un cromo públic és públic, però és el del personatge.** Hi surt el nom de
guerra, el que saps fer i el teu vídeo; **no hi surt qui ets** (§2bis). El que sí
que s'ha de dir sense adornar-ho és el límit: **pseudònim no vol dir anònim**.
Qui et conegui et reconeixerà per la veu, les mans o el taller, i això no ho pot
evitar cap web. Qui vulgui el secret de debò, que no faci servir el seu canal
personal de YouTube. I ha de poder marxar quan vulgui.

**Menors, no.** La Fàbrica de Superherois és de 6 a 13 anys, i el dia que una
mestra vulgui apuntar la classe sencera, el sistema ha de dir que no **sol**. A
l'aula l'exercici es fa sense publicar res; el directori és per a persones
adultes, i això va escrit al formulari i a la guia.

**Qui signa.** Encara que el que es publiqui siguin pseudònims, **els correus
que es guarden són dades personals** i algú n'és responsable. Cal nom fiscal,
NIF i un correu que respongui. És la mateixa dada legal que ja falta a
molekulon.org, i aquí deixa de ser un detall pendent: **sense això, aquesta
funció no s'obre.** El pseudònim fa la superfície més petita; no la fa zero.

---

## 7 · Per on començar, si això tira endavant

L'ordre està triat perquè cada passa funcioni encara que la següent no arribi mai.

1. **La pàgina del directori, buida i honesta.** `/directori`, amb els cromos que
   ja hi ha i la frase que explica què és. Avui ja serveix: és on van a parar els
   catorze canònics.
2. **La pàgina d'alta**, amb les quatre preguntes, les regles de publicació i el
   formulari. Encara sense IA.
3. **La primera tanda a mà.** Deu, vint cromos aprovats per tu i afegits al
   repositori. Això ensenya el que cap disseny ensenya: quant triga, què envia la
   gent de debò i què falla.
4. **L'artefacte de la història**, quan ja hi hagi altes i es vegi on s'encalla
   la gent escrivint.
5. **El pont amb el SOS**: el camp `did` i la marca de comprovat.
6. **Supabase**, el dia que aprovar a mà sigui el que frena el projecte. Ni un
   dia abans.

---

## 8 · El que aquest estudi no resol

- **Quanta gent vindrà.** Tot el dimensionament de dalt és una aposta. La passa 3
  existeix precisament per substituir l'aposta per una dada.
- **Si el directori del Comando i el del SOS acabaran sent un de sol.** Avui es
  dissenyen separats i lligats per un camp. Si d'aquí un any el 80 % dels cromos
  tenen `did`, la pregunta es torna a fer.
- **Qui modera quan no hi siguis tu.** Una cua amb un sol moderador té un punt
  únic de fallada que es diu com es diu l'autor. No cal resoldre-ho ara; cal
  saber que hi és.
