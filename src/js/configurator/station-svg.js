/* ==========================================================================
   Stationsritaren
   Axonometrisk vektorbild av stationen, byggd för att likna referensfotona:
   taknocken löper parallellt med dörrfasaden, gavlarna sitter på kortsidorna
   och ljuset faller från vänster ovanifrån. Alla lager är namngivna så att de
   kan stylas eller bytas ut var för sig.

   Ljusmodell (en enda sanning för hela ritningen):
     front  1.00   sidovägg/gavel  0.76   taknock-slutning mot betraktaren ljus,
     bortre takfall 0.60           fundament sida 0.72
   ========================================================================== */

const W = 960
const H = 560

/* Djupvektor: kortsidan pekar bakåt-höger. */
const DX = 118
const DY = 54

const GROUND_Y = 462
const FUND_H = 22
const BODY_H = 192
const OV = 16 /* taköverhäng utanför vägg */

/* Nominellt husdjup i världsmått (px). Styr hur mycket taken reser sig. */
const HALF_DEPTH = 125

/** Taklutningar i grader per takval. */
export const TAK_LUTNING = {
  s5: 5,
  s7: 7,
  s20: 20,
  s27: 27,
  valmat: 22,
  runt: 0,
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const round = (n) => Math.round(n * 10) / 10
const p = (x, y) => `${round(x)},${round(y)}`

/** Justerar en hex-färg i ljushet. f > 1 ljusare, f < 1 mörkare. */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    clamp(Math.round(f <= 1 ? v * f : v + (255 - v) * (f - 1)), 0, 255),
  )
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function rise(takId) {
  return Math.tan(((TAK_LUTNING[takId] ?? 20) * Math.PI) / 180) * HALF_DEPTH
}

/**
 * Ritar stationen.
 * @param {object} c Konfiguration, se state.ritConfig().
 */
export function stationSVG(c) {
  const fack = clamp(c.fack ?? 3, 0, 10)
  const trafo = clamp(c.trafo ?? 1, 0, 2)

  /* Luckor: en per HSP-fack, en per transformator, manöver/LSP, RLS, IT. */
  const luckor = fack + trafo + (fack > 0 ? 1 : 0) + (c.rls ? 1 : 0) + (c.itFack ? 1 : 0)
  const doorCount = Math.max(2, luckor)

  const bw = clamp(240 + doorCount * 58, 300, 700)
  const x0 = (W - bw - DX) / 2 + 8
  const baseY = GROUND_Y - FUND_H
  const topY = baseY - BODY_H

  const vagg = c.kulorVagg ?? '#6e6e6e'
  const tak = c.kulorTak ?? vagg
  const fund = c.kulorFundament ?? '#9aa0a4'

  const geo = { x0, bw, topY, baseY, R: x0 + bw }

  return `
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="${beskrivning(c, fack, trafo)}">
  <defs>${defs(c)}</defs>

  <g id="mark">${mark(geo)}</g>
  <g id="fundament">${fundament(geo, fund)}</g>
  <g id="stomme">${stomme(geo, vagg)}</g>
  <g id="fasad" aria-hidden="true">${fasad(geo, c)}</g>
  <g id="luckor">${doors(geo, doorCount, fack, trafo, c, vagg)}</g>
  <g id="tak">${roof(geo, c.tak ?? 's20', tak, vagg)}</g>
  <g id="detaljer">${detaljer(geo, c, vagg)}</g>
</svg>`.trim()
}

/* --- Definitioner ------------------------------------------------------------- */

