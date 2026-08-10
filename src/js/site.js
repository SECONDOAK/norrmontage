/* Delad sidlogik: mobilmeny och aktiv navigation. */

import data from '../data/models.json'

/** Modelldata. Importeras statiskt så den buntas med i bygget. */
export const site = data

export function initSite() {
  initMobileNav()
  markCurrentPage()
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle')
  const menu = document.querySelector('.mobile-nav')
  if (!toggle || !menu) return

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', String(!open))
    menu.dataset.open = String(!open)
  })

  // Stäng vid resize upp till desktop så tillståndet inte hänger kvar.
  const mq = window.matchMedia('(min-width: 64rem)')
  mq.addEventListener('change', (e) => {
    if (e.matches) {
      toggle.setAttribute('aria-expanded', 'false')
      menu.dataset.open = 'false'
    }
  })
}

function markCurrentPage() {
  const here = location.pathname.replace(/\/$/, '') || '/index.html'
  /* Länkarna är relativa så att sajten kan ligga under valfri sökväg.
     Jämför därför bara filnamnet, inte hela sökvägen. */
  const fil = (s) => s.split('/').pop().split('?')[0] || 'index.html'
  const harFil = fil(here)

  document.querySelectorAll('.site-nav a, .mobile-nav a').forEach((a) => {
    const href = a.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('#')) return
    if (fil(href) === harFil) a.setAttribute('aria-current', 'page')
  })
}

/**
 * Bilden för en modell: ett riktigt foto där vi har ett som föreställer just
 * den stationen, annars en ritning genererad ur modellens egna specifikationer.
 * Det gör att listan varierar på riktigt istället för att upprepa samma foto.
 */
export function modellMedia(m, stationSVG) {
  if (m.bild) {
    return `<img src="${m.bild}" alt="" loading="lazy" />`
  }
  const r = m.ritning ?? {}
  return `<div class="ritning">${stationSVG({
    fack: m.fack ?? 0,
    trafo: m.trafo ?? 0,
    tak: r.tak ?? 's20',
    panel: r.panel ?? 'plat',
    kulorVagg: r.kulor ?? '#6e6e6e',
    kulorTak: r.kulor ?? '#6e6e6e',
    kulorFundament: '#9aa3a8',
    struktur: true,
    rls: !!m.rls,
  })}</div>`
}

/** Slår upp en kategori på id. */
export function getKategori(id) {
  return site.kategorier.find((k) => k.id === id)
}

/** Alla modeller i en kategori. */
export function modellerI(kategoriId) {
  return site.modeller.filter((m) => m.kategori === kategoriId)
}
