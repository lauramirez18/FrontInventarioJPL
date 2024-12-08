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
            <button @click="ver(props.row)">👁️</button>
          </q-td>
        </template>

        <template v-slot:body-cell-fecha="props">
          <q-td :props="props" class="q-pa-sm">
            {{ new Date(props.row.createdAt).toLocaleDateString('es-ES') }}
          </q-td>
        </template>



      </q-table>
    </div>

    <!-- Este es el codigo del cuadro de dialogo -->

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
            <h4 class="text-center text-weight-bold">Detalle de factura</h4>
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
              <q-input v-model="fecha" label="Fecha "  disable />
              <q-input :model-value="totalProductos" label="Total factura" disable />
            </div>
          </div>

        </q-card-section>
        <q-card-section class="tabla-views">
          <div>
            <div style="display: flex; justify-content: end; gap: 10px">
              <q-select filled clearable v-model="busqueda" use-input input-debounce="0"
                label="Buscar producto por nombre..." :options="productosFiltrados" option-label="nombre"
                @filter="filtro" style="width: 40%" transition-show="flip-up" transition-hide="flip-down">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      <q-btn style="width: 20%" @click="open = true">➕</q-btn>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <button @click="agregar()">🔎</button>
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

      <template v-slot:body-cell-articulos="props">
  <q-td :props="props" class="q-pa-sm">
    <div v-for="(articulo, index) in props.row.articulos" :key="index">
      <span>{{ articulo._id ? articulo._id.nombre : articulo.nombre }}</span> 
    </div>
  </q-td>
</template>

<template v-slot:body-cell-precio="props">
  <q-td :props="props" class="q-pa-sm">
    <!-- Mostrar el precio del producto -->
    <div v-for="(articulo, index) in props.row.articulos" :key="index">
      <span>{{ articulo.precio }}</span> 
    </div>
  </q-td>
</template>


<q-td key="cantidad" :props="props">{{ props.row.cantidad }}</q-td>


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
    <q-dialog v-model="open">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum
          repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis
          perferendis totam, ea at omnis vel numquam exercitationem aut, natus
          minima, porro labore.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
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

let abrir = ref(false);
let maximizedToggle = ref(true);
let total = ref(0);
let numeroFactura = ref("");
let fecha = ref("");
let cliente = ref("");
let productosFiltrados = ref([]);
let busqueda = ref(null);
let open = ref(false);
const authStore = useAuthStore()

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

  { name: "total", label: "Valor Total", align: "center", field: "total" },
  { name: "opciones", label: "Vizualización", align: "center", field: "opciones" },
]);
onMounted(async () => {
  await getVentas();
})
const rows = ref([]);

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
 
  { name: "valor", label: "Subtotal", align: "center", field: row => row.cantidad * row.precio },
  { name: "opciones", label: "Opciones", align: "center", field: "opciones" },
]);

const articulos = ref([]);
const articulosApi = ref([]);

const cargarDetallesProductos = async (articulos) => {
  try {
    const response = await getData('articulos'); // Obtener todos los productos
    console.log(response); // Verificar los datos que devuelve la API

    if (Array.isArray(response) && articulos) {
      articulos.forEach((articuloFactura) => {
        // Verifica si el artículo tiene un _id y busca el producto
        if (Array.isArray(response)) {
          const producto = response.find((prod) => prod._id === articuloFactura.id);
          if (producto) {
            // Actualiza el nombre, precio y otros valores de la fila
            const index = articulos.value.findIndex(p => p.id === articuloFactura.id);
            if (index !== -1) {
              articulos.value[index].nombre = producto.nombre || '';   // Asigna el nombre
              articulos.value[index].precio = producto.precio || 0;     // Asigna el precio
              articulos.value[index].iva = producto.iva || 0;           // Asigna el IVA (si es necesario)
            }
          }
        }
      });
    }
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
};


function ver(r) {
  abrir.value = true;
  console.log(r);

  // Verificar si 'productos' está definido en 'r'
  if (r.articulos && Array.isArray(r.articulos)) {
    cliente.value = r.cliente;
    fecha.value = r.fecha;
    numeroFactura.value = r.numeroFactura;

    // Solo ejecutar .map() si 'productos' es un arreglo
    articulos.value = r.articulos.map((articulo) => {
      return {
        id: articulo._id,
        nombre: articulo.nombre || '',
        precio: 0,
        cantidad: articulo.cantidad,
        iva: 0,
      };
    });

    // Llamada para cargar los detalles de los productos
    cargarDetallesProductos(r.articulos);
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

function verDetalle(r) {
  console.log(r);
}

const filtro = (val, update) => {
  /* productosFiltrados.value =  !nombre ? productosApi.value : productosApi.value.filter((item)=> item.nombre.toLowerCase().includes(nombre)) 
  console.log(productosFiltrados.value); */

  if (val == "") {
    update(() => {
      productosFiltrados.value = articulosApi.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    productosFiltrados.value = articulosApi.value.filter((item) =>
      item.nombre.toLowerCase().includes(needle)
    );
  });
};

const agregar = () => {
  console.log(busqueda.value);
  if (busqueda.value) {
    let valido = articulos.value.some((item) => {
      return item.id == busqueda.value.id;
    });
    if (valido) {
      console.log("este producto ya se encuentra");
    } else {
      articulos.value.unshift({
        id: busqueda.value.id,
        nombre: busqueda.value.nombre,
        cantidad: 0,
        precioUnitario: busqueda.value.precioUnitario,
        iva: busqueda.value.iva,
      });
    }

  } else {
    console.log("Seleccione un producto...");
  }
  busqueda.value = "";
};

const totalProductos = computed(() => {
  return articulos.value
    .reduce(
      (acum, current) => acum + current.cantidad * current.precioUnitario,
      0
    )
    .toLocaleString("es-CO");
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