function defs(c) {
  const panel = c.panel ?? 'plat'
  const linje = 'rgb(0 0 0 / 0.20)'
  const ljus = 'rgb(255 255 255 / 0.10)'

  const patterns = {
    plat: (id, w) => `
      <pattern id="${id}" width="${w}" height="12" patternUnits="userSpaceOnUse">
        <line x1="2.5" y1="0" x2="2.5" y2="12" stroke="${linje}" stroke-width="1.1" />
        <line x1="4.2" y1="0" x2="4.2" y2="12" stroke="${ljus}" stroke-width="1.6" />
      </pattern>`,
    'tra-liggande': (id) => `
      <pattern id="${id}" width="12" height="14" patternUnits="userSpaceOnUse">
        <line x1="0" y1="1" x2="12" y2="1" stroke="rgb(0 0 0 / 0.26)" stroke-width="1.6" />
        <line x1="0" y1="3.4" x2="12" y2="3.4" stroke="${ljus}" stroke-width="1.8" />
      </pattern>`,
    'tra-staende': (id, w) => `
      <pattern id="${id}" width="${w + 4}" height="12" patternUnits="userSpaceOnUse">
        <rect x="0" width="3.5" height="12" fill="rgb(255 255 255 / 0.07)" />
        <line x1="4" y1="0" x2="4" y2="12" stroke="rgb(0 0 0 / 0.28)" stroke-width="1.6" />
        <line x1="${w + 3.4}" y1="0" x2="${w + 3.4}" y2="12" stroke="${linje}" stroke-width="1" />
      </pattern>`,
    rockpanel: (id) => `
      <pattern id="${id}" width="64" height="34" patternUnits="userSpaceOnUse">
        <rect width="64" height="34" fill="rgb(255 255 255 / 0.02)" />
        <line x1="0" y1="0.6" x2="64" y2="0.6" stroke="rgb(0 0 0 / 0.22)" stroke-width="1.2" />
        <line x1="0.6" y1="0" x2="0.6" y2="34" stroke="rgb(0 0 0 / 0.22)" stroke-width="1.2" />
      </pattern>`,
    koppar: (id, w) => `
      <pattern id="${id}" width="${w + 12}" height="26" patternUnits="userSpaceOnUse">
        <line x1="1" y1="0" x2="1" y2="26" stroke="rgb(0 0 0 / 0.28)" stroke-width="1.8" />
        <line x1="3.4" y1="0" x2="3.4" y2="26" stroke="rgb(255 255 255 / 0.20)" stroke-width="1.6" />
        <line x1="0" y1="0.5" x2="${w + 12}" y2="0.5" stroke="rgb(0 0 0 / 0.10)" stroke-width="1" />
      </pattern>`,
  }

  const make = patterns[panel] ?? patterns.plat
  return `
    ${make('panel-front', 15)}
    ${make('panel-sida', 10)}
    <pattern id="struktur" width="7" height="7" patternUnits="userSpaceOnUse">
      <circle cx="1.6" cy="1.8" r="0.55" fill="rgb(255 255 255 / 0.10)" />
      <circle cx="5" cy="4.6" r="0.5" fill="rgb(0 0 0 / 0.10)" />
    </pattern>

    <linearGradient id="vagg-ljus" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.07" />
      <stop offset="1" stop-color="#000" stop-opacity="0.09" />
    </linearGradient>
    <linearGradient id="tak-ljus" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.14" />
      <stop offset="1" stop-color="#000" stop-opacity="0.05" />
    </linearGradient>
    <linearGradient id="eave-ao" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.26" />
      <stop offset="1" stop-color="#000" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="lucka-ljus" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.10" />
      <stop offset="1" stop-color="#000" stop-opacity="0.13" />
    </linearGradient>
    <filter id="mjuk" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="7" />
    </filter>
    <!-- Tightare oskärpa så att skuggan behåller sin rätvinkliga form. -->
    <filter id="skugga" x="-25%" y="-60%" width="150%" height="220%">
      <feGaussianBlur stdDeviation="5" />
    </filter>`
}

/* --- Mark ---------------------------------------------------------------------- */

