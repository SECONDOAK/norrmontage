/* ==========================================================================
   Stationsbyggarens gränssnitt.
   Ritar om stegen vid varje ändring så att beroendelogiken alltid syns:
   otillgängliga val försvinner, låsta val visas som låsta.
   ========================================================================== */

import '../../styles/byggare.css'
import { site } from '../site.js'
import { stationSVG } from './station-svg.js'
import {
  STATIONSTYPER,
  SPANNINGAR,
  TAK,
  PANELER,
  KULORER,
  YTA,
  HOGSPANNING,
  LAGSPANNING,
  TILLVAL,
} from './options.js'
import {
  state,
  set,
  toggleTillval,
  arvdTillval,
  typDef,
  spanningTillganglig,
  tillvalTillgangligt,
  arRmu,
  ritConfig,
  sammanfattning,
  narmasteModell,
} from './state.js'

const steg = document.getElementById('steg')
const scen = document.getElementById('scen')

/* Startläge från ?modell= så att modellsidans knapp landar rätt. */
const modellId = new URLSearchParams(location.search).get('modell')
if (modellId) {
  const m = site.modeller.find((x) => x.id === modellId)
  if (m) {
    state.typ = m.kategori
    state.spanning = m.apparat === 'RMU' ? 'rmu' : String(m.kv ?? 24)
    state.fack = m.fack ?? state.fack
    state.trafo = m.trafo ?? state.trafo
    if (m.kva) state.kva = m.kva
    if (m.rls) state.tillval.add('rls')
  }
}

rita()
steg.addEventListener('change', hanteraAndring)
steg.addEventListener('click', hanteraKlick)

function hanteraAndring(e) {
  const el = e.target
  const { valgrupp } = el.dataset
  if (!valgrupp) return

  if (el.type === 'range' || el.type === 'number') {
    set(valgrupp, Number(el.value))
  } else if (el.type === 'checkbox') {
    if (valgrupp === 'tillval') toggleTillval(el.value)
    else set(valgrupp, el.checked)
  } else {
    set(valgrupp, el.value)
  }
}

function hanteraKlick(e) {
  const knapp = e.target.closest('[data-stega]')
  if (!knapp) return
  const { stega, valgrupp } = knapp.dataset
  set(valgrupp, state[valgrupp] + Number(stega))
}

/* --- Rendering ---------------------------------------------------------------- */

function rita() {
  const t = typDef()

  /* Stegen numreras efter att de otillgängliga fallit bort, så att
     teknikhus inte hoppar från 1 till 3. */
  const block = [
    ['Stationstyp', kortval('typ', STATIONSTYPER.map(medFamilj), state.typ)],

    t.id !== 'teknikhus' && [
      'Spänning och apparattyp',
      kortval(
        'spanning',
        SPANNINGAR.filter((s) => spanningTillganglig(s.id)),
        state.spanning,
      ),
    ],

    ['Storlek', storlek(t)],

    [
      'Taklutning',
      kortval(
        'tak',
        TAK.filter((x) => t.tak.includes(x.id)),
        state.tak,
      ),
    ],

    ['Fasad', kortval('panel', PANELER, state.panel)],
    ['Kulör', kulorBlock()],
    ['Innehåll', t.id !== 'teknikhus' ? innehallBlock() : teknikhusNot()],
  ].filter(Boolean)

  steg.innerHTML = block.map(([titel, innehall], i) => stegBlock(i + 1, titel, innehall)).join('')

  ritaScen()
  ritaSpec()
}

function medFamilj(s) {
  return { ...s, badge: s.familj }
}

function stegBlock(nr, titel, innehall) {
  return `
  <li class="steg__block">
    <h2 class="steg__rubrik"><span class="steg__nr">${nr}</span>${titel}</h2>
    ${innehall}
  </li>`
}

/** Radiogrupp som kort. */
function kortval(grupp, lista, valt) {
  return `
  <fieldset class="valgrid">
    <legend class="visually-hidden">${grupp}</legend>
    ${lista
      .map(
        (o) => `
      <label class="val ${valt === o.id ? 'val--vald' : ''}">
        <input type="radio" name="${grupp}" value="${o.id}" data-valgrupp="${grupp}"
               ${valt === o.id ? 'checked' : ''} />
        <span class="val__namn">${o.namn}</span>
        ${o.badge ? `<span class="val__badge mono">${o.badge}</span>` : ''}
        ${o.text ? `<span class="val__text">${o.text}</span>` : ''}
      </label>`,
      )
      .join('')}
  </fieldset>`
}

