<template>
    <q-page padding>
        <h4 class="text-center text-weight-bold">Usuarios</h4>
        <hr>

        <q-btn label="+ Registrar" @click="abrirFormulario" class="q-mb-md" />

        <q-table class="tabla-clientes" :rows="rows" :columns="columns" row-key="name">
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


        <q-dialog v-model="modalAgregarUsuario" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Agregar Nuevo Usuario</div>
                    <q-input v-model="nuevoUsuario.nombre" label="Nombre" filled />
                    <q-input v-model="nuevoUsuario.email" label="Email" filled />
                    <q-input type="password" v-model="nuevoUsuario.password" label="Contraseña" filled />
                    <q-input v-model="nuevoUsuario.estado" label="Estado" filled type="number" min="0" max="1" />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
                    <q-btn label="Guardar" color="primary" flat @click="postUsuario" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    
        <q-dialog v-model="modalEditarUsuario" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Editar Usuario</div>
                    <q-input v-model="usuarioEditar.nombre" label="Nombre" filled />
                    <q-input v-model="usuarioEditar.email" label="Email" filled />
                    <q-input type="password" v-model="usuarioEditar.password" label="Contraseña" filled />
                    <q-input v-model="usuarioEditar.estado" label="Estado" filled type="number" min="0" max="1" />
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
import { ref, onMounted } from 'vue'
import { getData, postData, putData } from '../services/apiClient.js'
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
        const response = await postData('registro', nuevoUsuario.value);
        console.log('Usuario creado con éxito', response);
        modalAgregarUsuario.value = false;
        await getUsuarios();
        resetFormulario();
    } catch (error) {
        console.log('Error al crear usuario:', error.response ? error.response.data : error);
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
        const response = await putData(`usuarios/${usuarioEditar.value._id}`, usuarioEditar.value);
        console.log('Usuario editado con éxito', response);
        modalEditarUsuario.value = false;
        await getUsuarios();
    } catch (error) {
        console.log('Error al editar el usuario:', error.response ? error.response.data : error);
    }
}
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
