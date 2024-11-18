import {defineStore} from 'pinia'
import {ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const token = ref('')
    const user = ref('')
   

    function setToken(newtoken) {
        if (newtoken) {
            token.value = newtoken
        }else {
              console.log('No esta llegando el token')
            }
        }

        function getToken() {
            return token.value;
        }

        return {
            token,
            user,
            setToken,
            getToken
        }
},
{
    persist: true
})