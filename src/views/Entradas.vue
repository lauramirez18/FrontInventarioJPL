<template>
    <q-page padding>
      <h2 class="text-center text-primary q-mb-lg">Movimientos de Salida</h2>
  
      <q-btn
        color="primary"
        label="Nuevo Movimiento de Salida"
        icon="add"
        class="q-mb-md"
        @click="openModal"
      />
  
      <!-- Modal Mejorado -->
      <q-dialog v-model="isModalOpen" persistent>
        <q-card class="q-pa-md q-card--bordered" style="max-width: 1000px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <q-card-section class="bg-primary text-white text-center">
            <h2>{{ isEditing ? 'Editar' : isViewing ? 'Ver Detalles' : 'Nuevo' }} Movimiento de Salida</h2>
          </q-card-section>
          <q-card-section>
            <q-form @submit.prevent="handleSubmit" ref="formRef">
              <div class="row q-col-gutter-lg">
                <!-- Columna izquierda -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="movimiento.numeroFactura"
                    label="Número de Factura"
                    filled
                    type="text"
                    :rules="[(val) => !!val || 'El número de factura es obligatorio']"
                    class="q-mb-sm"
                    :readonly="isViewing"
                  />
                  <q-input
                    v-model="movimiento.fecha"
                    label="Fecha"
                    type="date"
                    filled
                    :rules="[(val) => !!val || 'La fecha es obligatoria']"
                    class="q-mb-sm"
                    :readonly="isViewing"
                  />
                  <q-select
                    v-model="selectedArticulo"
                    label="Seleccionar Artículo"
                    :options="articulos"
                    option-value="_id"
                    option-label="nombre"
                    filled
                    emit-value
                    class="q-mb-sm"
                    @update:model-value="addArticulo"
                    :disable="isViewing"
                  />
                </div>
  
                <!-- Columna derecha -->
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="movimiento.valor"
                    label="Valor Subtotal"
                    filled
                    type="number"
                    :readonly="true"
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model.number="movimiento.iva"
                    label="IVA (%)"
                    filled
                    type="number"
                    class="q-mb-sm"
                    :readonly="isViewing"
                    @input="calculateTotals"
                  />
                  <q-input
                    v-model.number="movimiento.total"
                    label="Total"
                    filled
                    type="number"
                    :readonly="true"
                    class="q-mb-sm"
                  />
                </div>
              </div>
  
              <!-- Tabla de artículos -->
              <q-table
                :rows="movimiento.articulos"
                :columns="articulosColumns"
                row-key="id"
                flat
                bordered
                class="q-mb-md"
              >
                <template v-slot:body-cell-cantidad="props">
                  <q-input
                    v-model.number="props.row.cantidad"
                    type="number"
                    dense
                    filled
                    :readonly="isViewing"
                    @input="calculateTotals"
                  />
                </template>
                <template v-slot:body-cell-precio="props">
                  <q-input
                    v-model.number="props.row.precio"
                    type="number"
                    dense
                    filled
                    :readonly="isViewing"
                    @input="calculateTotals"
                  />
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    @click="removeArticulo(props.row.id)"
                    v-if="!isViewing"
                  />
                </template>
              </q-table>
  
              <!-- Botones de acción -->
              <div class="text-center">
                <q-btn
                  color="primary"
                  label="Guardar"
                  type="submit"
                  class="q-mr-sm"
                  v-if="!isViewing"
                />
                <q-btn
                  label="Cancelar"
                  color="negative"
                  flat
                  @click="cancelEdit"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
  
      <!-- Tabla principal -->
      <q-table
        :rows="movimientos"
        :columns="columns"
        row-key="_id"
        bordered
        flat
        class="q-mt-md"
      >
        <template v-slot:body-cell-actions="props">
          <q-btn
            flat
            color="primary"
            icon="visibility"
            @click="viewMovimiento(props.row)"
            class="q-mr-sm"
          />
          <q-btn
            flat
            color="secondary"
            icon="edit"
            @click="editMovimiento(props.row)"
            class="q-mr-sm"
          />
          <q-btn
            flat
            :color="props.row.estado === '1' ? 'green' : 'red'"
            :icon="props.row.estado === '1' ? 'done' : 'block'"
            @click="toggleEstado(props.row._id, props.row.estado)"
          />
        </template>
      </q-table>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from "vue";
  import { getData, postData, putData } from "../services/apiClient.js";
  
  const movimientos = ref([]);
  const articulos = ref([]);
  const movimiento = ref({
    tipo: 2,
    numeroFactura: "",
    fecha: "",
    articulos: [],
    valor: 0,
    iva: 16, // IVA por defecto en porcentaje
    total: 0,
    estado: 1
  });
  
  const selectedArticulo = ref(null);
  const isEditing = ref(false);
  const isViewing = ref(false);
  const editingId = ref(null);
  const isModalOpen = ref(false);
  const formRef = ref(null);
  
  const columns = [
    { name: "numeroFactura", label: "Número Factura", align: "left", field: "numeroFactura" },
    { name: "fecha", label: "Fecha", align: "left", field: "fecha", format: val => new Date(val).toLocaleDateString() },
    { name: "valor", label: "Valor", align: "right", field: "valor" },
    { name: "total", label: "Total", align: "right", field: "total" },
    { name: "estado", label: "Estado", align: "center", field: "estado", format: val => (val === "1" ? "Activo" : "Inactivo") },
    { name: "actions", label: "Acciones", align: "center" },
  ];
  
  const articulosColumns = [
    { name: "nombre", label: "Artículo", field: "nombre", align: "left" },
    { name: "cantidad", label: "Cantidad", field: "cantidad", align: "center" },
    { name: "precio", label: "Precio", field: "precio", align: "center" },
    { name: "subtotal", label: "Subtotal", field: row => row.cantidad * row.precio, align: "right" },
    { name: "actions", label: "Acciones", align: "center" },
  ];
  
  
  function openModal() {
    resetForm();
    isModalOpen.value = true;
  }
  
  function addArticulo(articuloId) {
    if (!articuloId) return;
    const articulo = articulos.value.find(a => a._id === articuloId);
    if (articulo && !movimiento.value.articulos.some(a => a.id === articuloId)) {
      movimiento.value.articulos.push({
        id: articulo._id,
        nombre: articulo.nombre,
        cantidad: 1,
        precio: articulo.precio || 0,
      });
    }
    calculateTotals();
  }
  
  function removeArticulo(articuloId) {
    movimiento.value.articulos = movimiento.value.articulos.filter(a => a.id !== articuloId);
    calculateTotals();
  }
  
  function calculateTotals() {
    // Calcula el subtotal
    const subtotal = movimiento.value.articulos.reduce(
      (acc, art) => acc + art.cantidad * art.precio,
      0
    );
    
    // Calcula el IVA y el total
    const ivaAmount = (subtotal * movimiento.value.iva) / 100;
    movimiento.value.valor = subtotal;
    movimiento.value.total = subtotal + ivaAmount;
  }
  
  // Observa cambios en los artículos para recalcular automáticamente
  watch(
    () => movimiento.value.articulos,
    () => calculateTotals(),
    { deep: true }
  );
  
  async function fetchArticulos() {
    articulos.value = await getData("articulos");
  }
  
  async function fetchMovimientos() {
    try {
      const response = await getData("/movimientos/tipo/2");
      console.log("Movimientos cargados:", response);
      movimientos.value = response.movimientos || [];
    } catch (err) {
      console.error("Error al cargar los movimientos:", err);
    }
  }
  
  function editMovimiento(mov) {
    isEditing.value = true;
    isViewing.value = false;
    editingId.value = mov._id;
    movimiento.value = { ...mov };
    isModalOpen.value = true;
  }
  
  function viewMovimiento(mov) {
    isEditing.value = false;
    isViewing.value = true;
    movimiento.value = { ...mov };
    isModalOpen.value = true;
  }
  
  function resetForm() {
    movimiento.value = {
      tipo: 2,
      numeroFactura: "",
      fecha: "",
      articulos: [],
      valor: 0,
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
      await putData(`movimientos/${editingId.value}`, movimiento.value);
    } else {
      await postData("movimientos", movimiento.value);
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
    fetchArticulos();
    fetchMovimientos();
  });
  </script>
  