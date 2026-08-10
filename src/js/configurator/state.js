/* ==========================================================================
   Stationsbyggarens tillstånd och beroendelogik.
   Reglerna kommer från Norrmontages egna beskrivningar, t.ex. att ZT19 är
   utrustad med forcerad kylning från 1250 kVA, och att kopplingsstationen
   saknar eget transformatorutrymme.
   ========================================================================== */

import {
  STATIONSTYPER,
  SPANNINGAR,
  TAK,
  PANELER,
  KULORER,
  TILLVAL,
  HOGSPANNING,
  LAGSPANNING,
} from './options.js'

const lyssnare = new Set()

export const state = {
  typ: 'natstation-315',
  spanning: '24',
  kva: 315,
  fack: 3,
  trafo: 1,
  tak: 's20',
  panel: 'plat',
  yta: 'struktur',
  kulorVagg: 'gragron',
  /* Skilda kulörer är ett tillval; slås det av följer tak och fundament väggen. */
  skildaKulorer: false,
  kulorTak: 'gragron',
  kulorFundament: 'gra',
  hsp: 'nal',
  lsp: 'abb-kabeldon',
  tillval: new Set(['ventilation']),
}

export function onChange(fn) {
  lyssnare.add(fn)
  return () => lyssnare.delete(fn)
}

function meddela() {
  lyssnare.forEach((fn) => fn(state))
}

export function typDef(id = state.typ) {
  return STATIONSTYPER.find((t) => t.id === id)
}

/** Sätter ett värde och kör beroendelogiken innan lyssnarna meddelas. */
export function set(nyckel, varde) {
  state[nyckel] = varde
  if (nyckel === 'typ') efterTypbyte()
  normalisera()
  meddela()
}

export function toggleTillval(id) {
  if (arvdTillval(id)) return // styrs av annan regel, går inte att välja bort
  state.tillval.has(id) ? state.tillval.delete(id) : state.tillval.add(id)
  normalisera()
  meddela()
}

/** Tillval som sätts av en regel och därför visas som låsta. */
export function arvdTillval(id) {
  return id === 'kylning' && state.typ === 'natstation-2000' && state.kva >= 1250
}

/* --- Regler ------------------------------------------------------------------ */

function efterTypbyte() {
  const t = typDef()

  /* Effekt in i familjens spann. */
  if (t.kvaMin != null) {
    state.kva = Math.min(Math.max(state.kva, t.kvaMin), t.kvaMax)
  }

  /* Transformatorantal som familjen faktiskt erbjuder. */
  if (!t.trafo.includes(state.trafo)) state.trafo = t.trafo[0]

  /* Kopplingsstation och teknikhus har inga HSP-fack respektive fritt utförande. */
  state.fack = Math.min(Math.max(state.fack, t.fackMin), t.fackMax)

  /* Taklutningarna skiljer sig mellan familjerna. ZN22 har 5° och 20°,
     ZT19 har 7° och 27°. Byt till familjens första om det valda inte finns. */
  if (!t.tak.includes(state.tak)) state.tak = t.tak[0]

  /* 36 kV finns bara på ZT19. */
  if (!spanningTillganglig(state.spanning)) state.spanning = '24'
}

function normalisera() {
  const t = typDef()

  if (t.kvaMin != null) {
    state.kva = Math.min(Math.max(state.kva, t.kvaMin), t.kvaMax)
  }
  state.fack = Math.min(Math.max(state.fack, t.fackMin), t.fackMax)
  if (!t.trafo.includes(state.trafo)) state.trafo = t.trafo[0]
  if (!t.tak.includes(state.tak)) state.tak = t.tak[0]

  /* Två transformatorer kräver en familj som klarar det. */
  if (state.trafo === 2 && !t.trafo.includes(2)) state.trafo = 1

  /* Forcerad kylning följer med automatiskt från 1250 kVA. */
  if (arvdTillval('kylning')) state.tillval.add('kylning')

  /* Tillval som inte hör till den valda typen plockas bort. */
  TILLVAL.forEach((tv) => {
    if (tv.endast && !tv.endast.includes(state.typ)) state.tillval.delete(tv.id)
  })

  /* Teknikhus har varken HSP- eller LSP-val. */
  if (state.typ === 'teknikhus') {
    state.tillval.delete('itFack')
  }

  /* Utan skilda kulörer följer tak och fundament väggkulören. */
  if (!state.skildaKulorer) {
    state.kulorTak = state.kulorVagg
  }
}

