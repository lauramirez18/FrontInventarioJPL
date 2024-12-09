<template>
  <q-page padding>
    <h4 class="text-center text-weight-bold">Ventas</h4>
    <hr>

    <q-btn label="Registrar" icon="add" class="q-mb-md" @click="openModal" />

    <!-- Tabla Facturas -->
    <q-table :rows="rows" :columns="columns" row-key="_id" bordered flat class="tabla-views">
      <template v-slot:header="props">
          <tr>
            <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
              <span>{{ col.label }}</span>
            </th>
          </tr>
        </template>
        <template v-slot:body-cell-estado="props">
          <q-td :props="props" class="q-pa-sm">
            <span style="color: green;" v-if="props.row.estado == 1">Aprobado</span>
            <span style="color: red;" v-else>Anulado</span>
          </q-td>
        </template>

      <template v-slot:body-cell-opciones="props">
        <q-td :props="props" class="tabla-cell opciones">
        <q-btn flat color="primary" icon="visibility" @click="verFactura(props.row)" class="q-mr-sm" />
        <q-btn flat color="primary" icon="edit" @click="editMovimiento(props.row)" class="q-mr-sm" />
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
            <q-btn label="Confirmar" :loading="loading" color="primary" flat @click="confirmarCambioEstado" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    <!-- Formulario para registrar una nueva factura -->
    <q-dialog v-model="isModalOpen" persistent :maximized="maximizedToggle" transition-show="slide-up"
      transition-hide="slide-down">
      <q-card class="text-dark">
        <q-bar class="q-pa-lg">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Cerrar</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <h4 class="text-center text-weight-bold">{{ isEditing ? 'Editar Factura' : isViewing ? 'Detalle Factura' : 'Registrar Nueva Factura' }}</h4>
          <hr>
        </q-card-section>
        <q-card-section class="tabla-views">
          <q-form @submit.prevent="handleSubmit" ref="formRef">
            <div class="row q-col-gutter-lg">
             
              <div class="col-12 col-md-6">
                <q-input v-model="nuevaVenta.numeroFactura" label="Número de Factura" filled type="text"
                  :rules="[(val) => !!val || 'El número de factura es obligatorio']" class="q-mb-sm"
                  :readonly="isViewing" />
                <q-input v-model="nuevaVenta.fecha" label="Fecha" type="date" filled
                  :rules="[(val) => !!val || 'La fecha es obligatoria']" class="q-mb-sm" :readonly="isViewing" />
                <q-select v-model="selectedArticulo" label="Seleccionar Artículo" :options="articulos"
                  option-value="_id" option-label="nombre" filled emit-value class="q-mb-sm"
                  @update:model-value="addArticulo"  />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model.number="nuevaVenta.subtotal" label="Valor Subtotal" filled type="number" :readonly="true"
                  class="q-mb-sm" />
                <q-input v-model.number="nuevaVenta.iva" label="IVA (%)" filled type="number" class="q-mb-sm"
                  :readonly="isViewing" @input="calculateTotals" />
                <q-input v-model.number="nuevaVenta.total" label="Total" filled type="number" :readonly="true"
                  class="q-mb-sm" />
              </div>
            </div>

            <!-- Tabla de artículos -->
            <q-table :rows="nuevaVenta.articulos" :columns="articulosColumns" row-key="id" flat bordered
              class="tabla-views">
              <template v-slot:header="props">
                <tr>
                  <th v-for="col in props.cols" :key="col.name" :class="'tabla-header'">
                    <span>{{ col.label }}</span>
                  </th>
                </tr>
              </template>
              <template v-slot:body-cell-cantidad="props">
                <q-input v-model.number="props.row.cantidad" type="number" dense filled :readonly="isViewing"
                  @input="calculateTotals" />
              </template>
             
              <template v-slot:body-cell-opciones="props">
                <q-td :props="props" class="tabla-cell opciones">
                <q-btn flat color="negative" icon="delete" @click="removeArticulo(props.row.id)" v-if="!isViewing" />
              </q-td>
              </template>
            </q-table>

            <div class="text-center">
              <q-btn color="primary" label="Guardar" type="submit" class="q-mr-sm" v-if="!isViewing" />
              <q-btn label="Cancelar" color="negative" flat @click="cancelEdit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getData, postData, putData } from "../services/apiClient.js";
