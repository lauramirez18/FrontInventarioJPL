<template>
    <q-page padding>
        <h4 class="text-center text-weight-bold">Articulos</h4>
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
                    <q-btn icon="edit" color="primary" flat @click="editarArticulo(props.row)" class="q-mr-sm" />
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

        <q-dialog v-model="modalAgregarArticulo" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Agregar Nuevo Articulo </div>
                    <q-input v-model="nuevoArticulo.nombre" label="Nombre" filled />
                    <q-input v-model="nuevoArticulo.precio" label="Precio" filled />
                    <q-input v-model="nuevoArticulo.stock" label="Stock" filled />
                    <q-input v-model="nuevoArticulo.categoria" label="Categoria" filled />
                    <q-input v-model="nuevoArticulo.estado" label="Estado" filled type="number" min="0" max="1" />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
                    <q-btn label="Guardar" color="primary" flat @click="postArticulo" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <q-dialog v-model="modalEditarArticulo" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Editar </div>
                    <q-input v-model="articulosEditar.nombre" label="Nombre" filled />
                    <q-input v-model="articulosEditar.precio" label="Precio" filled />
                    <q-input v-model="articulosEditar.stock" label="Stock" filled />
                    <q-input v-model="articulosEditar.categoria" label="Categoria" filled />
                    <q-input v-model="articulosEditar.estado" label="Estado" filled type="number" min="0" max="1" />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarModalEditar" />
                    <q-btn label="Guardar Cambios" color="primary" flat @click="putArticulos" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getData, postData, putData } from '../services/apiClient.js'
import { useAuthStore } from '../store/useAuth.js'
import { Notify } from 'quasar';

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
        name: "precio",
        align: "center",
        label: "Precio",
        field: "precio",
        sortable: true,
    },
    {
        name: "stock",
        align: "center",
        label: "Stock",
        field: "stock",
        sortable: true,
    },
    {
        name: "categoria",
        align: "center",
        label: "Categoria",
        field: "categoria",
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
const modalAgregarArticulo = ref(false);
const modalEditarArticulo = ref(false);

const nuevoArticulo = ref({
    nombre: '',
    precio: '',
    stock: '',
    categoria: '',
    estado: 1,
});

const articulosEditar = ref({
    _id: '',
    nombre: '',
    precio: '',
    stock: '',
    categoria: '',
    estado: 1,
});

const articuloSeleccionado = ref(null);
const authStore = useAuthStore()

const formValido = computed(() => {
    return nuevoArticulo.value.nombre &&
        nuevoArticulo.value.precio &&
        nuevoArticulo.value.stock &&
        nuevoArticulo.value.categoria
});

onMounted(async () => {
    await getArticulos()
})

async function getArticulos() {
    const token = authStore.getToken();
    console.log("token recuperado del store", token);
    if (!token) {
        console.log("token no encontrado");
        return
    }

    try {
        const response = await getData('articulos')
        if (response && Array.isArray(response)) {
            rows.value = response;
        } else {
            console.log("La respuesta no contiene los datos esperados");
        }
    } catch (error) {
        console.log("Error al obtener los articulos", error.response ? error.response.data : error);
    }
}

const mostrarModalConfirmacion = (articulo) => {
    articuloSeleccionado.value = articulo;
    modalConfirmarEstado.value = true;
}

const abrirFormulario = () => {
    modalAgregarArticulo.value = true;
}

const cerrarFormulario = () => {
    modalAgregarArticulo.value = false;
    resetFormulario();
}

const resetFormulario = () => {
    nuevoArticulo.value = {
        nombre: '',
        precio: '',
        stock: '',
        categoria: '',
        estado: 1,
    };
}

const postArticulo = async () => {
    try {
        nuevoArticulo.value.nombre = nuevoArticulo.value.nombre.trim();
        nuevoArticulo.value.precio = nuevoArticulo.value.precio.trim();
        nuevoArticulo.value.stock = nuevoArticulo.value.stock.trim();
        nuevoArticulo.value.categoria = nuevoArticulo.value.categoria.trim();

        const response = await postData('articulos', nuevoArticulo.value);
        console.log('Articulo creado con exito', response);
        modalAgregarArticulo.value = false;

        Notify.create({
            message: 'Articulo registrado exitosamente',
            color: 'green',
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
        })
        await getArticulos();
        resetFormulario();
    } catch (error) {
        console.log('Error al crear el articulo', error.response ? error.response.data : error);
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
                    })
                } else {
                    Notify.create({
                        message: 'Error desconocido',
                        color: 'red',
                        icon: 'error',
                        position: 'top',
                        timeout: 3000,
                    });
                }
            })
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

const editarArticulo = (articulo) => {
    articulosEditar.value = articulo
    modalEditarArticulo.value = true;
}

const cerrarModalEditar = () => {
    modalEditarArticulo.value = false;
}

const putArticulos = async () => {
    try {
        articulosEditar.value.nombre = articulosEditar.value.nombre.trim();
        articulosEditar.value.precio = articulosEditar.value.precio.trim();
        articulosEditar.value.stock = articulosEditar.value.stock.trim();

        const response = await putData(`articulos/${articulosEditar.value._id}`, articulosEditar.value);
        console.log("Articulo actualizado con exito", response);

        Notify.create({
            message: 'Articulo editado con éxito',
            color: 'green',
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
        });

        modalEditarArticulo.value = false;
        await getArticulos();

    } catch (error) {
        console.log("Error al actualizar el articulo", error.response ? error.response.data : error);
    }
}

const confirmarCambioEstado = async () => {
    if (!articuloSeleccionado.value) return;

    const articulo = articuloSeleccionado.value;
    articulo.estado = articulo.estado === 1 ? 0 : 1;

    try {
        const response = await putData(`articulos/${articulo._id}`, { estado: articulo.estado });
        console.log('articulo actualizado con exito', response);

        await getArticulos();
        modalConfirmarEstado.value = false;
    } catch (error) {
        console.log('Error al actualizar el articulo', error.response ? error.response.data : error);
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

.tabla-cell.opciones button {
    padding: 5px 10px;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 4px;
}
</style>