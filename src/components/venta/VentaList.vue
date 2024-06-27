<script setup lang="ts">
import type { Venta } from '@/models/venta'
import { onMounted, ref } from 'vue'
import http from '@/plugins/axios'
import router from '@/router'

// Definir las propiedades del componente
const props = defineProps<{
  ENDPOINT_API: string
}>()

const ENDPOINT = props.ENDPOINT_API ?? ''
var ventas = ref<Venta[]>([])

// Método para obtener las ventas desde el API
async function getVentas() {
  ventas.value = await http.get(ENDPOINT).then((response) => response.data)
}

// Método para formatear la fecha
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son de 0 a 11
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

onMounted(() => {
  getVentas()
})
</script>

<template>
  <div class="container">
    <div class="row">
      <h2>Lista de Ventas</h2>
      <div class="col-12">
        <RouterLink to="/ventas/crear">
          <font-awesome-icon icon="fa-solid fa-plus" /> Generar Nueva Venta
        </RouterLink>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Cliente</th>
            <th scope="col">Total de venta</th>
            <th scope="col">Fecha de venta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venta, index) in ventas.values()" :key="venta.id">
            <th scope="row">{{ index + 1 }}</th>
            <td>{{ venta.cliente.nombres }}</td>
            <td>{{ venta.totalVenta }}</td>
            <td>{{ formatDate(venta.fechaCreacion) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table th{
   background-color: #a9a9a9; /* Color plomo */
  border: 1px solid #000000; /* Bordes negros */
}
.table td {
  background-color:rgba(78,115,223); /* Color plomo */
  border: 1px solid #000000; /* Bordes negros */
}


.table td {
  color: #333; /* Texto oscuro para las celdas */
}
</style>
