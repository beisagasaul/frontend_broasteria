
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import http from '@/plugins/axios';
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import type { Producto } from '@/models/producto';
import type { Cliente } from '@/models/cliente';

const clientes = ref<Cliente[]>([]);
const productos = ref<Producto[]>([]);
const detallesVenta = ref<Array<{
  cantidad: number;
  precioUnitario: number;
  totalVenta: number;
  idCliente: string;
  idProducto: string;
  descripcion?: string;
  stock?: number;
  descuento: number;
}>>([]);

const props = defineProps<{
  ENDPOINT_API: string;
}>();

const router = useRouter();
const selectedClienteId = ref<string>('');
const crearClienteModal = ref<boolean>(false);

const nombres = ref('');
const apellidos = ref('');
const fechaCreacion = ref(new Date().toISOString().substring(0, 10)); // Campo para la fecha de la transacción

async function getClientes() {
  clientes.value = await http.get('clientes').then(response => response.data);
}

async function getProductos() {
  productos.value = await http.get('productos').then(response => response.data);
}

onMounted(() => {
  getClientes();
  getProductos();
});

function mostrarTotalVenta() {
  const sumaTotalVenta = detallesVenta.value.reduce((total, venta) => total + venta.totalVenta, 0).toFixed(2);
  alert(`La suma total de las ventas es: ${sumaTotalVenta}`);
}

function agregarDetalle() {
  detallesVenta.value.push({
    cantidad: 0,
    precioUnitario: 0,
    totalVenta: 0.00,
    idCliente: selectedClienteId.value,
    idProducto: '',
    descripcion: '',
    stock: 0,
    descuento: 0
  });
}

watch(detallesVenta, async (detalles) => {
  for (let i = 0; i < detalles.length; i++) {
    const detalle = detalles[i];
    if (detalle.idProducto) {
      try {
        const producto = await http.get(`productos/${detalle.idProducto}`).then(response => response.data);
        detalle.stock = producto.stock - detalle.cantidad;
        detalle.precioUnitario = producto.precio;
        detalle.totalVenta = Number(((detalle.cantidad * detalle.precioUnitario) * (1 - detalle.descuento / 100)).toFixed(2));
      } catch (error) {
        console.error(`Error al obtener el producto ${detalle.idProducto}:`, error);
      }
    }
  }
}, { deep: true });

async function crearDetalles() {
  try {
    const ventaDetalles = detallesVenta.value.map(detalle => ({
      ...detalle,
      idCliente: selectedClienteId.value,
      fechaCreacion: fechaCreacion.value
    }));

    await Promise.all(
      ventaDetalles.map(async (detalle) => {
        await http.post(props.ENDPOINT_API, detalle);
      })
    );
    router.push('/detalles');
  } catch (error) {
    console.error('Error al crear los detalles de venta:', error);
  }
}

async function crearCliente() {
  try {
    const response = await http.post('clientes', { nombres: nombres.value, 
    apellidos: apellidos.value,direccion:direccion.value,
     telefono: telefono.value,
     email: email.value });
    console.log('Respuesta del servidor:', response);
    await getClientes(); // Actualiza la lista de clientes
    selectedClienteId.value = response.data.id; // Selecciona automáticamente el nuevo cliente
    crearClienteModal.value = false; // Cierra el modal
  } catch (error) {
    console.error('Error al crear cliente:', error);
    alert('Hubo un error al crear el cliente. Por favor, inténtalo de nuevo.');
  }
}

function goBack() {
  router.go(-1);
}
</script>




<template>
  <div class="container">

    <div class="row">
      <div class="col-12 text-center mt-3 mb-3">
        <h2 class="simpsons-font">Nueva Venta</h2>
      </div>
    </div>

    <div class="row">
      <form @submit.prevent="crearDetalles">
        <div class="form-floating mb-3">
          <select v-model="selectedClienteId" class="form-select" required>
            <option v-for="cliente in clientes" :value="cliente.id" :key="cliente.id">
              {{ cliente.nombres + ' ' + cliente.apellidos }}
            </option>
          </select>
          <label for="cliente">Cliente</label>
          <button type="button" class="btn btn-link" @click="crearClienteModal = true">Registrar Cliente</button>
        </div>
        
       
        <div v-for="(detalle, index) in detallesVenta" :key="index" class="row align-items-center">
          <div class="col">
            <div class="form-floating mb-3">
              <select v-model="detalle.idProducto" class="form-select" required>
                <option v-for="producto in productos" :value="producto.id" :key="producto.id">
                  {{ producto.nombre }}
                </option>
              </select>
              <label for="producto">Producto</label>
            </div>
            <div v-if="detalle.descripcion" class="floating-info mb-3">
              <p>{{ detalle.descripcion }}</p>
            </div>
            <div v-if="detalle.stock !== undefined" class="floating-info mb-3">
              <p>Stock: {{ detalle.stock }} <i class="fas fa-box"></i></p>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-3">
              <input type="number" class="form-control" v-model="detalle.cantidad" placeholder="Cantidad" required />
              <label for="cantidad">Cantidad</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-3">
              <input type="number" class="form-control" v-model="detalle.precioUnitario" placeholder="PrecioUnitario"
                step="0.01" required />
              <label for="precioUnitario">Precio por Unidad</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-3">
              <input type="number" class="form-control" v-model="detalle.descuento" placeholder="Descuento (%)" min="0"
                required />
              <label for="descuento">Descuento (%)</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-3">
              <input type="text" class="form-control"
                :value="detalle.totalVenta.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })"
                placeholder="totalVenta" required readonly />
              <label for="totalVenta">Total de Venta</label>
            </div>
          </div>
        </div>

        <div class="text-center mt-3">
          <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
            <div class="btn-group me-2" role="group" aria-label="First group">
              <button type="button" class="btn btn-primary btn-lg" @click="agregarDetalle">
                Agregar Venta
              </button>
            </div>
            <div class="btn-group" role="group" aria-label="Second group">
              <button type="submit" class="btn btn-primary btn-lg">Guardar Venta</button>
            </div>
          </div>
          <button class="btn btn-primary btn-lg" @click.prevent="mostrarTotalVenta">
            Total a Pagar
          </button>
        </div>
      </form>
    </div>
    <div class="text-left">
      <button class="btn btn-link" @click="goBack">Volver</button>
    </div>

    <!-- Modal para crear nuevo cliente -->
    <div v-if="crearClienteModal" class="modal fade show" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Crear Nuevo Cliente</h5>
            <button type="button" class="btn-close" @click="crearClienteModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="nombre" v-model="nombres" placeholder="Nombre" required />
              <label for="nombre">Nombres</label>
            </div>
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="apellido" v-model="apellidos" placeholder="Apellido"
                required />
              <label for="apellido">Apellidos</label>
            </div>
            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="direccion" v-model="direccion"
                placeholder="Dirección" maxlength="20" required />
              <label for="direccion">Dirección</label>
            </div>

            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="telefono" v-model="telefono"
                placeholder="Teléfono" maxlength="20" required />
              <label for="telefono">Numero de Celular</label>
            </div>

            <div class="form-floating mb-3">
              <input type="text" class="form-control" id="email" v-model="email"
                placeholder="E-Mail" maxlength="20" required />
              <label for="email">E-mail</label>
            </div>

          










          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="crearClienteModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="crearCliente">Crear</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
/* ... estilos existentes ... */

/* Estilos para el modal */
.modal.fade.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
  max-width: 500px;
  margin: 1.75rem auto;
}
</style>