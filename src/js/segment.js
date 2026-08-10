/* Användningsområden. Segmenten är Norrmontages egna: elnät, industri,
   batterilager, solcellsparker och laddinfrastruktur. Delas av start- och
   om-oss-sidan. */

export const SEGMENT = [
  {
    namn: 'Elnät',
    text: 'Lokalnätets nätstationer och kopplingspunkter, kärnan i sortimentet sedan 60-talet.',
    ikon: 'M4 20h16M7 20V9l5-4 5 4v11M10 20v-5h4v5',
  },
  {
    namn: 'Industri',
    text: 'Stationer dimensionerade för industriell last, med utrymme för mät- och kontrollutrustning.',
    ikon: 'M3 20h18M5 20V10l5 3V10l5 3V7l4 2v11',
  },
  {
    namn: 'Batterilager',
    text: 'Kundanpassade isolerade teknikhus för energilager, byggda efter era mått.',
    ikon: 'M4 8h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4zM21 11v2M7 10v4M11 10v4',
  },
  {
    namn: 'Solcellsparker',
    text: 'Nätstationer för inmatning från solparker, ofta med RMU-ställverk och fjärrstyrning.',
    ikon: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l-1.5-1.5M19.5 19.5L18 18M6 18l-1.5 1.5M19.5 4.5L18 6M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  },
  {
    namn: 'Laddinfrastruktur',
    text: 'Stationer för snabbladdning längs väg, där effektbehovet växer snabbast.',
    ikon: 'M13 3l-6 9h5l-1 9 6-9h-5z',
  },
]

export function renderSegment(hostId = 'segment-grid') {
  const host = document.getElementById(hostId)
  if (!host) return

  host.innerHTML = SEGMENT.map(
    (s) => `
    <article class="segment">
      <span class="segment__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${s.ikon}"/></svg>
      </span>
      <h3>${s.namn}</h3>
      <p>${s.text}</p>
    </article>`,
  ).join('')
}
