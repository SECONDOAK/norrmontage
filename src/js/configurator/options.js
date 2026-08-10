/* ==========================================================================
   Stationsbyggarens alternativ.
   Samtliga val kommer från Norrmontages egna produktsidor och dokument:
   rubriken "Utrustningsalternativ", benämningsnyckeln för ZT19 och
   dokumentet Standardkulörer 1904. Inget är påhittat.
   ========================================================================== */

export const STATIONSTYPER = [
  {
    id: 'satellit',
    namn: 'Satellit / seriesatellit',
    familj: 'ZS · ZS18 · ZN22-SS2',
    text: 'Kompakt station, ofta utan eget högspänningsställverk. 50–2000 kVA.',
    kvaMin: 50,
    kvaMax: 2000,
    fackMin: 0,
    fackMax: 2,
    trafo: [1, 2],
    tak: ['s5', 's20', 'valmat'],
  },
  {
    id: 'natstation-315',
    namn: 'Nätstation 50–315 kVA',
    familj: 'ZN22 (N3)',
    text: 'Generation 6 sedan 2018. Manöver från separat fack för högsta personsäkerhet.',
    kvaMin: 50,
    kvaMax: 315,
    fackMin: 2,
    fackMax: 6,
    trafo: [1],
    tak: ['s5', 's20'],
  },
  {
    id: 'natstation-2000',
    namn: 'Nätstation 500–2000 kVA',
    familj: 'ZT19',
    text: 'Upp till 36 kV och tio mellanspänningsfack. Mest utrymme för montören.',
    kvaMin: 500,
    kvaMax: 2000,
    fackMin: 2,
    fackMax: 10,
    trafo: [1, 2],
    tak: ['s7', 's27', 'valmat', 'runt'],
  },
  {
    id: 'kopplingsstation',
    namn: 'Kopplingsstation',
    familj: 'ZF19',
    text: 'För fördelning av högspänningslinjer. Saknar eget transformatorutrymme.',
    kvaMin: null,
    kvaMax: null,
    fackMin: 2,
    fackMax: 10,
    trafo: [0],
    tak: ['s5', 's7', 's27', 'valmat'],
  },
  {
    id: 'teknikhus',
    namn: 'Teknikhus',
    familj: 'Kundanpassat',
    text: 'Isolerat hus efter era mått, för batterilager, teknikutrymme eller styrelektronik.',
    kvaMin: null,
    kvaMax: null,
    fackMin: 0,
    fackMax: 0,
    trafo: [0],
    tak: ['s5', 's20', 'valmat', 'runt'],
  },
]

export const SPANNINGAR = [
  { id: '12', namn: '12 kV', text: 'Luftisolerade apparater för 12 kV.' },
  { id: '24', namn: '24 kV', text: 'Luftisolerade apparater för 24 kV.' },
  { id: '36', namn: '36 kV', text: 'Endast ZT19-serien.', endast: ['natstation-2000'] },
  { id: 'rmu', namn: 'RMU', text: 'Kompaktställverk istället för luftisolerade apparater.' },
]

export const TAK = [
  { id: 's5', namn: 'Sadeltak 5°', text: 'Låg profil. Standard på ZN22.' },
  { id: 's7', namn: 'Sadeltak 7°', text: 'ZT19-utförande. Betecknas S7.' },
  { id: 's20', namn: 'Sadeltak 20°', text: 'Tydlig taklutning. Standard på ZN22.' },
  { id: 's27', namn: 'Sadeltak 27°', text: 'ZT19-utförande. Betecknas S.' },
  { id: 'valmat', namn: 'Valmat tak', text: 'Alla fyra sidor lutar. Betecknas V.' },
  { id: 'runt', namn: 'Runt tak', text: 'Välvt tak. Betecknas R.' },
]

export const PANELER = [
  { id: 'plat', namn: 'Plåtpanel', text: 'Profilerad plåt. Grundutförandet.' },
  { id: 'tra-liggande', namn: 'Träpanel, liggande', text: 'Liggande ribbpanel. Betecknas T.' },
  { id: 'tra-staende', namn: 'Träpanel, stående', text: 'Stående ribbpanel.' },
  { id: 'rockpanel', namn: 'Rockpanel', text: 'Skivbeklädnad i stora format.' },
  { id: 'koppar', namn: 'Kopparbeklädnad', text: 'För känsliga miljöer.' },
]

/* Standardkulörer enligt Norrmontages dokument Standardkulörer 1904.
   Hex-värdena är omräkningar från NCS och ska verifieras mot original. */
export const KULORER = [
  { id: 'rod', namn: 'Röd', ncs: 'NCS S 7020-Y90-R', hex: '#6b3a34' },
  { id: 'gragron', namn: 'Grågrön', ncs: 'NCS S 6005-G20Y', hex: '#5c6157' },
  { id: 'svart', namn: 'Svart', ncs: 'NCS S 9000-N', hex: '#1b1b1b' },
  { id: 'gra', namn: 'Grå', ncs: 'NCS S 7500-N', hex: '#6e6e6e' },
]

export const YTA = [
  { id: 'struktur', namn: 'Sandinblandad strukturfärg', text: 'Norrmontages standardutförande.' },
  { id: 'slat', namn: 'Slät färg', text: 'Jämn yta utan sandinblandning.' },
]

/* Innehåll. Grupperna följer produktsidornas indelning. */
export const HOGSPANNING = [
  {
    id: 'nal',
    namn: 'NAL / NALF',
    text: 'Lastfrånskiljare och säkringslastfrånskiljare med jordkopplare eller kulbultsjordning.',
  },
  {
    id: 'ldtm',
    namn: 'LDTM FE/SEA',
    text: 'Driescher-apparat med jordningskopplare eller kulbultsjordning. Betecknas D.',
  },
  {
    id: 'stum',
    namn: 'Stumkoppling',
    text: 'Med antingen lask eller rörlask.',
  },
]

export const HSP_TILLVAL = [
  { id: 'motormanover', namn: 'Motormanöver', text: 'För lastfrånskiljare och jordkopplare, samtliga fack.' },
  { id: 'kulbult', namn: 'Kulbultsjordning', text: 'Alternativ till jordkopplare.' },
]

export const LAGSPANNING = [
  {
    id: 'abb-kabeldon',
    namn: 'ABB kabeldon',
    text: 'Normal skenlängd 795 mm, max 630 A. Anpassad för de nya SLDL-apparaterna.',
  },
  {
    id: 'abb-cewe',
    namn: 'ABB CEWE',
    text: 'Normal skenlängd 795 mm, 630 A.',
  },
]

export const TILLVAL = [
  { id: 'itFack', namn: 'Separat IT-fack', text: 'Eget utrymme för IT-utrustning.' },
  { id: 'ventilation', namn: 'Filter för ventilation', text: 'Filtrerad ventilation.' },
  { id: 'matkontroll', namn: 'Mät- och kontrollutrustning', text: 'Goda utrymmen avsatta för ändamålet.' },
  {
    id: 'rls',
    namn: 'Inomhusbetjänat manöverutrymme',
    text: 'För styrelektronik, isolerat eller oisolerat. Betecknas RLS.',
    endast: ['natstation-2000', 'kopplingsstation'],
  },
  {
    id: 'kylning',
    namn: 'Forcerad kylning',
    text: 'ZT19 är utrustad med forcerad kylning från och med 1250 kVA.',
    endast: ['natstation-2000'],
  },
  {
    id: 'lokalkraft',
    namn: 'Egen lokalkraftsmatning',
    text: 'Gör stationen självförsörjande för egen funktion.',
    endast: ['kopplingsstation'],
  },
]
