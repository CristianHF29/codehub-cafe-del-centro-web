import { peticion } from "./api";

export function obtenerPedidos() {
    return peticion("/pedidos");
}

export function obtenerPedidosDeUsuario(usuarioId) {
    return peticion(`/pedidos?usuarioId=${usuarioId}`);
}

export function obtenerPedido(id) {
    return peticion(`/pedidos/${id}`);
}

export function crearPedido(pedido) {
    return peticion("/pedidos", {
        method: "POST",
        body: JSON.stringify(pedido)
    });
}

export function cambiarEstadoPedido(id, estado) {
    return peticion(`/pedidos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ estado })
    });
}