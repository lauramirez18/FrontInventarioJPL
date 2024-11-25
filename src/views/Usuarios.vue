<template>
    <q-page padding>
        <h4 class="text-center text-weight-bold">Usuarios</h4>
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
                    <q-btn icon="edit" color="primary" flat @click="editarUsuario(props.row)" class="q-mr-sm" />
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
        <q-dialog v-model="modalAgregarUsuario" persistent>
            <q-card>
                <div class="text-h6">Agregar Nuevo Usuario</div>
                <q-card-section>
                    

                    <q-input v-model="nuevoUsuario.nombre" label="Nombre" filled
                        :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']" />

                    <q-input v-model="nuevoUsuario.email" label="Email" filled :rules="[
                        val => val && val.length > 0 || 'El email es obligatorio',
                        val => /.+@.+\..+/.test(val) || 'El email debe ser válido'
                    ]" />

                    <q-input type="password" v-model="nuevoUsuario.password" label="Contraseña" filled :rules="[
                        val => val && val.length >= 8 || 'La contraseña debe tener al menos 8 caracteres'
                    ]" />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
                    <q-btn label="Guardar" color="primary" flat @click="postUsuario" :disable="!formValido" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    
        <q-dialog v-model="modalEditarUsuario" persistent>
            <q-card>
                <div class="text-h6">Editar Usuario</div>
                <q-card-section >
                   
                    <q-input v-model="usuarioEditar.nombre" label="Nombre" filled 
                    :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"  />
                    <q-input v-model="usuarioEditar.email" label="Email" filled :rules="[
                        val => val && val.length > 0 || 'El email es obligatorio',
                        val => /.+@.+\..+/.test(val) || 'El email debe ser válido'
                    ]" />


                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarModalEditar" />
                    <q-btn label="Guardar Cambios" color="primary" flat @click="putUsuarios" />
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
        label: "Opciones",
        field: "opciones",
        sortable: true,
    },
])

const rows = ref([]);
const modalConfirmarEstado = ref(false);
const modalAgregarUsuario = ref(false);
const modalEditarUsuario = ref(false);

const nuevoUsuario = ref({
    nombre: '',
    email: '',
    password: '',
    estado: 1,
});

const usuarioEditar = ref({
    _id: '',
    nombre: '',
    email: '',
    password: '',
    estado: 1,
});

const usuarioSeleccionado = ref(null);
const authStore = useAuthStore()

const formValido = computed(() => {

    return nuevoUsuario.value.nombre &&
        nuevoUsuario.value.email &&
        nuevoUsuario.value.password
});
onMounted(async () => {
    await getUsuarios()
})

async function getUsuarios() {
    const token = authStore.getToken();
    console.log("Token recuperado del store", token)
    if (!token) {
        console.log('Token no encontrado')
        return
    }

    try {
        const response = await getData('usuarios')
        if (response && Array.isArray(response)) {
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
}

const abrirFormulario = () => {
    modalAgregarUsuario.value = true;
}

const cerrarFormulario = () => {
    modalAgregarUsuario.value = false;
    resetFormulario();
}

const resetFormulario = () => {
    nuevoUsuario.value = {
        nombre: '',
        email: '',
        password: '',
        estado: 1,
    };
}

const postUsuario = async () => {
    try {
        nuevoUsuario.value.nombre = nuevoUsuario.value.nombre.trim();
        nuevoUsuario.value.email = nuevoUsuario.value.email.trim();
        nuevoUsuario.value.password = nuevoUsuario.value.password.trim();

        const response = await postData('registro', nuevoUsuario.value);
        console.log('Usuario creado con éxito', response);
        modalAgregarUsuario.value = false;

        Notify.create({
            message: 'Proveedor registrado exitosamente',
            color: 'green',
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
        });
        await getUsuarios();
        resetFormulario();
    } catch (error) {
        console.log('Error al crear usuario:', error.response ? error.response.data : error);
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

const editarUsuario = (usuario) => {
    usuarioEditar.value = usuario;
    modalEditarUsuario.value = true;
}

const cerrarModalEditar = () => {
    modalEditarUsuario.value = false;
}

const putUsuarios = async () => {
    try {

        usuarioEditar.value.nombre = usuarioEditar.value.nombre.trim();
        usuarioEditar.value.email = usuarioEditar.value.email.trim();


        const response = await putData(`usuarios/${usuarioEditar.value._id}`, usuarioEditar.value);
        console.log('Usuario editado con éxito', response);


        Notify.create({
            message: 'Usuario editado con éxito',
            color: 'green',
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
        });


        modalEditarUsuario.value = false;
        await getUsuarios();

    } catch (error) {
        console.log('Error al editar el usuario:', error.response ? error.response.data : error);
    }
}
const confirmarCambioEstado = async () => {
    if (!usuarioSeleccionado.value) return;

  const Usuario = usuarioSeleccionado.value;
  Usuario.estado = Usuario.estado === 1 ? 0 : 1; 
  
  try {
    const response = await putData(`usuarios/${Usuario._id}`, { estado: Usuario.estado });
    console.log('Estado actualizado con éxito:', response);
    
    await getUsuarios();
    modalConfirmarEstado.value = false;
  } catch (error) {
    console.log('Error al actualizar el estado:', error.response ? error.response.data : error);
    
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
