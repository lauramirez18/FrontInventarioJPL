<template>
  <q-page padding>
    <h4 class="text-center text-weight-bold">Proveedores</h4>
    <hr>
    <div class="main-btn-registrar">
      <q-btn label="Registrar" @click="abrirFormulario" class="q-mb-md" id="btn-registrar" />
    </div>

    <q-table class="tabla-views" :rows="rows" :columns="columns" row-key="name">
      <template v-slot:header="props">
        <tr>
          <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
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
          <q-btn :icon="props.row.estado === 1 ? 'remove_circle' : 'check_circle'"
            :color="props.row.estado === 1 ? 'negative' : 'positive'" flat
            @click="mostrarModalConfirmacion(props.row)" />

        </q-td>
      </template>


    </q-table>

    <q-dialog v-model="modalConfirmarEstado">
      <q-card>
        <div class="text-h6">¿Estás seguro de cambiar el estado?</div>
        <q-card-section>

        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancelar" color="secondary" flat @click="cancelarCambioEstado" />
          <q-btn label="Confirmar" color="primary" flat @click="confirmarCambioEstado" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modalAgregarProveedor" persistent>
      <q-card>
        <div class="text-h6">Agregar Nuevo Proveedor</div>
        <q-card-section>


          <q-input v-model="nuevoProveedor.nombre" label="Nombre" filled
            :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']" />

          <q-input v-model="nuevoProveedor.identificacion" label="Identificacion" filled
            :rules="[val => val && val.length > 0 || 'La identificacion es obligatoria']" />

          <q-input v-model="nuevoProveedor.direccion" label="Dirección" filled
            :rules="[val => val && val.length > 0 || 'La dirección es obligatoria']" />

          <q-input v-model="nuevoProveedor.telefono" label="Teléfono" filled :rules="[val => val && val.length > 0 || 'El telefono es obligatorio',
          val => val.length === 10 || 'El telefono debe tener 10 digitos'
          ]" />

          <q-input v-model="nuevoProveedor.email" label="Email" filled :rules="[
            val => val && val.length > 0 || 'El email es obligatorio',
            val => /.+@.+\..+/.test(val) || 'El email debe ser válido'
          ]" />

        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
          <q-btn label="Guardar" color="primary" flat @click="postProveedor" :disable="!formValido" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalEditarProveedor" persistent>
      <q-card>
        <div class="text-h6">Editar Proveedor</div>
        <q-card-section>

          <q-input v-model="editarProveedor.nombre" label="Nombre" filled
            :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']" />

          <q-input v-model="editarProveedor.identificacion" label="Identificacion" filled
            :rules="[val => val && val.length > 0 || 'La identificacion es obligatoria']" />

          <q-input v-model="editarProveedor.direccion" label="Dirección" filled
            :rules="[val => val && val.length > 0 || 'La direccione es obligatoria']" />

          <q-input v-model="editarProveedor.telefono" label="Teléfono" filled
            :rules="[val => val && val.length > 0 || 'El telefono es obligatorio']" />

          <q-input v-model="editarProveedor.email" label="Email" filled :rules="[
            val => val && val.length > 0 || 'El email es obligatorio',
            val => /.+@.+\..+/.test(val) || 'El email debe ser válido'
          ]" />


        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancelar" color="secondary" flat @click="cerrarModalEditar" />
          <q-btn label="Guardar Cambios" color="primary" flat @click="putProveedor" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, } from 'vue'
import { getData, postData, putData } from '../services/apiClient.js'
import { useAuthStore } from '../store/useAuth.js'
import { Notify } from 'quasar'

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
    style: "font-weight: bold;",
  },
  {
    name: "opciones",
    align: "center",
    label: " Opciones",
    field: "opciones",
    sortable: true,
  },
])


const rows = ref([]);
const modalConfirmarEstado = ref(false);
const modalAgregarProveedor = ref(false);
const modalEditarProveedor = ref(false);

const nuevoProveedor = ref({
  nombre: '',
  identificacion: '',
  direccion: '',
  telefono: '',
  email: '',
  tipo: "1",
});

const editarProveedor = ref({
  _id: '',
  nombre: '',
  identificacion: '',
  direccion: '',
  telefono: '',
  email: '',
});

const proveedorSeleccionado = ref(null);
const authStore = useAuthStore()

const formValido = computed(() => {

  return nuevoProveedor.value.nombre &&
    nuevoProveedor.value.identificacion &&
    nuevoProveedor.value.direccion &&
    nuevoProveedor.value.telefono &&
    nuevoProveedor.value.email
});
onMounted(async () => {
  await getClientes()
})

async function getClientes() {
  const token = authStore.getToken();
  console.log("Token recuperado del store", token)
  if (!token) {
    console.log('Token no encontrado')
    return
  }

  try {
    const response = await getData('terceros/proveedores');
    if (response && Array.isArray(response)) {
      rows.value = response
    } else {
      console.log('La respuesta no contiene los datos esperados')
    }
  } catch (error) {
    console.log('Error al obtener los datos:', error.response ? error.response.data : error)
  }
}

const mostrarModalConfirmacion = (proveedor) => {
  proveedorSeleccionado.value = proveedor;
  modalConfirmarEstado.value = true;
}

const abrirFormulario = () => {
  modalAgregarProveedor.value = true;
}

const cerrarFormulario = () => {
  modalAgregarProveedor.value = false;
  resetFormulario();
}

