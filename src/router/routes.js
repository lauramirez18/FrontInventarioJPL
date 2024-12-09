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
        component: () => import('../views/Login.vue')
    
    },
      {
        path: 'terceros/clientes',
        name: 'clientes',
        component: () => import('../views/Clientes.vue')
      },
      {
          path: 'salidas',
          name: 'salidas',
          component: () => import('../views/Salidas.vue')
        },
        {
          path: 'entradas',
          name: 'entradas',
          component: () => import('../views/Entradas.vue')
        },
        {
            path: 'articulos',
            name: 'articulos',
            component: () => import('../views/Articulos.vue')
        },
        {
            path: 'categorias',
            name: 'categorias',
            component: () => import('../views/Categorias.vue')
        },
        {
            path: 'terceros/proveedores',
            name: 'proveedores',
            component: () => import('../views/Proveedores.vue')
        },
        {
            path: 'inicio',
            name: 'inicio',
            component: () => import('../views/Inicio.vue')
        },
        {
            path: 'usuarios',
            name: 'usuarios',
            component: () => import('../views/Usuarios.vue')
        },
    ]
  },
      
 
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})