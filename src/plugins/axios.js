import Axios from 'axios';

const token = JSON.parse(localStorage.getItem('auth'));  
 console.log(token.token);


const apiClient = Axios.create({
    /* baseURL: 'http://localhost:2999/api', */
    baseURL: 'https://inventario-jpl.onrender.com/api',
    headers: {
        "x-token": token.token
    }
});

export default apiClient;