export function spanningTillganglig(id) {
  const s = SPANNINGAR.find((x) => x.id === id)
  if (!s) return false
  return !s.endast || s.endast.includes(state.typ)
}

export function tillvalTillgangligt(tv) {
  return !tv.endast || tv.endast.includes(state.typ)
}

/** Visar RMU-läget: då byts hela högspänningsapparaturen ut. */
export function arRmu() {
  return state.spanning === 'rmu'
}

/* --- Härledda värden ---------------------------------------------------------- */

export function hex(kulorId) {
  return KULORER.find((k) => k.id === kulorId)?.hex ?? '#6e6e6e'
}

/** Konfiguration i det format som stationsritaren vill ha. */
export function ritConfig() {
  return {
    fack: state.fack,
    trafo: state.trafo,
    tak: state.tak,
    panel: state.panel,
    kulorVagg: hex(state.kulorVagg),
    kulorTak: hex(state.skildaKulorer ? state.kulorTak : state.kulorVagg),
    kulorFundament: hex(state.skildaKulorer ? state.kulorFundament : 'gra'),
    struktur: state.yta === 'struktur',
    itFack: state.tillval.has('itFack'),
    ventilation: state.tillval.has('ventilation'),
    rls: state.tillval.has('rls'),
  }
}

/** Sammanfattning i klartext, för specifikationsrutan. */
export function sammanfattning() {
  const t = typDef()
  const namn = (lista, id) => lista.find((x) => x.id === id)?.namn ?? '–'

  const rader = [['Stationstyp', `${t.namn} (${t.familj})`]]
  /* Teknikhus har inget spänningsval, steget är dolt och ska inte synas här. */
  if (state.typ !== 'teknikhus') rader.push(['Spänning', namn(SPANNINGAR, state.spanning)])

  if (t.kvaMin != null) rader.push(['Effekt', `${state.kva} kVA`])
  if (t.fackMax > 0) rader.push(['Högspänningsfack', `${state.fack} st`])
  else if (state.typ !== 'teknikhus') rader.push(['Högspänningsfack', 'Utan HSP-ställverk'])
  if (t.trafo.some((n) => n > 0)) rader.push(['Transformatorer', `${state.trafo} st`])

  rader.push(['Tak', namn(TAK, state.tak)])
  rader.push(['Fasad', namn(PANELER, state.panel)])

  const vagg = KULORER.find((k) => k.id === state.kulorVagg)
  rader.push(['Kulör, väggar', `${vagg.namn} (${vagg.ncs})`])

  if (state.skildaKulorer) {
    const tak = KULORER.find((k) => k.id === state.kulorTak)
    const fund = KULORER.find((k) => k.id === state.kulorFundament)
    rader.push(['Kulör, tak', `${tak.namn} (${tak.ncs})`])
    rader.push(['Kulör, fundament', `${fund.namn} (${fund.ncs})`])
  }

  rader.push(['Ytbehandling', state.yta === 'struktur' ? 'Sandinblandad strukturfärg' : 'Slät färg'])

  if (state.typ !== 'teknikhus') {
    rader.push([
      'Högspänning',
      arRmu() ? 'RMU (kompaktställverk)' : namn(HOGSPANNING, state.hsp),
    ])
    rader.push(['Lågspänning', namn(LAGSPANNING, state.lsp)])
  }

  const valda = TILLVAL.filter((tv) => state.tillval.has(tv.id)).map((tv) => tv.namn)
  rader.push(['Tillval', valda.length ? valda.join(', ') : 'Inga'])

  return rader
}

/**
 * Närmast matchande artikelbeteckning, som information och inte som köplänk.
 * Matchar på familj, spänning och antal fack; faller tillbaka på familjen.
 */
export function narmasteModell(modeller) {
  const iFamilj = modeller.filter((m) => m.kategori === state.typ)
  if (!iFamilj.length) return null

  const kv = state.spanning === 'rmu' ? null : Number(state.spanning)
  const apparat = arRmu() ? 'RMU' : null

  const poang = (m) =>
    (apparat ? (m.apparat === apparat ? 3 : 0) : m.apparat !== 'RMU' ? 1 : 0) +
    (kv && m.kv === kv ? 2 : 0) +
    (m.fack === state.fack ? 2 : 0) +
    (m.trafo === state.trafo ? 1 : 0)

  return iFamilj.reduce((bast, m) => (poang(m) > poang(bast) ? m : bast), iFamilj[0])
}