function storlek(t) {
  const delar = []

  if (t.kvaMin != null) {
    delar.push(`
      <div class="reglage">
        <label for="kva">Effekt <output class="mono">${state.kva} kVA</output></label>
        <input type="range" id="kva" data-valgrupp="kva"
               min="${t.kvaMin}" max="${t.kvaMax}" step="5" value="${state.kva}" />
        <p class="reglage__spann mono"><span>${t.kvaMin} kVA</span><span>${t.kvaMax} kVA</span></p>
      </div>`)
  }

  if (t.fackMax > 0) {
    delar.push(stepper('fack', 'Högspänningsfack', state.fack, t.fackMin, t.fackMax))
  } else if (t.id !== 'teknikhus') {
    delar.push(
      `<p class="regelnot">Stationstypen saknar högspänningsställverk. Transformatorn säkras i stolpe eller i matande station.</p>`,
    )
  }

  if (t.trafo.includes(2)) {
    delar.push(stepper('trafo', 'Transformatorer', state.trafo, Math.min(...t.trafo), 2))
  } else if (t.id === 'kopplingsstation') {
    delar.push(
      `<p class="regelnot">Kopplingsstationen har inget eget transformatorutrymme.</p>`,
    )
  }

  if (t.id === 'natstation-2000' && state.kva >= 1250) {
    delar.push(
      `<p class="regelnot regelnot--aktiv">Från 1250 kVA är ZT19 utrustad med forcerad kylning. Den är därför förvald nedan.</p>`,
    )
  }

  if (t.id === 'teknikhus') {
    delar.push(
      `<p class="regelnot">Teknikhus byggs efter era mått. Storlek och innehåll tar vi fram tillsammans med er.</p>`,
    )
  }

  return `<div class="storlek">${delar.join('')}</div>`
}

function stepper(grupp, etikett, varde, min, max) {
  return `
  <div class="stepper">
    <span class="stepper__etikett">${etikett}</span>
    <div class="stepper__kontroll">
      <button type="button" data-stega="-1" data-valgrupp="${grupp}"
              ${varde <= min ? 'disabled' : ''} aria-label="Minska ${etikett}">−</button>
      <output class="mono">${varde}</output>
      <button type="button" data-stega="1" data-valgrupp="${grupp}"
              ${varde >= max ? 'disabled' : ''} aria-label="Öka ${etikett}">+</button>
    </div>
    <span class="stepper__spann mono">${min}–${max}</span>
  </div>`
}

function kulorBlock() {
  const swatchar = (grupp, valt) => `
    <fieldset class="kulorgrid">
      <legend class="visually-hidden">${grupp}</legend>
      ${KULORER.map(
        (k) => `
        <label class="kulor ${valt === k.id ? 'kulor--vald' : ''}">
          <input type="radio" name="${grupp}" value="${k.id}" data-valgrupp="${grupp}"
                 ${valt === k.id ? 'checked' : ''} />
          <span class="kulor__prov" style="--prov:${k.hex}"></span>
          <span class="kulor__namn">${k.namn}</span>
          <span class="kulor__ncs mono">${k.ncs}</span>
        </label>`,
      ).join('')}
    </fieldset>`

  return `
  <div class="kulorblock">
    <p class="delrubrik">Väggar</p>
    ${swatchar('kulorVagg', state.kulorVagg)}

    <p class="regelnot">
      Fyra kulörer finns som standard. Andra kulörer kan fås mot förfrågan.
    </p>

    <label class="switch">
      <input type="checkbox" data-valgrupp="skildaKulorer" ${state.skildaKulorer ? 'checked' : ''} />
      <span>Skilda kulörer på fundament, väggar och tak</span>
    </label>

    ${
      state.skildaKulorer
        ? `<div class="kulorblock__extra">
             <p class="delrubrik">Tak</p>
             ${swatchar('kulorTak', state.kulorTak)}
             <p class="delrubrik">Fundament</p>
             ${swatchar('kulorFundament', state.kulorFundament)}
           </div>`
        : ''
    }

    <p class="delrubrik">Ytbehandling</p>
    ${kortval('yta', YTA, state.yta)}
  </div>`
}

