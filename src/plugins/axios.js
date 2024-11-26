import Axios from 'axios';

const token = JSON.parse(localStorage.getItem('auth'));  

console.log("mitoken",token);


const apiClient = Axios.create({
    /* baseURL: 'http://localhost:2999/api', */
    baseURL: 'https://inventariojpl.onrender.com/api',
    headers: {
        "x-token": token.token
    }
});

export default apiClient;