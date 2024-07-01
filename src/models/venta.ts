import type { Cliente } from './cliente'
import type { Producto } from './producto'
import type { Empleado } from './empleado'

export interface Venta {
  id: number;
  cantidad: number;
  precioUnitario: number;
  totalVenta: number;
  fechaCreacion: Date;
  cliente: Cliente;
  producto: Producto;
  empleado: Empleado;


}
