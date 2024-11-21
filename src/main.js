import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import { router } from './router/routes'
import {createPinia} from 'pinia'
import  piniaPluginPersistedstate  from 'pinia-plugin-persistedstate'
import { Notify } from 'quasar'

const pinia = createPinia()


const app = createApp(App)
app.use(Quasar, {
    plugins: {
      Notify
    },
    config: {
      notify: {
        timeout: 3000,
        position: 'top',
        textColor: 'white',
        actions: [{ icon: 'close', color: 'white' }]
      }
    }
  })


app.use(router)
app.mount('#app')
app.use(pinia)
pinia.use(piniaPluginPersistedstate)
