<template>
  <q-page padding>
    <h4 class="text-center text-weight-bold">Ventas</h4>
    <hr>
    <div class="main-btn-registrar">
      <q-btn label="Registrar" @click="abrirFormulario" class="q-mb-md" id="btn-registrar" />
    </div>



    <!-- Este es el codigo del cuadro la tabla de facturas -->

    <div>
      <q-table :rows="rows" :columns="columns" row-key="name" bordered class="tabla-views">
        <template v-slot:header="props">
          <tr>
            <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
              <span>{{ col.label }}</span>
            </th>
          </tr>
        </template>

        <template v-slot:body-cell-opciones="props">
          <q-td :props="props">
            <q-btn flat color="primary" icon="visibility" @click="ver(props.row)" class="q-mr-sm" />
          </q-td>
        </template>

        <template v-slot:body-cell-fecha="props">
          <q-td :props="props" class="q-pa-sm">
            {{ new Date(props.row.createdAt).toLocaleDateString('es-ES') }}
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Formulario para registrar una nueva factura -->
    <q-dialog v-model="modalRegistrar" persistent :maximized="maximizedToggle" transition-show="slide-up"
      transition-hide="slide-down">
      <q-card class="text-dark">
        <q-bar class="q-pa-lg">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <q-form  ref="formRef">
          <div class="titulo">
            <h4 class="text-center text-weight-bold">Registrar Nueva Factura</h4>
          </div>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <q-input v-model="nuevaVenta.numeroFactura" label="No. Factura" filled type="number"
                :rules="[(val) => !!val || 'El número de factura es obligatorio']" required />

              <q-input v-model="nuevaVenta.cliente" label="Cliente" filled type="text"
                :rules="[(val) => !!val || 'El nombre del cliente es obligatorio']" required />

              <q-input v-model="nuevaVenta.fecha" label="Fecha" type="date" filled
                :rules="[(val) => !!val || 'La fecha es obligatoria']" required />

                <q-select v-model="selectedArticulo" label="Seleccionar Artículo" :options="articulos"
                  option-value="_id" option-label="nombre" filled emit-value class="q-mb-sm"
                  @update:model-value="addArticulo"  />
               
            </div>

            <div class="col-12 col-md-6">
              <q-input v-model.number="nuevaVenta.subtotal" label="Subtotal" filled type="number"
                :rules="[(val) => !!val || 'El subtotal es obligatorio']" class="q-mb-sm" :readonly="isViewing" />
              <q-input v-model.number="nuevaVenta.iva" label="IVA (%)" filled type="number" class="q-mb-sm"
                :readonly="isViewing"
                @input="totalProductos = nuevaVenta.subtotal * (nuevaVenta.iva / 100) + nuevaVenta.subtotal" />
              <q-input :model-value="totalProductos" label="Total factura" filled type="number" :readonly="true"
                disable />
            </div>


          </div>
        </q-form>
        </q-card-section>

        <q-card-section class="tabla-views">
          <q-table class="tabla-views" :rows="articulos" :columns="columnsProductos" row-key="id">
            <template v-slot:header="props">
              <tr>
                <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
                  <span>{{ col.label }}</span>
                </th>
              </tr>
            </template>
            <template v-slot:body-cell-nombre="props">
              <q-td :props="props">{{ props.row.nombre }}</q-td>
            </template>
            <template v-slot:body-cell-precio="props">
              <q-td :props="props">{{ props.row.precio.toFixed(2) }}</q-td>
            </template>
            <template v-slot:body-cell-cantidad="props">
              <q-td :props="props">
                <q-input v-model.number="props.row.cantidad" type="number" min="1" />
              </q-td>
            </template>
            <template v-slot:body-cell-subtotal="props">
              <q-td :props="props">{{ (props.row.cantidad * props.row.precio).toFixed(2) }}</q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancelar" flat color="negative" @click="cerrarFormulario" />
          <q-btn label="Registrar" flat color="primary" @click="registrarFactura" />
        </q-card-actions>
      </q-card>
    </q-dialog>



    <!-- Este es el codigo del cuadro de visualizacion de los datos de la tabla -->

    <q-dialog v-model="abrir" persistent :maximized="maximizedToggle" transition-show="slide-up"
      transition-hide="slide-down">
      <q-card class="text-dark">
        <q-bar class="q-pa-lg">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Cerrar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="titulo">
            <h4 class="text-center text-weight-bold">Detalle factura</h4>
          </div>
          <div class="formulario">
            <div style="
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 30px;
              ">
              <q-input v-model="numeroFactura" label="No.factura" disable />
              <q-input v-model="cliente" label="Cliente" disable />
              <q-input v-model="fecha" label="Fecha " disable />
              <q-input :model-value="totalProductos" label="Total factura" disable />
            </div>
          </div>

        </q-card-section>
       
        <q-card-section class="tabla-views">
          <div>

            <q-table class="tabla-views" :rows="articulos" :columns="columnsProductos" row-key="id">
              <template v-slot:header="props">
                <tr>
                  <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
                    <span>{{ col.label }}</span>
                  </th>
                </tr>
              </template>
              <template v-slot:body-cell-nombre="props">
                <q-td :props="props">{{ props.row.nombre }}</q-td>
              </template>

              <template v-slot:body-cell-precio="props">
                <q-td :props="props" class="q-pa-sm">

                  <span>{{ props.row.precio.toFixed(2) }}</span>
                </q-td>
              </template>

              <q-td key="cantidad" :props="props">{{ props.row.cantidad }}</q-td>

              <template v-slot:body-cell-subtotal="props">
                <q-td :props="props" class="q-pa-sm">

                  <span>{{ (props.row.cantidad * props.row.precio).toFixed(2) }}</span>
                </q-td>
              </template>

              <template v-slot:body-cell-opciones="props">
                <q-td :props="props" class="tabla-cell opciones">
                  <q-btn icon="edit" color="primary" flat @click="infoVentaEditar(props.row)" class="q-mr-sm" />
                  <q-btn :icon="props.row.estado === 1 ? 'remove_circle' : 'check_circle'"
                    :color="props.row.estado === 1 ? 'negative' : 'positive'" flat
                    @click="mostrarModalConfirmacion(props.row)" />

                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getData, postData, putData } from '../services/apiClient.js'
