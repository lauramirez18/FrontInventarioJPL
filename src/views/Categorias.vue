<template>
    <q-page padding>
        <h4 class="text-center text-weight-bold">Categorias</h4>
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
                    <q-btn icon="edit" color="primary" flat @click="editarCategoria(props.row)" class="q-mr-sm" />
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

        <q-dialog v-model="modalAgregarCategoria" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Agregar Nueva Categoria</div>
                    <q-input v-model="nuevaCategoria.nombre" label="Nombre" filled />
                    <q-input v-model="nuevaCategoria.descripcion" label="Descripción" filled />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
                    <q-btn label="Guardar" color="primary" flat @click="postCategoria" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="modalEditarCategoria" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Editar Categoria</div>
                    <q-input v-model="categoriaEditar.nombre" label="Nombre" filled />
                    <q-input v-model="categoriaEditar.descripcion" label="Descripción" filled />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarModalEditar" />
                    <q-btn label="Guardar Cambios" color="primary" flat @click="putCategoria" />
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
        name: "descripcion",
        align: "center",
        label: "Descripción",
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

const rows = ref([]);
const modalConfirmarEstado = ref(false);
const modalAgregarCategoria = ref(false);
const modalEditarCategoria = ref(false);

const nuevaCategoria = ref({
    nombre: '',
    descripcion: '',
    estado: 1,
});

const categoriaEditar = ref({
    _id: '',
    nombre: '',
    descripcion: '',
    estado: 1,
});

const categoriaSeleccionada = ref(null);
const authStore = useAuthStore()

onMounted(async () => {
    await getCategorias()
})

async function getCategorias() {
    const token = authStore.getToken();
    console.log("Token recuperado del store", token)
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

const mostrarModalConfirmacion = (categoria) => {
    categoriaSeleccionada.value = categoria; 
    modalConfirmarEstado.value = true;      
};

const abrirFormulario = () => {
    modalAgregarCategoria.value = true;
};

const cerrarFormulario = () => {
    modalAgregarCategoria.value = false;
    resetFormulario()
}

const resetFormulario = () => {
    nuevaCategoria.value = {
        nombre: '',
        descripcion: '',
        estado: 1,
    }
}

const postCategoria = async () => {
    try {
        const response = await postData('categorias', nuevaCategoria.value)
        console.log('Categoria creada con éxito', response);
        modalAgregarCategoria.value = false;
        await getCategorias();
        resetFormulario();
    } catch (error) {
        console.log('Error al crear la categoria:', error.response ? error.response.data : error)
    }
}

const editarCategoria = (categoria) => {
    categoriaEditar.value = categoria
    modalEditarCategoria.value = true;
}

const cerrarModalEditar = () => {
    modalEditarCategoria.value = false;
}

const putCategoria = async () => {
    try {
        const response = await putData(`categorias/${categoriaEditar.value._id}`, categoriaEditar.value);
        console.log('Categoria editada con éxito', response);
        modalEditarCategoria.value = false;
        await getCategorias();
    } catch (error) {
        console.log('Error al actualizar la categoria:', error.response ? error.response.data : error)
    }
}

const confirmarCambioEstado = async () => {
    if (!categoriaSeleccionada.value) return;

    const categoria = categoriaSeleccionada.value;
    categoria.estado = categoria.estado === 1 ? 0 : 1;

    try {
        const response = await putData(`categorias/${categoria._id}`, { estado: categoria.estado });
        console.log('Estado de la categoría actualizado con éxito', response);
        await getCategorias();
        modalConfirmarEstado.value = false;
    } catch (error) {
        console.log('Error al actualizar el estado de la categoría:', error.response ? error.response.data : error);
    }
}

const cancelarCambioEstado = () => {
    modalConfirmarEstado.value = false;
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
</style>