function mark({ x0, bw }) {
  /* Skuggan följer sockelns fotavtryck i stället för att vara en ellips: samma
     parallellogram som marken, något utvidgad och förskjuten åt höger eftersom
     ljuset kommer från vänster. */
  const E = 14 /* skuggan kryper utanför sockeln */
  const OX = 20 /* förskjutning i ljusets riktning */
  const OY = 8
  const L = x0 - 8 - E + OX
  const R = x0 + bw + 8 + E + OX
  const y = GROUND_Y + OY

  return `
    <polygon points="${p(L, y)} ${p(L + DX, y - DY)} ${p(R + DX, y - DY)} ${p(R, y)}"
             fill="rgb(14 26 36 / 0.26)" filter="url(#skugga)" />
    <line x1="60" y1="${GROUND_Y + 14}" x2="${W - 60}" y2="${GROUND_Y + 14}"
          stroke="currentColor" stroke-opacity="0.14" stroke-width="1.2" />`
}

/* --- Fundament ------------------------------------------------------------------ */

function fundament({ x0, bw, baseY }, fill) {
  const E = 8 /* fundamentet skjuter ut utanför väggliv */
  const L = x0 - E
  const R = x0 + bw + E
  return `
    <!-- Ovansida: sockelns synliga avsats. Utan den uppstår ett omålat band
         mellan väggens underkant och fundamentets sidoyta, eftersom sidoytan
         ligger E pixlar längre ut och därmed lägre i axonometrin.
         Ritas före väggarna, så bara utsprånget blir synligt. -->
    <polygon points="${p(L, baseY)} ${p(L + DX, baseY - DY)} ${p(R + DX, baseY - DY)} ${p(R, baseY)}"
             fill="${shade(fill, 1.14)}" />
    <polygon points="${p(R, baseY)} ${p(R + DX, baseY - DY)} ${p(R + DX, baseY - DY + FUND_H)} ${p(R, baseY + FUND_H)}"
             fill="${shade(fill, 0.68)}" />
    <rect x="${round(L)}" y="${round(baseY)}" width="${round(R - L)}" height="${FUND_H}" fill="${fill}" />
    <line x1="${round(L)}" y1="${round(baseY + 1)}" x2="${round(R)}" y2="${round(baseY + 1)}"
          stroke="rgb(255 255 255 / 0.28)" stroke-width="1.4" />
    <rect x="${round(L)}" y="${round(baseY + FUND_H - 2)}" width="${round(R - L)}" height="2"
          fill="rgb(0 0 0 / 0.22)" />`
}

/* --- Stomme --------------------------------------------------------------------- */

function stomme({ x0, bw, topY, baseY, R }, vagg) {
  return `
    <!-- Gavelsida (kortsida, bortvänd från ljuset) -->
    <polygon points="${p(R, topY)} ${p(R + DX, topY - DY)} ${p(R + DX, baseY - DY)} ${p(R, baseY)}"
             fill="${shade(vagg, 0.76)}" />
    <!-- Dörrfasad -->
    <rect x="${round(x0)}" y="${round(topY)}" width="${round(bw)}" height="${BODY_H}" fill="${vagg}" />`
}

function fasad({ x0, bw, topY, baseY, R }, c) {
  const sida = `${p(R, topY)} ${p(R + DX, topY - DY)} ${p(R + DX, baseY - DY)} ${p(R, baseY)}`
  return `
    <polygon points="${sida}" fill="url(#panel-sida)" opacity="0.8" />
    <rect x="${round(x0)}" y="${round(topY)}" width="${round(bw)}" height="${BODY_H}" fill="url(#panel-front)" />
    ${c.struktur ? `<rect x="${round(x0)}" y="${round(topY)}" width="${round(bw)}" height="${BODY_H}" fill="url(#struktur)" />` : ''}
    <rect x="${round(x0)}" y="${round(topY)}" width="${round(bw)}" height="${BODY_H}" fill="url(#vagg-ljus)" />
    <!-- Hörnprofiler -->
    <rect x="${round(x0)}" y="${round(topY)}" width="3" height="${BODY_H}" fill="rgb(255 255 255 / 0.10)" />
    <rect x="${round(R - 3)}" y="${round(topY)}" width="3" height="${BODY_H}" fill="rgb(0 0 0 / 0.16)" />`
}