import { useAuthStore } from '../store/useAuth.js'
import { Notify } from 'quasar'

let abrir = ref(false);
let maximizedToggle = ref(true);
let total = ref(0);
let numeroFactura = ref("");
let fecha = ref("");
let cliente = ref("");
const authStore = useAuthStore()
const modalRegistrar = ref(false);
const isViewing = ref(false);
const selectedArticulo = ref(null);
const articulos = ref([]);

const nuevaVenta = ref({
  tipo: 2,
  numeroFactura: "",
  cliente: " ",
  fecha: "",
  articulos: [],
  subtotal: 0,
  iva: 19, 
  total: 0,
  estado: 1
});

watch(
  () => nuevaVenta.value.articulos,
  () => calculateTotals(),
  { deep: true }
);

const columns = ref([
  {
    name: "numeroFactura",
    label: "Numero de factura",
    field: "numeroFactura",
    align: "center",
  },
  {
    name: "cliente",
    label: "Cliente",
    align: "center",
    field: "cliente"
  },
  {
    name: "fecha",
    required: true,
    label: "Fecha de factura",
    align: "center",
    field: "fecha",
    sortable: true,
  },

  { name: "total", label: "Valor Total", align: "center", field: "total", sortable: true },
  { name: "opciones", label: "Vizualización", align: "center", field: "opciones" },
]);

const rows = ref([]);

onMounted(async () => {
  await getVentas();
  cargarArticulos();

})



async function getVentas() {
  const token = authStore.getToken();
  console.log("Token recuperado del store", token)
  if (!token) {
    console.log('Token no encontrado')
    return
  }

  try {
    const response = await getData('movimientos/ventas');
    if (response && Array.isArray(response)) {
      rows.value = response
    } else {
      console.log('La respuesta no contiene los datos esperados')
    }
  } catch (error) {
    console.log('Error al obtener los datos:', error.response ? error.response.data : error)
  }
}

function addArticulo(articuloId) {
  if (!articuloId) return;
  const articulo = articulos.value.find(a => a._id === articuloId);
  if (articulo && !nuevaVenta.value.articulos.some(a => a.id === articuloId)) {
    nuevaVenta.value.articulos.push({
      id: articulo._id,
      nombre: articulo.nombre,
      cantidad: 1,
      precio: articulo.precio || 0,
    });
  }
  calculateTotals();
}

async function cargarArticulos() {
  articulos.value = await getData("articulos");
}


