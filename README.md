# Norrmontage — ny webbplats

Klickbar prototyp av en ny marknadssajt för Norrmontage AB. Ligger framför den
befintliga orderportalen på `shop.norrmontage.se`, som lämnas orörd och länkas
till som "Logga in i portalen".

## Kom igång

```bash
npm install
```

```bash
npm run dev
```

Sajten körs på `http://localhost:5180`. `npm run build` bygger statiska filer
till `dist/`.

## Publicering

Bygget är platsoberoende: `base: './'` i `vite.config.js` och relativa sökvägar
genomgående gör att `dist/` fungerar i domänroten, under en underkatalog och
lokalt från filsystemet.

**Till `secondoak.se/norrmontage` via GitHub Pages:**

1. Skapa ett repo med namnet `norrmontage` under samma konto som
   `secondoak.se`-sajten och pusha det här projektet dit.
2. Settings → Pages → Source: **GitHub Actions**.
3. Pusha till `main`. Arbetsflödet i `.github/workflows/deploy.yml` bygger och
   publicerar automatiskt.

Detta förutsätter att `secondoak.se` är satt som custom domain på kontots
`<användarnamn>.github.io`-repo. Är den satt på ett projekt-repo i stället
serveras inte andra repon under samma domän, och då behövs en subdomän.

### Demon är publik

GitHub Pages har inget lösenordsskydd. Sajten innehåller Norrmontages
produktfoton, hela deras katalog samt namn och direktnummer till anställda.

Varje sida bär därför `<meta name="robots" content="noindex, nofollow">`, vilket
hindrar indexering.

Lägg **inte** in `Disallow: /norrmontage/` i `secondoak.se/robots.txt` — då
slutar sökmotorerna crawla sidan och får aldrig se `noindex`-taggen, vilket ger
sämre skydd än i dag. En `robots.txt` i underkatalogen har heller ingen verkan;
den läses bara från domänroten.

Behövs verkligt lösenordsskydd är Cloudflare Pages med Cloudflare Access det
enda gratisalternativet bland de stora.

## Sidor

| Fil | Innehåll |
|---|---|
| `index.html` | Start — hero, bevisrad, sortiment, Stationsbyggar-teaser, segment, referenser, kontakt |
| `sortiment.html` | Sortimentshubb med filter på kategori, spänning, apparattyp, antal HSP-fack och effekt |
| `modell.html?id=…` | Modellsida — foto, snabbfakta, utrustningsalternativ som rutnät, dokument |
| `stationsbyggaren.html` | Konfiguratorn. `?modell=…` förväljer en modell |
| `referenser.html` | Bildbanken som kuraterat galleri |
| `om-oss.html` · `underlag.html` · `kontakt.html` | Innehållssidor |

## Struktur

```
src/
├── data/models.json        # sanningskälla: kategorier, modeller, benämningsnyckel, utrustning
├── js/
│   ├── chrome.js           # delat sidhuvud och sidfot
│   ├── site.js             # navigation, mobilmeny, modellhjälpare
│   ├── segment.js          # användningsområden (delas av start och om-oss)
│   └── configurator/
│       ├── options.js      # alla valbara alternativ
│       ├── state.js        # tillstånd + beroendelogik
│       ├── station-svg.js  # stationsritaren
│       └── ui.js           # stegnavigering och rendering
└── styles/                 # tokens.css + en fil per sida
```

`models.json` driver både sortimentsfiltret och modellsidorna. Lägg till en
modell där så dyker den upp överallt.

## Stationsritaren

`station-svg.js` genererar en axonometrisk vektorbild ur en konfiguration:

```js
stationSVG({
  fack: 4, trafo: 1,
  tak: 's20',            // s5 · s7 · s20 · s27 · valmat · runt
  panel: 'tra-liggande', // plat · tra-liggande · tra-staende · rockpanel · koppar
  kulorVagg: '#6b3a34', kulorTak: '#1b1b1b', kulorFundament: '#6e6e6e',
  struktur: true, ventilation: true, itFack: false, rls: false,
})
```

Lagren heter `#fundament`, `#stomme`, `#fasad`, `#luckor`, `#tak` och
`#detaljer`. Fasadmönster är SVG-`<pattern>` och kan bytas utan att röra koden i
övrigt.

Ritaren används på tre ställen: konfiguratorn, teasern på startsidan, och som
produktbild i sortimentet för de modeller vi saknar foto på — då genereras
bilden ur modellens egna specifikationer, så listan visar faktiska skillnader i
stället för samma foto om och om igen.

## Var innehållet kommer ifrån

Modellnamn, kategoritexter, utrustningsalternativ, benämningsnyckeln för ZT19,
kontaktuppgifter och dokumentlistan är hämtade från `shop.norrmontage.se`
i augusti 2026. Standardkulörerna kommer från Norrmontages eget dokument
*Standardkulörer 1904*. Referensfotona kommer från deras bildbank.

## Att stämma av med Norrmontage

- **NCS-koderna** är omräknade till hex som approximationer
  (`--kulor-*` i `tokens.css`, `KULORER` i `options.js`). Verifiera mot original
  innan lansering.
- **Fotografier per modell** — 14 av 24 modeller saknar eget foto och visas som
  ritning. Ritningen är korrekt vad gäller antal fack, tak och kulör, men den
  ersätter inte ett riktigt foto.
- **Siffror** — antal anställda och omsättning är medvetet utelämnade eftersom de
  inte går att belägga från Norrmontages egna kanaler.
- **Grundandeår** — "över 60 år" används genomgående; exakt årtal saknas.
- **Lettisk version** — språkväxlaren är borttagen tills det finns lettiskt
  innehåll att växla till. Den befintliga sajten har en LV-version.
- **Måttuppgifter** — bara ZN22-24/3-315 har mått i datan, hämtade från
  ritningen på produktsidan.

## Tillgänglighet

WCAG 2.1 AA är målet. Konfiguratorn går att använda med enbart tangentbord —
fokus återställs efter varje omritning — och stationen beskrivs i klartext via
ett `aria-live`-område. Varumärkesblå `#0091fe` ger bara 3,24:1 mot vit text och
används därför inte som knappfyllning; `--nab-blue-btn` (`#0072c6`, 4,97:1)
används i stället.
