/* Delat sidhuvud och sidfot.
   I en produktionssajt blir dessa två komponenter; här injiceras de så att
   markupen bara finns på ett ställe. */

/* Relativa sökvägar genomgående, så att bygget fungerar oavsett om det ligger
   i domänroten eller under en underkatalog. */
const NAV = [
  { href: 'sortiment.html', text: 'Sortiment' },
  { href: 'stationsbyggaren.html', text: 'Stationsbyggaren' },
  { href: 'referenser.html', text: 'Referenser' },
  { href: 'om-oss.html', text: 'Om oss' },
  { href: 'underlag.html', text: 'Underlag' },
  { href: 'kontakt.html', text: 'Kontakt' },
]

export function headerHTML() {
  const links = NAV.map((n) => `<li><a href="${n.href}">${n.text}</a></li>`).join('')

  return `
  <div class="container site-header__inner">
    <a class="site-header__logo" href="index.html" aria-label="Norrmontage, till startsidan">
      <img src="img/logo-nab.png" alt="Norrmontage AB" width="120" height="45" />
    </a>

    <nav class="site-nav" aria-label="Huvudmeny"><ul>${links}</ul></nav>

    <div class="site-header__actions">
      <a class="btn btn--dark btn--sm" href="https://shop.norrmontage.se/">Logga in i portalen</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobil-meny" aria-label="Meny">
        <svg class="nav-toggle__open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        <svg class="nav-toggle__close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  </div>

  <div class="mobile-nav container" id="mobil-meny" data-open="false">
    <ul>${links}</ul>
    <a class="btn btn--dark" href="https://shop.norrmontage.se/">Logga in i portalen</a>
  </div>`
}

export function footerHTML() {
  return `
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <div class="site-footer__logo">
          <img src="img/logo-nab.png" alt="Norrmontage AB" width="104" height="39" />
        </div>
        <p>Nätstationer för eldistribution i över 60 år.<br />Fabriksvägen 1, 837 32 Järpen</p>
      </div>
      <div>
        <h3>Sortiment</h3>
        <ul>
          <li><a href="sortiment.html?k=satellit">Satellitstationer</a></li>
          <li><a href="sortiment.html?k=natstation-315">Nätstationer 50–315 kVA</a></li>
          <li><a href="sortiment.html?k=natstation-2000">Nätstationer 500–2000 kVA</a></li>
          <li><a href="sortiment.html?k=kopplingsstation">Kopplingsstationer</a></li>
          <li><a href="sortiment.html?k=teknikhus">Teknikhus</a></li>
        </ul>
      </div>
      <div>
        <h3>Genvägar</h3>
        <ul>
          <li><a href="stationsbyggaren.html">Stationsbyggaren</a></li>
          <li><a href="referenser.html">Referenser &amp; inspiration</a></li>
          <li><a href="underlag.html">Underlag &amp; dokument</a></li>
          <li><a href="om-oss.html">Om Norrmontage</a></li>
          <li><a href="https://shop.norrmontage.se/page/jobb">Lediga tjänster</a></li>
        </ul>
      </div>
      <div>
        <h3>Kontakt</h3>
        <ul>
          <li><a href="tel:064710800">Växel 0647-10800</a></li>
          <li><a href="mailto:info@norrmontage.se">info@norrmontage.se</a></li>
          <li><a href="mailto:offert@norrmontage.se">offert@norrmontage.se</a></li>
          <li><a href="mailto:inkop@norrmontage.se">inkop@norrmontage.se</a></li>
          <li><a href="mailto:ekonomi@norrmontage.se">ekonomi@norrmontage.se</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <p>© ${new Date().getFullYear()} Norrmontage AB</p>
      <p><a href="https://shop.norrmontage.se/">Logga in i orderportalen</a></p>
    </div>
  </div>`
}

/** Fyller <header class="site-header"> och <footer class="site-footer"> om de är tomma. */
export function mountChrome() {
  const header = document.querySelector('.site-header')
  const footer = document.querySelector('.site-footer')
  if (header && !header.children.length) header.innerHTML = headerHTML()
  if (footer && !footer.children.length) footer.innerHTML = footerHTML()
}
