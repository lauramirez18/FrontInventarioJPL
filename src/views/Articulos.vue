<template>
    <q-page padding>
        <h4 class="text-center text-weight-bold">Articulos</h4>
        <hr>
        <div class="main-btn-registrar">
            <q-btn label="+ Registrar" @click="abrirFormulario" class="q-mb-md" id="btn-registrar" />
        </div>
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
                    <q-btn icon="edit" color="primary" flat @click="editarArticulo(props.row)" class="q-mr-sm" />
                    <q-btn :icon="props.row.estado === 1 ? 'remove_circle' : 'check_circle'"
                        :color="props.row.estado === 1 ? 'negative' : 'positive'" flat
                        @click="mostrarModalConfirmacion(props.row)" />
                </q-td>
            </template>
        </q-table>

        <q-dialog v-model="modalAgregarArticulo" persistent>
            <q-card>
                <q-card-section>
                    <div class="text-h6">Agregar Nuevo Articulo </div>
                    <q-input v-model="nuevoArticulo.nombre" label="Nombre" filled
                        :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']" />

                    <q-input v-model="nuevoArticulo.precio" label="Precio" filled
                        :rules="[val => val && val.length > 0 || 'El precio es obligatorio']" />

                    <q-input v-model="nuevoArticulo.stock" label="Stock" filled
                        :rules="[val => val && val.length > 0 || 'El stock es obligatorio']" />

                    <q-select v-model="nuevoArticulo.categoria" :options="categorias" label="Categoria" filled
                        option-value="_id" option-label="nombre" />
                </q-card-section>

                <q-card-actions>
                    <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
                    <q-btn label="Guardar" color="primary" :loading="loading" flat @click="postArticulo"
                        :disable="!formValido" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getData, postData } from '../services/apiClient.js'
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
        field: row => row.categoria ? row.categoria.nombre : '', 
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
const categorias = ref([]);
const modalAgregarArticulo = ref(false);
const loading = ref(false);

const nuevoArticulo = ref({
    nombre: '',
    precio: '',
    stock: '',
    categoria: '',
    estado: 1,
});

const authStore = useAuthStore()

const formValido = computed(() => {
    return nuevoArticulo.value.nombre &&
        nuevoArticulo.value.precio &&
        nuevoArticulo.value.stock &&
        nuevoArticulo.value.categoria;
});

onMounted(async () => {
    await getArticulos();
    await getCategorias();
})

async function getArticulos() {
    const token = authStore.getToken();
    console.log("token recuperado del store", token);
    if (!token) {
        console.log("token no encontrado");
        return;
    }

    try {
        const response = await getData('articulos');
        if (response && Array.isArray(response)) {
            rows.value = response;
        } else {
            console.log("La respuesta no contiene los datos esperados");
        }
    } catch (error) {
        console.log("Error al obtener los articulos", error.response ? error.response.data : error);
    }
}

async function getCategorias() {
    try {
        const response = await getData('categorias');
        if (response && Array.isArray(response)) {
            categorias.value = response;
        } else {
            console.log("La respuesta no contiene los datos esperados");
        }
    } catch (error) {
        console.log("Error al obtener las categorias", error.response ? error.response.data : error);
    }
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
    loading.value = true;
    try {
        nuevoArticulo.value.nombre = (nuevoArticulo.value.nombre || '').trim();
        nuevoArticulo.value.precio = (nuevoArticulo.value.precio || '').trim();
        nuevoArticulo.value.stock = (nuevoArticulo.value.stock || '').trim();
        nuevoArticulo.value.categoria = String(nuevoArticulo.value.categoria || '').trim();

        console.log(nuevoArticulo.value);

        const response = await postData('articulos', nuevoArticulo.value);
        console.log('Articulo creado con exito', response);
        modalAgregarArticulo.value = false;

        Notify.create({
            message: 'Articulo registrado exitosamente',
            color: 'green',
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
        });
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
                message: 'Error desconocido',
                color: 'red',
                icon: 'error',
                position: 'top',
                timeout: 3000,
            });
        }
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
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

.main-btn-registrar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    max-width: 1150px;
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