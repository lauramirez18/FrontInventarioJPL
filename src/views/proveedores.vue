<template>
<q-page padding>
        <h4 class="text-center  text-weight-bold" >Proveedores</h4>
        <hr>
        <q-table class="tabla-proovedores" :rows="rows" :columns="columns" row-key="name"
      :rows-per-page-options="[5, 10, 15, 20]" :pagination="pagination">
      <template v-slot:header="props">
        <tr>
          <th v-for="col in props.cols" :key="col.name" class="tabla-header">
            <span>{{ col.label }}</span>
          </th>
        </tr>
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


    <q-dialog v-model="modalEditar">
      <q-card>
        <q-card-section>
          <div class="text-h6">Editar Proveedor</div>
        </q-card-section>

        <q-card-section>

          <q-input v-model="datosProveedor.nombre" label="Nombre" outlined dense />
          <q-input v-model="datosProveedor.identificacion" label="Identificación" outlined dense />
          <q-input v-model="datosProveedor.direccion" label="Dirección" outlined dense />
          <q-input v-model="datosProveedor.telefono" label="Teléfono" outlined dense />
          <q-input v-model="datosProveedor.email" label="Email" outlined dense />
        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancelar" color="secondary" flat @click="modalEditar = false" />
          <q-btn label="Guardar" color="primary" flat @click="guardarCambiosProveedor" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  
    </q-page>
    

    
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getData, putData } from '../services/apiClient.js';
import { useAuthStore } from '../store/useAuth.js';


const columns = ref([
  { name: 'nombre', align: 'center', label: 'Nombre', field: 'nombre', sortable: true, style: 'font-weight: bold;' },
  { name: 'identificacion', align: 'center', label: 'Identificación', field: 'identificacion', sortable: true },
  { name: 'direccion', align: 'center', label: 'Dirección', field: 'direccion', sortable: true },
  { name: 'telefono', align: 'center', label: 'Teléfono', field: 'telefono', sortable: true },
  { name: 'email', align: 'center', label: 'Email', field: 'email', sortable: true },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true, style: 'font-weight: bold;' },
  { name: 'opciones', align: 'center', label: 'Opciones', field: 'opciones', sortable: false },
]);

const rows = ref([]);
const authStore = useAuthStore();
const modalEditar = ref(false);
const datosProveedor = ref({});
const modalConfirmarEstado = ref(false);  // Estado para el modal de confirmación
const proveedorSeleccionado = ref(null);

async function getDataFromApi() {
  const token = authStore.getToken();
  if (!token) {
    console.log('Token no encontrado');
    return;
  }

  try {
    const response = await getData('terceros/proveedores');
    if (response && Array.isArray(response)) {
      rows.value = response;
    } else {
      console.log('La respuesta no contiene los datos esperados');
    }
  } catch (error) {
    console.log('Error al obtener los datos:', error.response ? error.response.data : error);
  }
}

onMounted(async () => {
  await getDataFromApi();
});


async function updateProveedor(proveedor) {
  try {
    const token = authStore.getToken();
    if (!token) {
      console.log('Token no encontrado');
      return;
    }

    const response = await putData('terceros/proveedores', proveedor);
    if (response && response.success) {
      console.log('Datos actualizados correctamente');
    } else {
      console.log('Error al actualizar los datos:', response);
    }
  } catch (error) {
    console.log('Error al actualizar los datos:', error);
  }
}


const editarProveedor = (Proveedor) => {
  datosProveedor.value = { ...Proveedor };
  modalEditar.value = true;

};
const mostrarModalConfirmacion = (proveedor) => {
  proveedorSeleccionado.value = proveedor;  // Almacenar el proveedor seleccionado
  modalConfirmarEstado.value = true;        // Mostrar el modal
};


const guardarCambiosProveedor = async () => {
  console.log('Proveedor guardado:', datosProveedor.value);
  const index = rows.value.findIndex(proveedor => proveedor.identificacion === datosProveedor.value.identificacion);
  if (index !== -1) {
    rows.value[index] = datosProveedor.value;
  }

  await updateProveedor(datosProveedor.value);
  modalEditar.value = false;
};

const confirmarCambioEstado = async () => {
  if (!proveedorSeleccionado.value) return;

  const proveedor = proveedorSeleccionado.value;
  proveedor.estado = proveedor.estado === 1 ? 0 : 1;  // Cambiar el estado

  console.log('Estado cambiado para', proveedor);
  await updateProveedor(proveedor);  // Actualizar en el servidor
  modalConfirmarEstado.value = false;  // Cerrar el modal
};

// Cancelar el cambio de estado
const cancelarCambioEstado = () => {
  modalConfirmarEstado.value = false;  // Cerrar el modal
};



</script>

<style scoped>
.tabla-proovedores {
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

.tabla-cell {
  padding: 12px;
  text-align: center;
  font-size: 14px;
}

.tabla-cell.opciones button {
  padding: 5px 10px;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.tabla-cell.opciones button:hover {
  background-color: #7b7b7b;
}

h1 {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 3px solid rgb(2, 21, 38);
}
</style>
