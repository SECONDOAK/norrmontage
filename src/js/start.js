/* Startsida: kategorikort, segment, referenser och konfiguratorns förhandsvisning. */

import '../styles/start.css'
import { site } from './site.js'
import { stationSVG } from './configurator/station-svg.js'
import { renderSegment } from './segment.js'

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

function renderKategorier() {
  const host = document.getElementById('kategori-kort')
  if (!host) return

  host.innerHTML = site.kategorier
    .map((k) => {
      const antal = site.modeller.filter((m) => m.kategori === k.id).length
      return `
      <article class="card card--link kat-kort">
        <div class="card__media">
          <img src="${k.bild}" alt="" loading="lazy" />
        </div>
        <div class="card__body">
          <p class="card__meta">${k.familj}</p>
          <h3 class="card__title"><a href="sortiment.html?k=${k.id}">${k.namn}</a></h3>
          <p class="card__text">${k.ingress}</p>
          <p class="kat-kort__spec">
            <span>${k.effekt}</span>
            ${k.ebr !== '–' ? `<span>${k.ebr}</span>` : ''}
            ${antal ? `<span>${antal} modeller</span>` : ''}
          </p>
          <p class="card__foot">Till kategorin ${ARROW}</p>
        </div>
      </article>`
    })
    .join('')
}

const REFERENSER = [
  {
    bild: 'img/kort/ss2-falurod.jpg',
    titel: 'SS2 med träpanel och tegelimitationsplåt',
    text: '20° sadeltak, målad i falu ljusröd. Stationen smälter in där omgivningen kräver det.',
  },
  {
    bild: 'img/kort/koppar-valmat.jpg',
    titel: 'Kopparbeklädnad och valmat sadeltak',
    text: 'När stationen ska stå i en känslig miljö går fasadmaterialet att välja fritt.',
  },
  {
    bild: 'img/kort/zt19-rockpanel.jpg',
    titel: 'ZT19 med Rockpanel',
    text: 'Samma stationsfamilj som den falurödda satelliten, helt annat uttryck.',
  },
]

function renderReferenser() {
  const host = document.getElementById('referens-kort')
  if (!host) return

  host.innerHTML = REFERENSER.map(
    (r) => `
    <figure class="card">
      <div class="card__media"><img src="${r.bild}" alt="${r.titel}" loading="lazy" /></div>
      <figcaption class="card__body">
        <h3 class="card__title">${r.titel}</h3>
        <p class="card__text">${r.text}</p>
      </figcaption>
    </figure>`,
  ).join('')
}

/* Förhandsvisningen cyklar långsamt mellan några utföranden så att besökaren
   ser att stationen faktiskt förändras. */
function renderTeaser() {
  const host = document.getElementById('teaser-preview')
  if (!host) return

  const varianter = [
    { fack: 3, trafo: 1, tak: 's20', panel: 'plat', kulorVagg: '#5c6157', kulorTak: '#5c6157', kulorFundament: '#8d8d8d', struktur: true },
    { fack: 4, trafo: 1, tak: 's5', panel: 'tra-liggande', kulorVagg: '#1b1b1b', kulorTak: '#1b1b1b', kulorFundament: '#6e6e6e', struktur: false },
    { fack: 2, trafo: 1, tak: 'valmat', panel: 'koppar', kulorVagg: '#8a5a3c', kulorTak: '#6b7f74', kulorFundament: '#8d8d8d', struktur: false },
    { fack: 6, trafo: 1, tak: 's27', panel: 'rockpanel', kulorVagg: '#6b3a34', kulorTak: '#3d3230', kulorFundament: '#8d8d8d', struktur: true },
  ]

  let i = 0
  const draw = () => {
    host.innerHTML = stationSVG(varianter[i])
    host.style.color = '#8fa6b5'
  }
  draw()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  setInterval(() => {
    i = (i + 1) % varianter.length
    draw()
  }, 3600)
}

renderKategorier()
renderSegment()
renderReferenser()
renderTeaser()