import { useAuthStore } from '../store/useAuth.js'
const rows = ref([]);
const articulos = ref([]);
const nuevaVenta = ref({
  tipo: 2,
  numeroFactura: "",
  fecha: "",
  articulos: [],
  subtotal: 0,
  iva: 19, // IVA por defecto en porcentaje
  total: 0,
  estado: 1
});

const selectedArticulo = ref(null);
const isEditing = ref(false);
const isViewing = ref(false);
const editingId = ref(null);
const isModalOpen = ref(false);
const formRef = ref(null);
let maximizedToggle = ref(true);
const authStore = useAuthStore()
const modalConfirmarEstado = ref(false);
const facturaSeleccionada = ref(null);
const loading = ref(false);

const columns = [
  { name: "numeroFactura", label: "Número Factura", align: "center", field: "numeroFactura" },
  {
    name: "cliente",
    label: "Cliente",
    align: "center",
    field: "cliente"
  },
  { name: "fecha", label: "Fecha", align: "center", field: "fecha", format: val => new Date(val).toLocaleDateString() },
  { name: "total", label: "Total", align: "center", field: "total" },
  { name: "estado", label: "Estado", align: "center", field: "estado", format: val => (val === 1 ? "Aprobado" : "Anulado") },
  { name: "opciones", label: "Opciones", align: "center" },
];

const articulosColumns = [
  { name: "nombre", label: "Artículo", field: "nombre", align: "center" },
  { name: "cantidad", label: "Cantidad", field: "cantidad", align: "center" },
  { name: "precio", label: "Precio", field: "precio", align: "center" },
  { name: "subtotal", label: "Subtotal", field: row => row.cantidad * row.precio, align: "center"  },
  { name: "opciones", label: "Opciones", align: "center" },
];

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


function openModal() {
  resetForm();
  isModalOpen.value = true;
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

function removeArticulo(articuloId) {
  nuevaVenta.value.articulos = nuevaVenta.value.articulos.filter(a => a.id !== articuloId);
  calculateTotals();
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

// Observa cambios en los artículos para recalcular automáticamente
watch(
  () => nuevaVenta.value.articulos,
  () => calculateTotals(),
  { deep: true }
);

 async function cargarArticulos() {
  articulos.value = await getData("articulos");
}
 


function editMovimiento(mov) {
  isEditing.value = true;
  isViewing.value = false;
  editingId.value = mov._id;
  nuevaVenta.value = { ...mov };
  isModalOpen.value = true;
}

function verFactura(r) {
  console.log("viewMovimiento", r);
  isEditing.value = false;
  isViewing.value = true;
  nuevaVenta.value = { ...r };
  isModalOpen.value = true;
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



function resetForm() {
  nuevaVenta.value = {
    tipo: 2,
    numeroFactura: "",
    fecha: "",
    articulos: [],
    subtotal: 0,
    iva: 16, // IVA por defecto
    total: 0,
    estado: 1
  };
  isEditing.value = false;
  isViewing.value = false;
  selectedArticulo.value = null;
}

function cancelEdit() {
  isModalOpen.value = false;
}

async function handleSubmit() {
  if (isEditing.value) {
    await putData(`movimientos/${editingId.value}`, nuevaVenta.value);
  } else {
    await postData("movimientos", nuevaVenta.value);
  }
  fetchMovimientos();
  isModalOpen.value = false;
}
async function toggleEstado(id, estado) {
  try {
    const newState = estado === "1" ? "0" : "1";
    await putData(`/movimientos/estado/${id}`, { estado: newState });

    fetchMovimientos();
  } catch (err) {
    console.error("Error al cambiar el estado del artículo:", err);
  }
}


onMounted(() => {
   getVentas()
  cargarArticulos();
 
});

const mostrarModalConfirmacion= async (venta) => {
  facturaSeleccionada.value = venta;
  modalConfirmarEstado.value = true;
};

const confirmarCambioEstado = async () => {
    loading.value = true;
    if (!facturaSeleccionada.value) return;
  
    const venta = facturaSeleccionada.value;
    venta.estado = venta.estado === 1 ? 0 : 1;
  
    try {
      const response = await putData(`movimientos/${venta._id}`, { estado: venta.estado });
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
    finally{
      loading.value = false;
    }
    
  };
  
  
  const cancelarCambioEstado = () => {
    modalConfirmarEstado.value = false;
  };
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


.tabla-cell.opciones button {
    padding: 5px 10px;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 4px;
  }
</style>