function innehallBlock() {
  const tillgangliga = TILLVAL.filter(tillvalTillgangligt)

  return `
  <div class="innehall">
    <p class="delrubrik">Högspänning</p>
    ${
      arRmu()
        ? `<p class="regelnot regelnot--aktiv">
             Med RMU ersätts de luftisolerade apparaterna av ett kompaktställverk.
             Valet av lastfrånskiljare utgår därför.
           </p>`
        : kortval('hsp', HOGSPANNING, state.hsp)
    }

    <p class="delrubrik">Lågspänning</p>
    ${kortval('lsp', LAGSPANNING, state.lsp)}

    <p class="delrubrik">Tillval</p>
    <fieldset class="tillvalgrid">
      <legend class="visually-hidden">Tillval</legend>
      ${tillgangliga
        .map((tv) => {
          const last = arvdTillval(tv.id)
          const pa = state.tillval.has(tv.id)
          return `
          <label class="tillval ${pa ? 'tillval--pa' : ''} ${last ? 'tillval--last' : ''}">
            <input type="checkbox" value="${tv.id}" data-valgrupp="tillval"
                   ${pa ? 'checked' : ''} ${last ? 'disabled' : ''} />
            <span class="tillval__namn">${tv.namn}${last ? ' <em>(ingår)</em>' : ''}</span>
            <span class="tillval__text">${tv.text}</span>
          </label>`
        })
        .join('')}
    </fieldset>
  </div>`
}

function teknikhusNot() {
  return `
  <p class="regelnot">
    Teknikhus levereras kundanpassat. Vad huset innehåller, oavsett om det är högspänning,
    lågspänning, batterier eller styrelektronik, bestäms av ändamålet och tar vi fram
    tillsammans med er.
  </p>`
}

/* --- Visning ------------------------------------------------------------------- */

function ritaScen() {
  scen.innerHTML = stationSVG(ritConfig())
  const svg = scen.querySelector('svg')
  document.getElementById('vy-alt').textContent = svg?.getAttribute('aria-label') ?? ''
}

function ritaSpec() {
  const rader = sammanfattning()
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('')
  const narmast = narmasteModell(site.modeller)
  const narmastText = narmast ? `Liknar ${narmast.namn}` : 'Kundanpassat utförande'

  document.getElementById('spec-lista').innerHTML = rader
  document.getElementById('narmast').textContent = narmastText

  /* Samma specifikation speglas i säljarformuläret längre ner. */
  const formSpec = document.getElementById('form-spec')
  if (formSpec) {
    formSpec.innerHTML = rader
    document.getElementById('form-narmast').textContent = narmastText
  }
}

/* --- Mockat säljarformulär ------------------------------------------------------ */
/* Prototyp: ingen backend. Skicket byts mot ett kvitto så att flödet från
   byggd station till säljarkontakt går att uppleva och visa internt. */

function initSaljarForm() {
  const form = document.getElementById('saljar-form')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const namn = form.elements.namn.value.trim()
    const epost = form.elements.epost.value.trim()
    const fel = document.getElementById('form-fel')
    const giltig = namn && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost)

    fel.hidden = giltig
    if (!giltig) return

    const narmast = narmasteModell(site.modeller)
    document.getElementById('kvitto-epost').textContent = epost
    document.getElementById('kvitto-modell').textContent = narmast?.namn ?? 'kundanpassat utförande'

    form.hidden = true
    const kvitto = document.getElementById('saljar-kvitto')
    kvitto.hidden = false
    kvitto.focus?.()
  })
}

initSaljarForm()

/* Rita om allt vid varje ändring. Konfigurationen är liten nog att detta
   är enklare och säkrare än att uppdatera delar av trädet. Fokus återställs
   så att tangentbordsnavigering inte tappas. */
import { onChange } from './state.js'
onChange(() => {
  const aktivId = document.activeElement?.id
  const aktivNamn = document.activeElement?.name
  const aktivVarde = document.activeElement?.value

  rita()

  const ater = aktivId
    ? document.getElementById(aktivId)
    : aktivNamn
      ? steg.querySelector(`[name="${aktivNamn}"][value="${aktivVarde}"]`)
      : null
  ater?.focus({ preventScroll: true })
})
