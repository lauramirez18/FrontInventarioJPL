import Axios from 'axios';

const token = JSON.parse(localStorage.getItem('auth')); 
if (token) {
    console.log("Token encontrado:", token);
} else {
    console.log("Token no encontrado en localStorage");
    
} 

console.log("mitoken",token);


const apiClient = Axios.create({
    baseURL: 'http://localhost:2999/api', 
  /*   baseURL: 'https://inventariojpl.onrender.com/api', */
    headers: {
        "x-token": token.token,
    }
});

export default apiClient;