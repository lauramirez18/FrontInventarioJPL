<template>
    <q-page padding>
        <h4 class="text-center  text-weight-bold" >Clientes</h4>
        <hr>
        <q-table
        class="tabla-clientes"
        :rows="rows"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="[5, 10, 15, 20]"
        :pagination="pagination"
      >
       
        <template v-slot:header="props">
          <tr>
            <th
              v-for="col in props.cols"
              :key="col.name"
              :style="getHeaderStyle(col)"
              :class="['custom-header', col.name]"
            >
              <span>{{ col.label }}</span>
            </th>
          </tr>
        </template>
  
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <span :style="getCellStyle(col, props.row)">
                {{ props.row[col.field] }}
              </span>
            </q-td>
          </q-tr>
        </template>
      </q-table>

    </q-page>
      
      
    
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getData } from '../services/apiClient.js'
  import { useAuthStore } from '../store/useAuth.js'
  
  const columns = ref([
    {
      name: "nombre",
      align: "center",
      label: "Nombre",
      field: "nombre",
      sortable: true,
      style: "font-weight: bold;",
    },
    {
      name: "identificacion",
      align: "center",
      label: "Identificación",
      field: "identificacion",
      sortable: true,
    },
    {
      name: "direccion",
      align: "center",
      label: "Dirección",
      field: "direccion",
      sortable: true,
    },
    {
      name: "telefono",
      align: "center",
      label: "Teléfono",
      field: "telefono",
      sortable: true,
    },
    {
      name: "email",
      align: "center",
      label: "Email",
      field: "email",
      sortable: true,
     
    },
    {
      name: "estado",
      align: "center",
      label: "Estado",
      field: "estado",
      sortable: true,
    },
    {
      name: "acciones",
      align: "center",
      label: "Acciones",
      field: "acciones",
      sortable: true,
    },
  ])
  
  const rows = ref([]);

  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  });

  const authStore = useAuthStore()
  
  async function getDataFromApi() {
    const token = authStore.getToken();
    console.log("toke recuperado del store", token)
    if (!token) {
      console.log('Token no encontrado')
      return
    }
  
    try {
      const response = await getData('terceros/clientes')
      if (response && Array.isArray(response)) {
        rows.value = response
        pagination.value.rowsNumber = response.length
      } else {
        console.log('La respuesta no contiene los datos esperados')
      }
    } catch (error) {
      console.log('Error al obtener los datos:', error.response ? error.response.data : error)
    }
  }
  
  onMounted(async () => {
    await getDataFromApi()
  })
  
  function getHeaderStyle(col) {
    return {
      fontWeight: 'bold', 
      textTransform: 'uppercase', 
      backgroundColor: 'rgb(2, 21, 38)', 
      color: 'white', 
      padding: '12px',
    }
  }
  
  function getCellStyle(col, row) {
    return {}
  }
  </script>
  
  <style scoped>
  
 
  .tabla-clientes {
    margin: 30px auto;
    max-width: 1200px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  
  
  </style>
  