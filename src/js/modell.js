/* Modellsida. Byggs ur models.json på ?id=. */

import '../styles/modell.css'
import { site, modellMedia, getKategori } from './site.js'
import { stationSVG } from './configurator/station-svg.js'

const id = new URLSearchParams(location.search).get('id')
const m = site.modeller.find((x) => x.id === id)

if (!m) {
  document.getElementById('modell-innehall').innerHTML = `
    <section class="section"><div class="container-narrow" style="text-align:center">
      <h1>Modellen hittades inte</h1>
      <p class="lead">Den här beteckningen finns inte i sortimentet.</p>
      <p class="btn-row" style="justify-content:center">
        <a class="btn btn--primary" href="sortiment.html">Till sortimentet</a>
      </p>
    </div></section>`
} else {
  render(m)
}

function render(m) {
  const kat = getKategori(m.kategori)
  document.title = `${m.namn} – Norrmontage AB`

  document.getElementById('brodsmulor').innerHTML = `
    <li><a href="index.html">Start</a></li>
    <li><a href="sortiment.html">Sortiment</a></li>
    <li><a href="sortiment.html?k=${kat.id}">${kat.namn}</a></li>
    <li aria-current="page">${m.namn}</li>`

  const fakta = [
    ['Kategori', kat.namn],
    ['Familj', kat.familj],
    m.kv ? ['Spänning', `${m.kv} kV`] : null,
    m.kva ? ['Transformator', `max ${m.kva} kVA`] : null,
    m.fack ? ['Högspänningsfack', `${m.fack} st`] : ['Högspänningsfack', 'Utan HSP-ställverk'],
    m.trafo ? ['Transformatorer', `${m.trafo} st`] : null,
    ['Apparattyp', m.apparat ?? '–'],
    m.rls ? ['Styrelektronik', 'Inomhusbetjänat utrymme (RLS)'] : null,
    m.matt ? ['Mått enligt ritning', `${m.matt.bredd} × ${m.matt.hojd} mm`] : null,
  ].filter(Boolean)

  document.getElementById('modell-innehall').innerHTML = `
  <section class="modell-topp">
    <div class="container modell-topp__grid">
      <div class="modell-topp__media">
        ${modellMedia(m, stationSVG)}
        ${m.bild ? '' : '<p class="modell-topp__notis">Illustration ur modellens specifikation. Foto tillkommer.</p>'}
      </div>
      <div class="modell-topp__text">
        <p class="eyebrow">${kat.kort}</p>
        <h1 class="mono">${m.namn}</h1>
        <p class="lead">${m.ingress ?? ''}</p>
        ${m.beskrivning ? `<p>${m.beskrivning}</p>` : ''}
        <div class="btn-row">
          <a class="btn btn--primary" href="stationsbyggaren.html?modell=${m.id}">Bygg den här stationen</a>
          <a class="btn btn--ghost" href="kontakt.html">Kontakta oss</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-head"><p class="eyebrow">Specifikation</p><h2>Snabbfakta</h2></div>
      <dl class="faktalista">
        ${fakta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Utrustningsalternativ</p>
        <h2>Det här går att välja</h2>
        <p class="lead">
          Stationen levereras enligt ordererkännande. Nedan är de alternativ som kan väljas till
          hus, högspänning och lågspänning.
        </p>
      </div>
      <div class="utrustning">
        ${site.utrustning.grupper.map(grupp).join('')}
      </div>
      <p class="note" style="margin-top: var(--space-l)">
        Hittar du inte det du söker? Vi tar fram kundanpassade lösningar och har mängder av
        specialstationer. <a href="kontakt.html">Hör av er så tar vi fram ett förslag.</a>
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container modell-botten">
      <div>
        <div class="section-head"><p class="eyebrow">Underlag</p><h2>Ritningar och dokument</h2></div>
        <ul class="dokumentlista">
          ${(m.dokument ?? [])
            .map(
              (d) => `<li>
                <span class="dokumentlista__ikon" aria-hidden="true">PDF</span>
                <span><strong>${d.namn}</strong><br /><span class="dokumentlista__typ">${d.typ}</span></span>
              </li>`,
            )
            .join('')}
          <li>
            <span class="dokumentlista__ikon" aria-hidden="true">PDF</span>
            <span><strong>Handhavandebeskrivning</strong><br />
            <span class="dokumentlista__typ">Generell samt familjespecifik</span></span>
          </li>
        </ul>
        <p class="note">
          Ritningar och grundläggningsinstruktioner för respektive station finns under
          <a href="underlag.html">Underlag &amp; dokument</a>.
        </p>
      </div>
      <aside class="modell-kontakt">
        <h3>Behöver ni en variant?</h3>
        <p>
          Taklutning, fasad, kulör och innehåll väljs per projekt. Prova kombinationerna i
          Stationsbyggaren eller ring oss direkt.
        </p>
        <div class="btn-row">
          <a class="btn btn--dark" href="stationsbyggaren.html?modell=${m.id}">Öppna Stationsbyggaren</a>
        </div>
        <p class="mono"><a href="tel:064710800">Växel 0647-10800</a></p>
      </aside>
    </div>
  </section>`
}

function grupp(g) {
  return `
  <article class="utrustning__grupp">
    <h3>
      <span class="utrustning__ikon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><path d="${g.ikon}"/></svg>
      </span>
      ${g.namn}
    </h3>
    <ul>${g.punkter.map((t) => `<li>${t}</li>`).join('')}</ul>
  </article>`
}