/* --- Tak ------------------------------------------------------------------------- */

function roof({ x0, bw, topY, R }, typ, kulor, vagg) {
  const eaveY = topY - 3
  const FL = [x0 - OV, eaveY]
  const FR = [R + OV, eaveY]
  const h = rise(typ)

  const vinkel = TAK_LUTNING[typ] ?? 20
  const framLjus = shade(kulor, clamp(1.16 - vinkel / 90, 0.98, 1.16))
  const bakMork = shade(kulor, 0.6)
  const kant = shade(kulor, 0.55)
  const tjock = 6

  /* Främre takfot, vertikalt band under takplanet. */
  const fascia = `
    <rect x="${round(FL[0])}" y="${round(eaveY)}" width="${round(FR[0] - FL[0])}" height="${tjock}"
          fill="${shade(kulor, 0.7)}" />
    <line x1="${round(FL[0])}" y1="${round(eaveY + tjock)}" x2="${round(FR[0])}" y2="${round(eaveY + tjock)}"
          stroke="rgb(0 0 0 / 0.3)" stroke-width="1" />`

  if (typ === 'runt') {
    /* Välvt tak: plåten böjer sig från främre till bakre takfot över hela
       huslängden. Silhuetten är därför en mjuk horisontell linje längs nocken
       och hela bågen syns bara på gaveln, som på en riktig bågtaksstation. */
    const ov = 6 /* bågplåten går nästan kant i kant med väggen */
    const hArc = 40
    const FLb = [x0 - ov, eaveY]
    const FRb = [R + ov, eaveY]
    /* Silhuettlinjen: cylinderns hjässa, parallell med fasaden. */
    const TL = [FLb[0] + DX / 2, eaveY - DY / 2 - hArc]
    const TR = [FRb[0] + DX / 2, eaveY - DY / 2 - hArc]
    /* Ändkurvorna följer gavelbågen. */
    const cL = [FLb[0] + DX * 0.13, eaveY - DY * 0.13 - hArc * 0.85]
    const cR = [FRb[0] + DX * 0.13, eaveY - DY * 0.13 - hArc * 0.85]
    const yta = `M ${p(...FLb)} L ${p(...FRb)} Q ${p(...cR)} ${p(...TR)} L ${p(...TL)} Q ${p(...cL)} ${p(...FLb)} Z`

    return `
      <!-- Gavelbåge (cylinderns ändyta). Utgår från topY, inte eaveY, så att
           bågen möter väggen exakt och det inte uppstår en glipa mot gaveln. -->
      <path d="M ${p(R, topY + 1)} Q ${p(R + DX / 2, topY - DY / 2 - hArc * 2)} ${p(R + DX, topY - DY + 1)} L ${p(R, topY + 1)} Z"
            fill="${shade(kulor, 0.68)}" />
      <!-- Böjd plåtyta -->
      <path d="${yta}" fill="${framLjus}" />
      <path d="${yta}" fill="url(#tak-ljus)" />
      <!-- Ljusreflex längs hjässan -->
      <line x1="${round(TL[0] + 8)}" y1="${round(TL[1] + 1.5)}" x2="${round(TR[0] - 8)}" y2="${round(TR[1] + 1.5)}"
            stroke="rgb(255 255 255 / 0.22)" stroke-width="2.5" stroke-linecap="round" />
      <!-- Takfot -->
      <rect x="${round(FLb[0])}" y="${round(eaveY)}" width="${round(FRb[0] - FLb[0])}" height="5"
            fill="${shade(kulor, 0.7)}" />
      <line x1="${round(FLb[0])}" y1="${round(eaveY + 5)}" x2="${round(FRb[0])}" y2="${round(eaveY + 5)}"
            stroke="rgb(0 0 0 / 0.3)" stroke-width="1" />`
  }

  if (typ === 'valmat') {
    /* Valmat: nocken förkortad, alla fyra sidor lutar. */
    const inset = clamp(bw * 0.16, 34, 90)
    const RL = [FL[0] + DX / 2 + inset, eaveY - DY / 2 - h]
    const RR = [FR[0] + DX / 2 - inset, eaveY - DY / 2 - h]
    const BR = [FR[0] + DX, eaveY - DY]
    return `
      <!-- Höger valmfall -->
      <polygon points="${p(...FR)} ${p(...BR)} ${p(...RR)}" fill="${shade(kulor, 0.78)}" />
      <!-- Främre takfall -->
      <polygon points="${p(...FL)} ${p(...FR)} ${p(...RR)} ${p(...RL)}" fill="${framLjus}" />
      <polygon points="${p(...FL)} ${p(...FR)} ${p(...RR)} ${p(...RL)}" fill="url(#tak-ljus)" />
      <!-- Nock -->
      <line x1="${round(RL[0])}" y1="${round(RL[1])}" x2="${round(RR[0])}" y2="${round(RR[1])}"
            stroke="${kant}" stroke-width="2.4" stroke-linecap="round" />
      <!-- Grater mot båda valmen -->
      <line x1="${round(RR[0])}" y1="${round(RR[1])}" x2="${round(FR[0])}" y2="${round(FR[1])}"
            stroke="${kant}" stroke-width="1.6" />
      <line x1="${round(RL[0])}" y1="${round(RL[1])}" x2="${round(FL[0])}" y2="${round(FL[1])}"
            stroke="${kant}" stroke-width="1.6" />
      ${fascia}`
  }

  /* Sadeltak: nocken parallell med fasaden, gaveln på kortsidan. */
  const RL = [FL[0] + DX / 2, eaveY - DY / 2 - h]
  const RR = [FR[0] + DX / 2, eaveY - DY / 2 - h]
  const BL = [FL[0] + DX, eaveY - DY]
  const BR = [FR[0] + DX, eaveY - DY]

  /* Bortre takfall syns som en smal remsa vid flacka tak. */
  const bakre =
    h < DY / 2 - 4
      ? `<polygon points="${p(...RL)} ${p(...RR)} ${p(...BR)} ${p(...BL)}" fill="${bakMork}" />`
      : ''

  return `
    <!-- Gaveltriangel på kortsidan, i väggens material -->
    <polygon points="${p(R, topY)} ${p(R + DX, topY - DY)} ${p(R + DX / 2, topY - DY / 2 - h + 2)}"
             fill="${shade(vagg, 0.76)}" />
    ${bakre}
    <!-- Främre takfall -->
    <polygon points="${p(...FL)} ${p(...FR)} ${p(...RR)} ${p(...RL)}" fill="${framLjus}" />
    <polygon points="${p(...FL)} ${p(...FR)} ${p(...RR)} ${p(...RL)}" fill="url(#tak-ljus)" />
    <!-- Nock och vindskivor på båda gavlarna -->
    <line x1="${round(RL[0])}" y1="${round(RL[1])}" x2="${round(RR[0])}" y2="${round(RR[1])}"
          stroke="${kant}" stroke-width="2.4" stroke-linecap="round" />
    <line x1="${round(FR[0])}" y1="${round(FR[1])}" x2="${round(RR[0])}" y2="${round(RR[1])}"
          stroke="${kant}" stroke-width="1.8" />
    <line x1="${round(FL[0])}" y1="${round(FL[1])}" x2="${round(RL[0])}" y2="${round(RL[1])}"
          stroke="${kant}" stroke-width="1.8" />
    ${fascia}`
}

