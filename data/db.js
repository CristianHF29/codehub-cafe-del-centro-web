import { usuarios as usuariosIniciales } from "./usuarios";
import { productos as productosIniciales } from "./productos";
import { pedidos as pedidosIniciales } from "./pedidos";

// Next compila cada ruta de la API por separado y cada una recibía su propia copia
// de los arreglos. Guardarlos en globalThis hace que todas compartan los mismos datos.
const almacen = globalThis.__cafeDelCentro ?? {
    usuarios: structuredClone(usuariosIniciales),
    productos: structuredClone(productosIniciales),
    pedidos: structuredClone(pedidosIniciales)
};

globalThis.__cafeDelCentro = almacen;

export const { usuarios, productos, pedidos } = almacen;

export function siguienteId(lista) {
    return lista.reduce((mayor, item) => Math.max(mayor, item.id), 0) + 1;
}