const abrirFormulario = () => {
  modalRegistrar.value = true;
  numeroFactura.value = "";
  cliente.value = "";
  fecha.value = "";
  articulos.value = [];
}

const resetForm = () => {
  nuevaVenta.value = {
    tipo: 2,
    numeroFactura: "",
    cliente: " ",
    fecha: "",
    articulos: [],
    subtotal: 0,
    iva: 19, // IVA por defecto en porcentaje
    total: 0,
    estado: 1
  };
  isEditing.value = false;
  isViewing.value = false;
  selectedArticulo.value = null;
}

function calculateTotals() {
  // Calcula el subtotal
  const subtotal = nuevaVenta.value.articulos.reduce(
    (acc, art) => acc + art.cantidad * art.precio,
    0
  );

  // Calcula el IVA y el total
  const ivaAmount = (subtotal * nuevaVenta.value.iva) / 100;
  nuevaVenta.value.subtotal = subtotal;
  nuevaVenta.value.total = subtotal + ivaAmount;
}


async function registrarFactura() {
  const facturaData = {
    numeroFactura: numeroFactura.value,
    cliente: cliente.value,
    fecha: fecha.value,
    articulos: articulos.value,
    total: totalProductos.value,  // Total calculado
  };

  try {
    const response = await postData('movimientos/ventas', facturaData);
    if (response && response.success) {
      Notify.create({
        message: 'Factura registrada con éxito.',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
        timeout: 3000,
      });
      cerrarFormulario();  // Cerrar el formulario después de guardar
    } else {
      Notify.create({
        message: 'Error al registrar la factura.',
        color: 'negative',
        icon: 'error',
        position: 'top',
        timeout: 3000,
      });
    }
  } catch (error) {
    console.error('Error al registrar factura:', error);
    Notify.create({
      message: 'Error al registrar la factura.',
      color: 'negative',
      icon: 'error',
      position: 'top',
      timeout: 3000,
    });
  }
}

const cerrarFormulario = () => {
  modalRegistrar.value = false;
  resetForm();
}



const columnsProductos = ref([
  {
    name: "nombre",
    label: "Nombre producto",
    field: "nombre",
    align: "center",
  },
  {
    name: "cantidad",
    align: "center",
    label: "Cantidad",
    field: "cantidad",
    sortable: true,
  },
  {
    name: "precio",
    required: true,
    label: "Precio unitario",
    align: "center",
    field: "precio",
    sortable: true,
  },

  { name: "subtotal", label: "Subtotal", align: "center", field: row => row.cantidad * row.precio },
  { name: "opciones", label: "Opciones", align: "center", field: "opciones" },

]);

/* const cargarDetallesProductos = async (articulos) => {
  try {
    const response = await getData('articulos');
    console.log(response);


  } catch (error) {
    console.error('Error al cargar los detalles de los productos:', error);
    Notify.create({
      message: 'Error al cargar los detalles de los productos',
      color: 'red',
      icon: 'error',
      position: 'top',
      timeout: 3000,
    });
  }
}; */


function ver(r) {
  abrir.value = true;
  console.log("ver", r);

  if (r.articulos && Array.isArray(r.articulos)) {
    cliente.value = r.cliente;
    fecha.value = r.fecha;
    numeroFactura.value = r.numeroFactura;
    articulos.value = r.articulos.map((articuloFactura) => {
      console.log("articuloFactura", articuloFactura);
      return {
        id: articuloFactura._id,
        nombre: articuloFactura._id.nombre,
        precio: articuloFactura._id.precio,
        cantidad: articuloFactura.cantidad,
        iva: articuloFactura._id.iva || 19,
      };

    });
    console.log("articulos con iva", articulos.value);

  } else {
    console.error("La propiedad 'productos' no está definida o no es un arreglo");
    Notify.create({
      message: 'Error: No se encontraron productos en la factura.',
      color: 'red',
      icon: 'error',
      position: 'top',
      timeout: 3000,
    });
  }
}

const totalProductos = computed(() => {

  const total = articulos.value.reduce((acum, current) => {
    const precioConIva = current.cantidad * current.precio * (1 + (current.iva / 100 || 0));
    return acum + precioConIva;
  }, 0);
  return total.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

</script>
<style scoped>
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

.titulo {
  margin-bottom: 20px;
}

.formulario {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  gap: 30px;
  flex-wrap: wrap;
}
</style>