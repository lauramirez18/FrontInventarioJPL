<template>
    <q-page padding>
      <h4 class="text-center  text-weight-bold" >Inventario JPL</h4>
      <hr>
      <q-row class="q-col-gutter-md"> 
        <q-col
          v-for="(route, index) in routes"
          :key="index"
          cols="12" 
          sm="6" 
          md="4" 
          lg="3" 
          class="q-pa-md"
        >
          <q-card @click="goToRoute(route.path)" class="my-card">
            <q-card-section class="card-img">
              <q-img :src="route.image" alt="Imagen" :ratio="1" class="my-card-img" />
              <div class="text-h6 text-center q-mt-sm text-weight-bold">
                {{ route.name }}
              </div>
            </q-card-section>
          </q-card>
        </q-col>
      </q-row>
    </q-page>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const routes = [
  { name: 'Usuarios', path: '/usuarios', image: 'https://cdn-icons-png.freepik.com/512/11468/11468063.png' },
    { name: 'Clientes', path: '/terceros/clientes', image: 'https://cdn-icons-png.freepik.com/512/12155/12155222.png' },
    { name: 'Salidas', path: '/salidas', image: 'https://cdn-icons-png.freepik.com/512/12155/12155241.png' },
    { name: 'Entradas', path: '/entradas', image: 'https://cdn-icons-png.freepik.com/512/12154/12154947.png' },
    { name: 'Artículos', path: '/articulos', image: 'https://cdn-icons-png.freepik.com/512/12154/12154988.png' },
    { name: 'Categorías', path: '/categorias', image: 'https://cdn-icons-png.freepik.com/512/12154/12154936.png' },
    { name: 'Proveedores', path: '/terceros/proveedores', image: 'https://cdn-icons-png.freepik.com/512/12155/12155100.png' },
    
  ]
  
  const goToRoute = (path) => {
    router.push(path)
  }
  </script>
  
  <style scoped>
  
  .my-card {
    cursor: pointer;
    transition: transform 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.338);
  }

  .my-card:hover {
    transform: translateY(-5px);
  }
  .card-img {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 260px;
  }
  .my-card-img {
    max-width: 150px;
    width: 100%;
    height: auto;
    transition: transform 0.3s ease;
    justify-content: center;
  }
  .my-card-img:hover {
    transform: scale(1.05);
  }
  
  

  q-row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  </style>
  