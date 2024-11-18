import Articulos from '../views/Articulos.vue'
import Categorias from '../views/Categorias.vue'
import Proveedores from '../views/Proveedores.vue'
import Clientes from '../views/Clientes.vue'  
import Login from '../views/Login.vue'
import Inicio from '../views/Inicio.vue'
import Salidas from '../views/Salidas.vue'
import Entradas from '../views/Entradas.vue'
import Usuarios from '../views/Usuarios.vue'
import MainLayout from '../layouts/MainLayout.vue'

import { createRouter, createWebHistory } from 'vue-router'


const routes = [
   {
    path: '/',
    component: () => MainLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => Login
    
    },
      {
        path: '/terceros/clientes',
        name: 'clientes',
        component: () => Clientes
      },
      {
          path: 'salidas',
          name: 'salidas',
          component: () => Salidas
        },
        {
          path: 'entradas',
          name: 'entradas',
          component: () => Entradas
        },
        {
            path: 'articulos',
            name: 'articulos',
            component: () => Articulos
        },
        {
            path: 'categorias',
            name: 'categorias',
            component: () => Categorias
        },
        {
            path: '/terceros/proveedores',
            name: 'proveedores',
            component: () => Proveedores
        },
        {
            path: 'inicio',
            name: 'inicio',
            component: () => Inicio
        },
        {
            path: 'usuarios',
            name: 'usuarios',
            component: () => Usuarios
        },
    ]
  },
      
 
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})