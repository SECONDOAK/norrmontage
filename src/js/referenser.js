/* Referensgalleri. Bildtexterna är Norrmontages egna, från bildbanken. */

import '../styles/referenser.css'

const BILDER = [
  {
    fil: 'ss2-fjallvy',
    titel: 'SS2 på kalfjället',
    text: 'Gjutet betongfundament och extra förankring. Där vindlasten kräver det.',
    taggar: ['SS2', 'Plåtpanel', 'Svart'],
    stor: true,
  },
  {
    fil: 'ss2-falurod',
    titel: 'SS2 med träpanel och tegelimitationsplåt',
    text: '20° sadeltak, målad i falu ljusröd. Fotograferad i fabriken före leverans.',
    taggar: ['SS2', 'Träpanel', 'Sadeltak 20°'],
  },
  {
    fil: 'koppar-valmat',
    titel: 'Kopparbeklädnad och valmat sadeltak',
    text: 'När stationen ska stå i en kulturhistoriskt känslig miljö.',
    taggar: ['Koppar', 'Valmat tak'],
  },
  {
    fil: 'zt19-ribbpanel',
    titel: 'ZT19 med liggande ribbpanel',
    text: 'Träfasad på en station för upp till 2000 kVA.',
    taggar: ['ZT19', 'Träpanel liggande'],
    stor: true,
  },
  {
    fil: 'zt19-trapanel-svart',
    titel: 'ZT19, svart liggande ribbpanel',
    text: 'Samma familj, mörk kulör. Panelen bryter av mot plåtens raka linjer.',
    taggar: ['ZT19', 'Träpanel', 'Svart'],
  },
  {
    fil: 'zt19-rockpanel',
    titel: 'ZT19 med Rockpanel',
    text: 'Skivbeklädnad i stora format ger en helt annan skala på fasaden.',
    taggar: ['ZT19', 'Rockpanel'],
  },
  {
    fil: 'zt19-vinter',
    titel: 'ZT19-24/6-1',
    text: 'Sex högspänningsfack och en transformator. Grågrön, sadeltak.',
    taggar: ['ZT19', '6 HSP-fack', 'Grågrön'],
  },
  {
    fil: 'zt19-v3-1-gra',
    titel: 'ZT19-V3-1 i stadsmiljö',
    text: 'Tre luftisolerade HSP-fack och transformator upp till 1250 kVA.',
    taggar: ['ZT19', 'Valmat tak', 'Grå'],
    stor: true,
  },
  {
    fil: 'zn22-24-3-315',
    titel: 'ZN22-24/3-315',
    text: 'Generation 6 av ZN22. Manöver från separat fack.',
    taggar: ['ZN22', '3 HSP-fack', 'Röd'],
  },
  {
    fil: 'ss2-panel',
    titel: 'SS2 med panelfasad',
    text: 'Seriesatellitstation bestyckad upp till 200 kVA.',
    taggar: ['SS2', 'Träpanel'],
  },
]

document.getElementById('galleri').innerHTML = BILDER.map(
  (b) => `
  <figure class="ref ${b.stor ? 'ref--stor' : ''}">
    <img src="img/referens/${b.fil}.jpg" alt="${b.titel}" loading="lazy" />
    <figcaption>
      <h2>${b.titel}</h2>
      <p>${b.text}</p>
      <ul class="ref__taggar">${b.taggar.map((t) => `<li>${t}</li>`).join('')}</ul>
    </figcaption>
  </figure>`,
).join('')
