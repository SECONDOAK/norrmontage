import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  /* Relativ bas gör bygget platsoberoende: det fungerar i domänroten, under
     en underkatalog (secondoak.se/norrmontage) och lokalt från filsystemet. */
  base: './',
  server: { port: 5180 },
  build: {
    rollupOptions: {
      input: {
        start: resolve(__dirname, 'index.html'),
        sortiment: resolve(__dirname, 'sortiment.html'),
        modell: resolve(__dirname, 'modell.html'),
        stationsbyggaren: resolve(__dirname, 'stationsbyggaren.html'),
        referenser: resolve(__dirname, 'referenser.html'),
        omOss: resolve(__dirname, 'om-oss.html'),
        underlag: resolve(__dirname, 'underlag.html'),
        kontakt: resolve(__dirname, 'kontakt.html'),
      },
    },
  },
})
