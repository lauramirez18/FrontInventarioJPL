<template>
  <q-page padding>
    <h4 class="text-center text-weight-bold">Ventas</h4>
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

      <template v-slot:body-cell-articulos="props">
  <q-td :props="props" class="q-pa-sm">
    <div v-for="(articulo, index) in props.row.articulos" :key="index">
      <span>{{ articulo._id ? articulo._id.nombre : articulo.nombre }}</span> 
    </div>
  </q-td>
</template>

<template v-slot:body-cell-precio="props">
  <q-td :props="props" class="q-pa-sm">
    <div v-for="(articulo, index) in props.row.articulos" :key="index">
      <span>{{ articulo._id.precio }}</span> 
    </div>
  </q-td>
</template>


<template v-slot:body-cell-fecha="props">
  <q-td :props="props" class="q-pa-sm">
    {{ new Date(props.row.createdAt).toLocaleDateString('es-ES') }}
  </q-td>
</template>



<template v-slot:body-cell-cantidad="props">
  <q-td :props="props" class="q-pa-sm">
    <div v-for="(articulo, index) in props.row.articulos" :key="index">
      <span>{{ articulo.cantidad }}</span> 
    </div>
  </q-td>
</template>

      
      <template v-slot:body-cell-estado="props">
        <q-td :props="props" class="q-pa-sm">
          <span style="color: green;" v-if="props.row.estado == 1">Aprobado</span>
          <span style="color: red;" v-else>Anulado</span>
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
    <q-dialog v-model="modalAgregarVenta" persistent>
  <q-card>
    <div class="text-h6">Agregar Nueva Venta</div>
    <q-card-section>
      
      <q-input
        v-model="nuevaVenta.numeroFactura"
        label="No. Factura"
        filled
        type="number"
        :rules="[val => val && val.length > 0 || 'El número de factura es obligatorio']"
      />

      <!-- Artículos seleccionados -->
      <div v-for="(articulo, index) in nuevaVenta.articulos" :key="index" class="q-mb-md">
        <q-select
          v-model="articulo.articuloId"
          :options="articulosDisponibles"
          label="Seleccionar Artículo"
          filled
          option-label="nombre"
          option-value="_id"
          @input="actualizarValorArticulo(index)"
          :rules="[val => val && val.length > 0 || 'Debe seleccionar un artículo']"
        />
        
        <q-input
          v-model="articulo.cantidad"
          label="Cantidad"
          filled
          type="number"
          :rules="[val => val && val > 0 || 'La cantidad debe ser mayor a 0']"
          @input="calcularTotal(index)"
        />

        <!-- Eliminar artículo -->
        <q-btn icon="remove" color="negative" flat @click="eliminarArticulo(index)" />
      </div>

      <q-btn label="Agregar otro artículo" @click="agregarArticulo" class="q-mb-md" />

      <q-input
        v-model="nuevaVenta.valor"
        label="Valor"
        filled
        readonly
        type="number"
      />
      <q-input
        v-model="nuevaVenta.iva"
        label="IVA (%)"
        filled
        type="number"
        :rules="[val => val && val >= 0 || 'El IVA no puede ser negativo']"
        @input="calcularTotal"
      />
      <q-input
        v-model="nuevaVenta.total"
        label="Total"
        filled
        readonly
        type="number"
      />
    </q-card-section>

    <q-card-actions>
      <q-btn label="Cancelar" color="secondary" flat @click="cerrarFormulario" />
      <q-btn label="Guardar" color="primary" flat @click="postVenta" :disable="!formValido" />
    </q-card-actions>
  </q-card>
</q-dialog>

    <q-dialog v-model="modalEditarVenta" persistent>
    <q-card>
      <div class="text-h6">Editar Venta</div>
      <q-card-section>
        <!-- Numero de Factura (no editable) -->
        <q-input
          v-model="ventaEditada.numeroFactura"
          label="No. Factura"
          filled
          type="number"
          :readonly="true"
          disabled
        />

       
        <q-select
          v-model="ventaEditada.articuloSeleccionado"
          :options="articulosDisponibles"
          label="Seleccionar Artículo"
          filled
          option-label="nombre"
          option-value="_id"
          @input="actualizarValorArticulo"
          :rules="[val => val && val.length > 0 || 'Debe seleccionar un artículo']"
        />

        
        <q-input
          v-model="ventaEditada.cantidad"
          label="Cantidad"
          filled
          type="number"
          :rules="[val => val && val > 0 || 'La cantidad debe ser mayor a 0']"
          @input="calcularTotal"
        />

        <!-- Valor antes de IVA (calculado) -->
        <q-input
          v-model="ventaEditada.valor"
          label="Valor"
          filled
          readonly
          type="number"
        />

        <!-- IVA -->
        <q-input
          v-model="ventaEditada.iva"
          label="IVA (%)"
          filled
          type="number"
          :rules="[val => val && val >= 0 || 'El IVA no puede ser negativo']"
          @input="calcularTotal"
        />

        <!-- Total (calculado) -->
        <q-input
          v-model="ventaEditada.total"
          label="Total"
          filled
          readonly
          type="number"
        />

      

        </q-card-section>

        <q-card-actions>
          <q-btn label="Cancelar" color="secondary" flat @click="cerrarModalEditar" />
          <q-btn label="Guardar Cambios" color="primary" flat @click="putVenta" />
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
    name: "numeroFactura",
    align: "center",
    label: "No. Factura",
    field: "numeroFactura",
    sortable: true,
    style: "font-weight: bold;",
  },
  {
    name: "fecha",
    align: "center",
    label: "Fecha",
    field: "createdAt",
    sortable: true,
    style: "font-weight: bold;",
  },
  {
    name: "articulos",
    align: "center",
    label: "Articulos",
    field: "articulos",
    sortable: true,
    style: "font-weight: bold;",
  },
  {
    name:"precio",
    align: "center",
    label: "Precio",
    field: "precio",
    sortable: true,
    style: "font-weight: bold;",
  },
  {
    name: "cantidad",
    align: "center",
    label: "Cantidad",
    field: "cantidad",
    sortable: true,
    style: "font-weight: bold;",
  },

  {
    name: "valor",
    align: "center",
    label: "Valor",
    field: "valor",
    sortable: true,
    style: "font-weight: bold;",
  },
  
  {
    name: "iva",
    align: "center",
    label: "IVA",
    field: "iva",
    sortable: true,
    style: "font-weight: bold;",
  },
  