/* --- Luckor ---------------------------------------------------------------------- */

function doors({ x0, bw, topY, baseY }, doorCount, fack, trafo, c, vagg) {
  const pad = 18
  const gap = 6
  const top = topY + 16
  const h = BODY_H - 16 - 14
  const usable = bw - pad * 2 - gap * (doorCount - 1)
  const dw = usable / doorCount

  /* Ordning: HSP-fack, transformator(er), manöver/LSP, RLS, IT. */
  const typer = []
  for (let i = 0; i < fack; i++) typer.push('hsp')
  for (let i = 0; i < trafo; i++) typer.push('trafo')
  if (fack > 0) typer.push('lsp')
  if (c.rls) typer.push('rls')
  if (c.itFack) typer.push('it')
  while (typer.length < doorCount) typer.push('trafo')

  const dorr = shade(vagg, 1.05)
  const ram = 'rgb(0 0 0 / 0.30)'

  return typer
    .slice(0, doorCount)
    .map((typ, i) => {
      const x = x0 + pad + i * (dw + gap)
      const cx = x + dw / 2
      return `
      <g class="lucka" data-typ="${typ}">
        <!-- Karm -->
        <rect x="${round(x - 1.5)}" y="${round(top - 1.5)}" width="${round(dw + 3)}" height="${round(h + 3)}" rx="2"
              fill="none" stroke="${ram}" stroke-width="1.2" />
        <!-- Dörrblad -->
        <rect x="${round(x)}" y="${round(top)}" width="${round(dw)}" height="${round(h)}" rx="1.5"
              fill="${dorr}" />
        <rect x="${round(x)}" y="${round(top)}" width="${round(dw)}" height="${round(h)}" rx="1.5"
              fill="url(#lucka-ljus)" />
        <!-- Försänkt spegel -->
        <rect x="${round(x + 4)}" y="${round(top + 4)}" width="${round(dw - 8)}" height="${round(h - 8)}" rx="1"
              fill="none" stroke="rgb(0 0 0 / 0.14)" stroke-width="1.1" />
        <!-- Handtag -->
        <rect x="${round(x + dw - 8.5)}" y="${round(top + h / 2 - 10)}" width="3" height="20" rx="1.5"
              fill="rgb(0 0 0 / 0.5)" />
        <rect x="${round(x + dw - 8)}" y="${round(top + h / 2 - 9.5)}" width="1" height="19"
              fill="rgb(255 255 255 / 0.25)" />
        ${typ === 'hsp' || typ === 'trafo' ? varning(cx, top + 10) : ''}
        ${typ === 'trafo' ? louvre(cx, top + h - 44, dw * 0.6) : ''}
        ${c.ventilation && typ === 'lsp' ? louvre(cx, top + h - 44, dw * 0.6) : ''}
      </g>`
    })
    .join('')
}

