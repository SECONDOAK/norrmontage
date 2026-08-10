/* Kontaktsidan. Namn, roller och direktnummer enligt shop.norrmontage.se. */

import '../styles/kontakt.css'

const AVDELNINGAR = [
  {
    namn: 'Ledning',
    personer: [{ namn: 'Daniel Köbi', roll: 'VD' }],
  },
  {
    namn: 'Försäljning',
    personer: [
      { namn: 'Emil Svedenmark', roll: 'Försäljning', tel: '0647-10846' },
      { namn: 'Peter Jonsson', roll: 'Försäljning', tel: '0601-54110' },
      { namn: 'Joakim Simonsson', roll: 'Försäljning', tel: '0647-10814' },
      { namn: 'Axel Engströmer', roll: 'Försäljning', tel: '0647-10822' },
      { namn: 'Erik Norrman', roll: 'Försäljning E-mobility', tel: '0647-10851' },
    ],
  },
  {
    namn: 'Inköp',
    personer: [
      { namn: 'Elisabeth Linde', roll: 'Inköpschef', tel: '0647-10827' },
      { namn: 'Johan Garber', roll: 'Inköp', tel: '0647-10832' },
      { namn: 'Peter Komstadius', roll: 'Inköp / Logistik', tel: '0647-10838' },
    ],
  },
  {
    namn: 'Administration och transport',
    personer: [
      { namn: 'Annelie Paulsson', roll: 'Orderadministration', tel: '0647-10826' },
      { namn: 'Andreas Jonsson', roll: 'Transport', tel: '0647-10889' },
    ],
  },
]

/** Initialer som platshållare tills Norrmontage levererar porträttbilder. */
const initialer = (namn) =>
  namn
    .split(' ')
    .map((d) => d[0])
    .join('')
    .slice(0, 2)

const telLank = (tel) => `tel:${tel.replace(/[^0-9+]/g, '')}`

document.getElementById('team').innerHTML = AVDELNINGAR.map(
  (a) => `
  <section class="avdelning">
    <h3 class="avdelning__namn">${a.namn}</h3>
    <ul class="personer">
      ${a.personer
        .map(
          (person) => `
        <li class="person">
          <span class="person__portratt mono" aria-hidden="true">${initialer(person.namn)}</span>
          <span class="person__text">
            <strong>${person.namn}</strong>
            <span class="person__roll">${person.roll}</span>
            ${person.tel ? `<a class="person__tel mono" href="${telLank(person.tel)}">${person.tel}</a>` : ''}
          </span>
        </li>`,
        )
        .join('')}
    </ul>
  </section>`,
).join('')
