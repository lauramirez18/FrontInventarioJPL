<template>
  <q-page padding>
      <h4 class="text-center text-weight-bold">Clientes</h4>
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
                  <q-btn icon="edit" color="primary" flat @click="infoClienteEditar(props.row)" class="q-mr-sm" />
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
      <q-dialog v-model="modalAgregarCliente" persistent>
          <q-card>
              <div class="text-h6">Agregar Nuevo Cliente</div>
              <q-card-section>
                  

                  <q-input v-model="nuevoCliente.nombre" label="Nombre" filled
                      :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']" />

                  <q-input v-model="nuevoCliente.identificacion" label="Identificacion" filled
                      :rules="[val => val && val.length > 0 || 'La identificacion es obligatoria']" />

                    <q-input v-model="nuevoCliente.direccion" label="Dirección" filled
                      :rules="[val => val && val.length > 0 || 'La dirección es obligatoria']" />

                    <q-input v-model="nuevoCliente.telefono" label="Teléfono" filled  
                      :rules="[val => val && val.length > 0 || 'El telefono es obligatorio',
                      val => val.length === 10 || 'El telefono debe tener 10 digitos'
                      ]" />

                  <q-input v-model="nuevoCliente.email" label="Email" filled :rules="[
                      val => val && val.length > 0 || 'El email es obligatorio',
                      val => /.+@.+\..+/.test(val) || 'El email debe ser válido'
                  ]" />

              </q-card-section>

              <q-card-actions>
                  <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
                  <q-btn label="Guardar" color="primary" flat @click="postCliente" :disable="!formValido" />
              </q-card-actions>
          </q-card>
      </q-dialog>

      <q-dialog v-model="modalEditarCliente" persistent>
          <q-card>
              <div class="text-h6">Editar Cliente</div>
              <q-card-section >
                 
                  <q-input v-model="editarCliente.nombre" label="Nombre" filled 
                  :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"  />

                  <q-input v-model="editarCliente.identificacion" label="Identificacion" filled
                      :rules="[val => val && val.length > 0 || 'La identificacion es obligatoria']" />

                    <q-input v-model="editarCliente.direccion" label="Dirección" filled 
                      :rules="[val => val && val.length > 0 || 'La direccione es obligatoria']" />

                    <q-input v-model="editarCliente.telefono" label="Teléfono" filled 
                      :rules="[val => val && val.length > 0 || 'El telefono es obligatorio']" />

                  <q-input v-model="editarCliente.email" label="Email" filled :rules="[
                      val => val && val.length > 0 || 'El email es obligatorio',
                      val => /.+@.+\..+/.test(val) || 'El email debe ser válido'
                  ]" />


              </q-card-section>

              <q-card-actions>
                  <q-btn label="Cancelar" color="secondary" flat @click="cerrarModalEditar" />
                  <q-btn label="Guardar Cambios" color="primary" flat @click="putClientes" />
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
const modalAgregarCliente = ref(false);
const modalEditarCliente = ref(false);

const nuevoCliente = ref({
  nombre: '',
  identificacion: '',
  direccion: '',
  telefono: '',
  email: '',
  tipo: "0",
});

const editarCliente = ref({
  _id: '',
  nombre: '',
  identificacion: '',
  direccion: '',
  telefono: '',
  email: '',
});

const clienteSeleccionado = ref(null);
const authStore = useAuthStore()

const formValido = computed(() => {

  return nuevoCliente.value.nombre &&
      nuevoCliente.value.identificacion &&
      nuevoCliente.value.direccion &&
      nuevoCliente.value.telefono &&
      nuevoCliente.value.email 
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
      const response = await getData('terceros/clientes');
      if (response && Array.isArray(response)) {
          rows.value = response
      } else {
          console.log('La respuesta no contiene los datos esperados')
      }
  } catch (error) {
      console.log('Error al obtener los datos:', error.response ? error.response.data : error)
  }
}

const mostrarModalConfirmacion = (cliente) => {
  clienteSeleccionado.value = cliente;
  modalConfirmarEstado.value = true;
}

const abrirFormulario = () => {
  modalAgregarCliente.value = true;
}

const cerrarFormulario = () => {
  modalAgregarCliente.value = false;
  resetFormulario();
}

const resetFormulario = () => {
  nuevoCliente.value = {
      nombre: '',
      identificacion: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: 1,
  };
}

const postCliente = async () => {
  try {
      nuevoCliente.value.nombre = nuevoCliente.value.nombre.trim();
      nuevoCliente.value.identificacion = nuevoCliente.value.identificacion.trim();
      nuevoCliente.value.direccion = nuevoCliente.value.direccion.trim();
      nuevoCliente.value.telefono = nuevoCliente.value.telefono.trim();
      nuevoCliente.value.email = nuevoCliente.value.email.trim();
     

      const response = await postData('terceros', nuevoCliente.value);
      console.log('Cliente creado con éxito', response);
      modalAgregarCliente.value = false;

      Notify.create({
          message: 'Cliente registrado exitosamente',
          color: 'green',
          icon: 'check_circle',
          position: 'top',
          timeout: 3000,
      });
      await getClientes();
      resetFormulario();
  } catch (error) {
      console.log('Error al crear cliente:', error.response ? error.response.data : error);
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

const infoClienteEditar = (cliente) => {
  editarCliente.value = cliente;
  modalEditarCliente.value = true;
}

const cerrarModalEditar = () => {
  modalEditarCliente.value = false;
}

const putClientes = async () => {
  try {

      editarCliente.value.nombre = editarCliente.value.nombre.trim();
      editarCliente.value.identificacion = editarCliente.value.identificacion.trim();
      editarCliente.value.direccion = editarCliente.value.direccion.trim();
      editarCliente.value.telefono = editarCliente.value.telefono.trim();
      editarCliente.value.email = editarCliente.value.email.trim();


      const response = await putData(`terceros/${editarCliente.value._id}`, editarCliente.value);
      console.log('Cliente editado con éxito', response);


      Notify.create({
          message: 'Cliente editado con éxito',
          color: 'green',
          icon: 'check_circle',
          position: 'top',
          timeout: 3000,
      });


      modalEditarCliente.value = false;
      await getClientes();

  } catch (error) {
      console.log('Error al editar el Cliente:', error.response ? error.response.data : error);


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
              message: 'Hubo un error al editar el Cliente. Inténtelo nuevamente.',
              color: 'red',
              icon: 'error',
              position: 'top',
              timeout: 3000,
          });
      }
  }
}

const confirmarCambioEstado = async () => {
  if (!clienteSeleccionado.value) return;

  const Cliente = clienteSeleccionado.value;
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

*{
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

.q-card-section{
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

.q-card__actions{
  display: flex;
  padding-top: 20px;
  justify-content: center;
}


</style>