/** Varningsskylt, liten gul plåt med blixt. */
function varning(cx, y) {
  return `
    <rect x="${round(cx - 5)}" y="${round(y)}" width="10" height="12" rx="1"
          fill="#f2c744" stroke="rgb(0 0 0 / 0.35)" stroke-width="0.8" />
    <path d="M ${p(cx + 0.8, y + 2.5)} L ${p(cx - 2.2, y + 6.8)} L ${p(cx - 0.3, y + 6.8)}
             L ${p(cx - 1.6, y + 9.8)} L ${p(cx + 2.2, y + 5.4)} L ${p(cx + 0.3, y + 5.4)} Z"
          fill="rgb(0 0 0 / 0.82)" />`
}

/** Ventilationsgaller med lameller i försänkt ram. */
function louvre(cx, y, w) {
  const x = cx - w / 2
  const rows = [0, 1, 2, 3, 4]
  return `
    <rect x="${round(x - 2)}" y="${round(y - 3)}" width="${round(w + 4)}" height="32" rx="1.5"
          fill="rgb(0 0 0 / 0.10)" stroke="rgb(0 0 0 / 0.22)" stroke-width="1" />
    ${rows
      .map(
        (k) => `
      <line x1="${round(x)}" y1="${round(y + k * 6)}" x2="${round(x + w)}" y2="${round(y + k * 6)}"
            stroke="rgb(0 0 0 / 0.38)" stroke-width="2.2" stroke-linecap="round" />
      <line x1="${round(x)}" y1="${round(y + k * 6 + 1.8)}" x2="${round(x + w)}" y2="${round(y + k * 6 + 1.8)}"
            stroke="rgb(255 255 255 / 0.12)" stroke-width="1" />`,
      )
      .join('')}`
}

