import { peticion } from "./api";

export function obtenerProductos() {
    return peticion("/productos");
}

export function obtenerProducto(id) {
    return peticion(`/productos/${id}`);
}

export function crearProducto(producto) {
    return peticion("/productos", {
        method: "POST",
        body: JSON.stringify(producto)
    });
}

export function actualizarProducto(id, cambios) {
    return peticion(`/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(cambios)
    });
}

export function eliminarProducto(id) {
    return peticion(`/productos/${id}`, { method: "DELETE" });
}