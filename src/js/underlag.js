/* Underlag & dokument. Dokumentlistan följer shop.norrmontage.se/page/underlag. */

import '../styles/underlag.css'
import { KULORER } from './configurator/options.js'

const HANDHAVANDE = [
  { namn: 'Handhavandebeskrivning generell', gäller: 'Samtliga nätstationer' },
  { namn: 'Handhavande ZN22', gäller: 'Nätstationer 50–315 kVA' },
  { namn: 'Handhavande ZN22-SS2', gäller: 'Seriesatellitstationer' },
  { namn: 'Handhavande ZT19 ZF19', gäller: 'Nätstationer 500–2000 kVA och kopplingsstationer' },
  { namn: 'Handhavande Z28-RMU ZN22-RMU', gäller: 'RMU-stationer' },
  { namn: 'Handhavande trafomontage Z28-RMU ZN22-RMU', gäller: 'Transformatormontage, RMU' },
  { namn: 'Handhavande trafomontage ZT19', gäller: 'Transformatormontage, ZT19' },
]

const OVRIGT = [
  { namn: 'Standardkulörer', gäller: 'De fyra standardkulörerna med NCS-koder' },
  { namn: 'Grundläggning instruktion', gäller: 'Fundament och förankring' },
]

const rad = (d) => `
  <li>
    <span class="dokument__ikon" aria-hidden="true">PDF</span>
    <span class="dokument__text">
      <strong>${d.namn}</strong>
      <span>${d.gäller}</span>
    </span>
    <span class="dokument__hamta" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
      </svg>
    </span>
  </li>`

document.getElementById('handhavande').innerHTML = HANDHAVANDE.map(rad).join('')
document.getElementById('ovrigt').innerHTML = OVRIGT.map(rad).join('')

document.getElementById('kulorlista').innerHTML = KULORER.map(
  (k) => `
  <li>
    <span class="kulorpanel__prov" style="--prov:${k.hex}"></span>
    <span>
      <strong>${k.namn}</strong>
      <span class="mono">${k.ncs}</span>
    </span>
  </li>`,
).join('')