{
    name: "total",
    align: "center",
    label: "Total",
    field: "total",
    sortable: true,
    style: "font-weight: bold;",
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
const modalAgregarVenta = ref(false);
const modalEditarVenta = ref(false);

const nuevaVenta = ref({
  numeroFactura: '',
 articulos: [],
  cantidad: 1,
  valor: 0,
  iva: 0,
  total: 0,
  
});

const agregarArticulo = () => {
  nuevaVenta.value.articulos.push({
    articuloId: '',
    cantidad: 1,
  });
};

// Eliminar artículo
const eliminarArticulo = (index) => {
  nuevaVenta.value.articulos.splice(index, 1);
};



const ventaEditada = ref({
  _id: '',
  numeroFactura: '',
  articuloSeleccionado: '',
  cantidad: 1,
  valor: 0,
  iva: 0,
  total: 0,
  
});

const articulosDisponibles = ref([]);  


const cargarArticulos = async () => {
  try {
    const response = await getData('articulos'); 
    articulosDisponibles.value = response;  
  } catch (error) {
    console.error('Error al cargar los artículos:', error);
    Notify.create({
      message: 'Error al cargar los artículos',
      color: 'red',
      icon: 'error',
      position: 'top',
      timeout: 3000,
    });
  }
};


onMounted(() => {
  getVentas();
  cargarArticulos();
});

const ventaSeleccionado = ref(null);
const authStore = useAuthStore()

const calcularTotal = (index) => {
  let valorTotal = 0;
  let valorArticulo = 0;
  
  nuevaVenta.value.articulos.forEach((articulo, idx) => {
    if (articulo.articuloId && articulo.cantidad > 0) {
      const item = articulosDisponibles.value.find((art) => art._id === articulo.articuloId);
      if (item) {
        valorArticulo = item.precio * articulo.cantidad;
        valorTotal += valorArticulo;
      }
    }
  });

  nuevaVenta.value.valor = valorTotal;
  nuevaVenta.value.total = valorTotal + (valorTotal * nuevaVenta.value.iva) / 100;
};

// Actualizar el valor del artículo cuando se selecciona uno
const actualizarValorArticulo = (index) => {
  calcularTotal(index);
};

const formValido = computed(() => {

  return nuevaVenta.value.numeroFactura &&
  nuevaVenta.value.articulos &&
    nuevaVenta.value.cantidad > 0 &&
    nuevaVenta.value.iva >= 0
});


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

const mostrarModalConfirmacion = (venta) => {
  ventaSeleccionado.value = venta;
  modalConfirmarEstado.value = true;
}

const abrirFormulario = () => {
  modalAgregarVenta.value = true;
}

const cerrarFormulario = () => {
  modalAgregarVenta.value = false;
  resetFormulario();
}

const resetFormulario = () => {
  nuevaVenta.value = {
    articulos: [],
    cantidad: 1,
    valor: 0,
    iva: 0,
    total: 0,
  };
}

const postVenta = async () => {
  try {
   
    console.log(nuevaVenta.value);
    
    const response = await postData('movimientos', nuevaVenta.value);
    console.log('Venta creada con éxito', response);
    modalAgregarVenta.value = false;

    Notify.create({
      message: 'Venta registrada exitosamente',
      color: 'green',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });
    await getVentas();
    resetFormulario();
  } catch (error) {
    console.log('Error al crear nueva venta:', error.response ? error.response.data : error);
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

const infoVentaEditar = (cliente) => {
  ventaEditada.value = cliente;
  modalEditarVenta.value = true;
}

const cerrarModalEditar = () => {
  modalEditarVenta.value = false;
}

const putVenta = async () => {
  try {

    ventaEditada.value.nombre = ventaEditada.value.nombre.trim();
    ventaEditada.value.identificacion = ventaEditada.value.identificacion.trim();
    ventaEditada.value.direccion = ventaEditada.value.direccion.trim();
    ventaEditada.value.telefono = ventaEditada.value.telefono.trim();
    ventaEditada.value.email = ventaEditada.value.email.trim();


    const response = await putData(`terceros/${ventaEditada.value._id}`, ventaEditada.value);
    console.log('Proveedor editado con éxito', response);


    Notify.create({
      message: 'Proveedor editado con éxito',
      color: 'green',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });


    modalEditarVenta.value = false;
    await getVentas();

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
  if (!ventaSeleccionado.value) return;

  const venta = ventaSeleccionado.value;
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
    await getVentas();
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