/* --- Detaljer --------------------------------------------------------------------- */

function detaljer({ x0, bw, topY, baseY }, c, vagg) {
  let ut = ''

  /* Skuggning under takfoten ger taket tyngd. */
  ut += `<rect x="${round(x0)}" y="${round(topY)}" width="${round(bw)}" height="13" fill="url(#eave-ao)" />`

  /* Sockelskugga mot fundamentet. */
  ut += `<rect x="${round(x0)}" y="${round(baseY - 6)}" width="${round(bw)}" height="6" fill="rgb(0 0 0 / 0.15)" />`

  /* Typskylt. */
  ut += `
    <rect x="${round(x0 + 9)}" y="${round(topY + 20)}" width="24" height="8" rx="1"
          fill="rgb(255 255 255 / 0.8)" stroke="rgb(0 0 0 / 0.2)" stroke-width="0.6" />
    <line x1="${round(x0 + 12)}" y1="${round(topY + 23)}" x2="${round(x0 + 30)}" y2="${round(topY + 23)}"
          stroke="rgb(0 0 0 / 0.35)" stroke-width="1" />
    <line x1="${round(x0 + 12)}" y1="${round(topY + 25.5)}" x2="${round(x0 + 26)}" y2="${round(topY + 25.5)}"
          stroke="rgb(0 0 0 / 0.25)" stroke-width="1" />`

  /* Väggventil på gaveln vid ventilationstillval. */
  if (c.ventilation) {
    const gx = x0 + bw + DX * 0.4
    const gy = topY - DY * 0.4 + 26
    ut += `
      <g opacity="0.85">
        <rect x="${round(gx - 10)}" y="${round(gy)}" width="22" height="16" rx="1.5"
              fill="rgb(0 0 0 / 0.14)" stroke="rgb(0 0 0 / 0.28)" stroke-width="1" />
        ${[0, 1, 2]
          .map(
            (k) =>
              `<line x1="${round(gx - 7)}" y1="${round(gy + 4 + k * 4)}" x2="${round(gx + 9)}" y2="${round(gy + 4 + k * 4)}"
                     stroke="rgb(0 0 0 / 0.4)" stroke-width="1.6" />`,
          )
          .join('')}
      </g>`
  }

  return ut
}

/* --- Textalternativ ----------------------------------------------------------------- */

const TAK_NAMN = {
  s5: 'sadeltak 5 grader',
  s7: 'sadeltak 7 grader',
  s20: 'sadeltak 20 grader',
  s27: 'sadeltak 27 grader',
  valmat: 'valmat tak',
  runt: 'runt tak',
}

const PANEL_NAMN = {
  plat: 'plåtpanel',
  'tra-liggande': 'liggande träpanel',
  'tra-staende': 'stående träpanel',
  rockpanel: 'Rockpanel',
  koppar: 'kopparbeklädnad',
}

function beskrivning(c, fack, trafo) {
  const stallverk = fack > 0 ? `med ${fack} högspänningsfack` : 'utan högspänningsställverk'
  const transformator =
    trafo > 0 ? ` och ${trafo} transformator${trafo > 1 ? 'er' : ''}` : ''
  const tak = TAK_NAMN[c.tak ?? 's20']

  return `Nätstation ${stallverk}${transformator}. ${tak[0].toUpperCase()}${tak.slice(1)}, ${
    PANEL_NAMN[c.panel ?? 'plat']
  }.`
}

export { TAK_NAMN, PANEL_NAMN }
