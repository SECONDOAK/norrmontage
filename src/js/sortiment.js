/* Sortimentshubb: filtrerar modeller mot models.json. */

import '../styles/sortiment.css'
import { site, modellMedia } from './site.js'
import { stationSVG } from './configurator/station-svg.js'

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

/* Filtergrupperna härleds ur datan så att de aldrig hamnar i otakt med den. */
const GRUPPER = [
  {
    id: 'kategori',
    namn: 'Kategori',
    varden: () => site.kategorier.map((k) => ({ v: k.id, text: k.namn })),
    test: (m, v) => m.kategori === v,
  },
  {
    id: 'kv',
    namn: 'Spänning',
    varden: () =>
      [...new Set(site.modeller.map((m) => m.kv).filter(Boolean))]
        .sort((a, b) => a - b)
        .map((v) => ({ v: String(v), text: `${v} kV` })),
    test: (m, v) => String(m.kv) === v,
  },
  {
    id: 'apparat',
    namn: 'Apparattyp',
    varden: () =>
      [...new Set(site.modeller.map((m) => m.apparat).filter(Boolean))].map((v) => ({ v, text: v })),
    test: (m, v) => m.apparat === v,
  },
  {
    id: 'fack',
    namn: 'Högspänningsfack',
    varden: () => [
      { v: '0', text: 'Utan HSP-fack' },
      { v: '1-3', text: '1–3 fack' },
      { v: '4-6', text: '4–6 fack' },
      { v: '7+', text: '7 fack eller fler' },
    ],
    test: (m, v) => {
      const f = m.fack ?? 0
      if (v === '0') return f === 0
      if (v === '1-3') return f >= 1 && f <= 3
      if (v === '4-6') return f >= 4 && f <= 6
      return f >= 7
    },
  },
  {
    id: 'kva',
    namn: 'Effekt',
    varden: () => [
      { v: '0-315', text: 'Upp till 315 kVA' },
      { v: '316-1000', text: '316–1000 kVA' },
      { v: '1001+', text: 'Över 1000 kVA' },
    ],
    test: (m, v) => {
      if (m.kva == null) return false
      if (v === '0-315') return m.kva <= 315
      if (v === '316-1000') return m.kva > 315 && m.kva <= 1000
      return m.kva > 1000
    },
  },
]

/** Aktiva val, per grupp-id → Set av värden. */
const val = new Map(GRUPPER.map((g) => [g.id, new Set()]))

/* Förvälj kategori från ?k= så att kort och footer kan djuplänka hit. */
const kFromUrl = new URLSearchParams(location.search).get('k')
if (kFromUrl && site.kategorier.some((k) => k.id === kFromUrl)) {
  val.get('kategori').add(kFromUrl)
}

renderFilter()
renderBenamning()
uppdatera()

function renderFilter() {
  const host = document.getElementById('filter-grupper')

  host.innerHTML = GRUPPER.map(
    (g) => `
    <fieldset class="filter__grupp">
      <legend>${g.namn}</legend>
      ${g
        .varden()
        .map(
          (o) => `
        <label class="kryss">
          <input type="checkbox" name="${g.id}" value="${o.v}"
                 ${val.get(g.id).has(o.v) ? 'checked' : ''} />
          <span>${o.text}</span>
          <span class="kryss__antal" data-antal="${g.id}:${o.v}"></span>
        </label>`,
        )
        .join('')}
    </fieldset>`,
  ).join('')

  host.addEventListener('change', (e) => {
    const el = e.target
    if (el.type !== 'checkbox') return
    const set = val.get(el.name)
    el.checked ? set.add(el.value) : set.delete(el.value)
    uppdatera()
  })

  document.getElementById('rensa').addEventListener('click', () => {
    val.forEach((s) => s.clear())
    host.querySelectorAll('input[type=checkbox]').forEach((i) => (i.checked = false))
    uppdatera()
  })
}

/** En modell passerar om den matchar minst ett val i varje aktiv grupp. */
function matchar(m, hoppaOver = null) {
  return GRUPPER.every((g) => {
    if (g.id === hoppaOver) return true
    const s = val.get(g.id)
    return s.size === 0 || [...s].some((v) => g.test(m, v))
  })
}

function uppdatera() {
  const trafflista = site.modeller.filter((m) => matchar(m))

  const host = document.getElementById('modell-lista')
  const tomt = document.getElementById('tomt')
  host.innerHTML = trafflista.map(kort).join('')
  tomt.hidden = trafflista.length > 0

  const aktiva = GRUPPER.reduce((n, g) => n + val.get(g.id).size, 0)
  document.getElementById('resultat-rad').textContent =
    `${trafflista.length} ${trafflista.length === 1 ? 'station' : 'stationer'}` +
    (aktiva ? ` · ${aktiva} ${aktiva === 1 ? 'filter' : 'filter'} aktiva` : '')

  /* Visa hur många träffar varje enskilt val skulle ge, givet övriga filter. */
  GRUPPER.forEach((g) => {
    g.varden().forEach((o) => {
      const n = site.modeller.filter((m) => matchar(m, g.id) && g.test(m, o.v)).length
      const el = document.querySelector(`[data-antal="${CSS.escape(g.id + ':' + o.v)}"]`)
      if (el) {
        el.textContent = n
        el.closest('.kryss').classList.toggle('kryss--tom', n === 0)
      }
    })
  })
}

function kort(m) {
  const kat = site.kategorier.find((k) => k.id === m.kategori)
  const spec = [
    m.kv ? `${m.kv} kV` : null,
    m.fack ? `${m.fack} HSP-fack` : null,
    m.kva ? `${m.kva} kVA` : null,
    m.trafo ? `${m.trafo} trafo` : null,
  ].filter(Boolean)

  return `
  <article class="card card--link modell-kort">
    <div class="card__media">${modellMedia(m, stationSVG)}</div>
    <div class="card__body">
      <p class="card__meta">${kat?.kort ?? ''}</p>
      <h3 class="card__title"><a href="modell.html?id=${m.id}">${m.namn}</a></h3>
      <p class="card__text">${m.ingress ?? ''}</p>
      <ul class="spec-chips">${spec.map((s) => `<li>${s}</li>`).join('')}</ul>
      <p class="card__foot">Till modellen ${ARROW}</p>
    </div>
  </article>`
}

function renderBenamning() {
  const host = document.getElementById('benamning')
  const b = site.benamning

  host.innerHTML = `
    <p class="benamning__exempel mono">${b.exempel}</p>
    <dl class="benamning__lista">
      ${b.delar
        .map(
          (d) => `<div><dt class="mono">${d.del}</dt><dd>${d.betyder}</dd></div>`,
        )
        .join('')}
    </dl>`
}