const resetFormulario = () => {
  nuevoProveedor.value = {
    nombre: '',
    identificacion: '',
    direccion: '',
    telefono: '',
    email: '',
  };
}

const postProveedor = async () => {
  try {
    nuevoProveedor.value.nombre = nuevoProveedor.value.nombre.trim();
    nuevoProveedor.value.identificacion = nuevoProveedor.value.identificacion.trim();
    nuevoProveedor.value.direccion = nuevoProveedor.value.direccion.trim();
    nuevoProveedor.value.telefono = nuevoProveedor.value.telefono.trim();
    nuevoProveedor.value.email = nuevoProveedor.value.email.trim();

    console.log(nuevoProveedor.value);
    
    const response = await postData('terceros', nuevoProveedor.value);
    console.log('Proveedor creado con éxito', response);
    modalAgregarProveedor.value = false;

    Notify.create({
      message: 'Proveedor registrado exitosamente',
      color: 'green',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });
    await getClientes();
    resetFormulario();
  } catch (error) {
    console.log('Error al crear el proveedor:', error.response ? error.response.data : error);
    console.log(error);
    
    if (error.response && error.response.data && error.response.data.errores) {
      const errores = error.response.data.errores;

      errores.forEach((err) => {
        if (err.msg) {
          Notify.create({
            message: err.msg,
            color: 'red',
            icon: 'error',
            position: 'top',
            timeout: 3000,
          });
        } else {

          Notify.create({
            message: 'Error desconocido',
            color: 'red',
            icon: 'error',
            position: 'top',
            timeout: 3000,
          });
        }
      });
    } else {

      Notify.create({
        message: 'Hubo un error en el registro. Inténtelo nuevamente.',
        color: 'red',
        icon: 'error',
        position: 'top',
        timeout: 3000,
      });
    }
  }
}

const infoProveedorEditar = (cliente) => {
  editarProveedor.value = cliente;
  modalEditarProveedor.value = true;
}

const cerrarModalEditar = () => {
  modalEditarProveedor.value = false;
}

const putProveedor = async () => {
  try {

    editarProveedor.value.nombre = editarProveedor.value.nombre.trim();
    editarProveedor.value.identificacion = editarProveedor.value.identificacion.trim();
    editarProveedor.value.direccion = editarProveedor.value.direccion.trim();
    editarProveedor.value.telefono = editarProveedor.value.telefono.trim();
    editarProveedor.value.email = editarProveedor.value.email.trim();


    const response = await putData(`terceros/${editarProveedor.value._id}`, editarProveedor.value);
    console.log('Proveedor editado con éxito', response);


    Notify.create({
      message: 'Proveedor editado con éxito',
      color: 'green',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });


    modalEditarProveedor.value = false;
    await getClientes();

  } catch (error) {
    console.log('Error al editar el proveedor:', error.response ? error.response.data : error);


    if (error.response && error.response.data && error.response.data.errores) {
      const errores = error.response.data.errores;
      console.log('Errores del backend:', errores);

      errores.forEach((err) => {
        if (err.msg) {
          Notify.create({
            message: err.msg,
            color: 'red',
            icon: 'error',
            position: 'top',
            timeout: 3000,
          });
        } else {
          Notify.create({
            message: 'Error desconocido',
            color: 'red',
            icon: 'error',
            position: 'top',
            timeout: 3000,
          });
        }
      });
    } else {

      Notify.create({
        message: 'Hubo un error al editar el proveedor. Inténtelo nuevamente.',
        color: 'red',
        icon: 'error',
        position: 'top',
        timeout: 3000,
      });
    }
  }
}

const confirmarCambioEstado = async () => {
  if (!proveedorSeleccionado.value) return;

  const Cliente = proveedorSeleccionado.value;
  Cliente.estado = Cliente.estado === 1 ? 0 : 1;

  try {
    const response = await putData(`terceros/${Cliente._id}`, { estado: Cliente.estado });
    console.log('Estado actualizado con éxito:', response);
    Notify.create({
      message: 'Estado actualizado con éxito',
      color: 'green',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });
    await getClientes();
    modalConfirmarEstado.value = false;
  } catch (error) {
    console.log('Error al actualizar el estado:', error.response ? error.response.data : error);
    Notify.create({
      message: 'Error al actualizar el estado',
      color: 'red',
      icon: 'error',
      position: 'top',
      timeout: 3000,
    });
  }
};


const cancelarCambioEstado = () => {
  modalConfirmarEstado.value = false;
};



</script>

<style scoped>
* {
  padding: 0;
}

.tabla-views {
  margin: 30px auto;
  max-width: 1100px;
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

.main-btn-registrar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  max-width: 1150px;
}

#btn-registrar {
  background-color: rgb(2, 21, 38);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  margin: 20px 30px 5px;
  justify-content: center;
  align-items: center;
  align-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 10px;

}

#btn-registrar:hover {
  background-color: rgb(1, 104, 46);
  color: white;
  transform: translateY(-5px);
}

.q-card {

  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin: 10px auto;
  padding-bottom: 20px;

}

.q-card-section {
  background-color: bisque;
  padding: 0;
}

.text-h6 {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  color: white;
  background-color: rgb(85, 89, 92);
  padding: 30px;
}



.q-input {
  display: flex;

  padding: 20px 33px 22px;
}

.q-card__actions {
  display: flex;
  padding-top: 20px;
  justify-content: center;
}
</style>
