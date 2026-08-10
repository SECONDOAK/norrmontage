/* Gemensam entry: fonter, stilar och sidlogik. */

import '@fontsource-variable/archivo'
import '@fontsource-variable/inter'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'

import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'

import { mountChrome } from './js/chrome.js'
import { initSite } from './js/site.js'

mountChrome()
initSite()
