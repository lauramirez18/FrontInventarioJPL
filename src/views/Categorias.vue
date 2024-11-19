<template>
    <q-page padding>
        <h4 class="text-center  text-weight-bold">Categorias</h4>
        <hr>
        <q-table class="tabla-clientes" :rows="rows" :columns="columns" row-key="name">

            <template v-slot:header="props">
                <tr>
                    <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
                        <span>{{ col.label }}</span>
                    </th>
                </tr>
            </template>

            <template v-slot:body-cell-categoria="props">
  <q-td :props="props" class="q-pa-sm">
    <span>{{ props.row.categoria.nombre }}</span>
  </q-td>
</template>

            <template v-slot:body-cell-estado="props">
                <q-td :props="props" class="q-pa-sm">
                    <span style="color: green;" v-if="props.row.estado == 1">Activo</span>
                    <span style="color: red;" v-else>Inactivo</span>
                </q-td>
            </template>

            <template v-slot:body-cell-opciones="props">
                <q-td :props="props" class="tabla-cell opciones">
                    <q-btn icon="edit" color="primary" flat @click="editarProveedor(props.row)" class="q-mr-sm" />

                    <q-btn :icon="props.row.estado === 1 ? 'remove_circle' : 'check_circle'" color="negative" flat
                        @click="mostrarModalConfirmacion(props.row)" />
                </q-td>
            </template>
        </q-table>
        <q-dialog v-model="modalConfirmarEstado">
            <q-card>
                <q-card-section>
                    <div class="text-h6">¿Estás seguro de cambiar el estado?</div>
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cancelarCambioEstado" />
                    <q-btn label="Confirmar" color="primary" flat @click="confirmarCambioEstado" />
                </q-card-actions>
            </q-card>
        </q-dialog>


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
        name: "descripcion",
        align: "center",
        label: "descripcion",
        field: "descripcion",
        sortable: true,
        
    },
    {
        name: "estado",
        align: "center",
        label: "Estado",
        field: "estado",
        sortable: true,
        style: "font-weight: bold;",
    },
    {
        name: "opciones",
        align: "center",
        label: "Opciones",
        field: "opciones",
        sortable: true,
    },
])

onMounted(async () => {
    await getDataFromApi()
})


const rows = ref([]);
const modalConfirmarEstado = ref(false); 
const usuarioSeleccionado = ref(null);
const authStore = useAuthStore()

async function getDataFromApi() {
    const token = authStore.getToken();
    console.log("toke recuperado del store", token)
    if (!token) {
        console.log('Token no encontrado')
        return
    }

    try {
        const response = await getData('categorias')
        if (response && Array.isArray(response)) {
            console.log('response', response)
            rows.value = response
        } else {
            console.log('La respuesta no contiene los datos esperados')
        }
    } catch (error) {
        console.log('Error al obtener los datos:', error.response ? error.response.data : error)
    }
}

const mostrarModalConfirmacion = (usuario) => {
    usuarioSeleccionado.value = usuario; 
    modalConfirmarEstado.value = true;      
};



</script>

<style scoped>
.tabla-clientes {
    margin: 30px auto;
    max-width: 1200px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tabla-header {
    font-weight: bold;
    text-transform: uppercase;
    background-color: rgb(2, 21, 38);
    color: white;
    padding: 12px;
    text-align: center;
}


.tabla-cell.opciones button {
    padding: 5px 10px;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 4px;
}
</style>
    
