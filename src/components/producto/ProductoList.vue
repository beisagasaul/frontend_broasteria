<script setup lang="ts">
import type { Producto } from '@/models/producto'
import { onMounted, ref } from 'vue'
import http from '@/plugins/axios'
import router from '@/router'

const props = defineProps<{
  ENDPOINT_API: string
}>()

const ENDPOINT = props.ENDPOINT_API ?? ''
var productos = ref<Producto[]>([])

async function getProductos() {
  productos.value = await http.get(ENDPOINT).then((response) => response.data)
}

function toEdit(id: number) {
  router.push(`/productos/editar/${id}`)
}

async function toDelete(id: number) {
  var r = confirm('¿Está seguro que se desea eliminar el producto?')
  if (r == true) {
    await http.delete(`${ENDPOINT}/${id}`).then(() => getProductos())
  }
}

onMounted(() => {
  getProductos()
})
</script>

<template>
  <div class="container">
   

    <div class="row">
      <h2>Productos</h2>
      <div class="col-12">
        <RouterLink to="/productos/crear"
          ><font-awesome-icon icon="fa-solid fa-plus" /> Agregar Nuevo Producto</RouterLink
        >
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th scope="col">N°</th>
            <th scope="col">Categoria</th>
            <th scope="col">Nombre</th>
            <th scope="col">Descripcion</th>
            <th scope="col">Precio</th>
            <th scope="col">stock</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in productos.values()" :key="producto.id">
            <th scope="row">{{ index + 1 }}</th>
            <td>{{producto.categoria.nombre }}</td>
            <td>{{producto.nombre }}</td>
            <td>{{producto.descripcion }}</td>
            <td>{{producto.precioUnitario }}</td>
            <td>{{producto.stock }}</td>
          
            <td>
              <button class="btn btn-link" @click="toEdit(producto.id)">
                <font-awesome-icon icon="fa-solid fa-edit" />
              </button>
              <button class="btn btn-link" @click="toDelete(producto.id)">
                <font-awesome-icon icon="fa-solid fa-trash" />
              </button>
            </td>
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
