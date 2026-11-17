import {
    collection,
    doc,
    onSnapshot,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

// Regla de negocio compartida con la app móvil: 1 punto por cada dólar completo
export function calcularPuntos(total) {
    return Math.floor(total);
}

export async function crearPedido({ usuarioId, items, total, metodoPago = "efectivo" }) {
    const referenciaUsuario = doc(db, "usuarios", usuarioId);
    const referenciaPedido = doc(collection(db, "pedidos"));
    const puntosGanados = calcularPuntos(total);

    const pedido = {
        usuarioId,
        items,
        total,
        estado: "pendiente",
        fecha: new Date().toISOString(),
        metodoPago,
        referenciaPago: null,
    };

    // El pedido y la suma de puntos se guardan juntos: se aplican los dos o ninguno
    const puntosTotales = await runTransaction(db, async (transaccion) => {
        const usuario = await transaccion.get(referenciaUsuario);
        const nuevosPuntos = (usuario.data()?.puntos ?? 0) + puntosGanados;

        transaccion.set(referenciaPedido, { ...pedido, creado: serverTimestamp() });
        transaccion.update(referenciaUsuario, { puntos: nuevosPuntos });

        return nuevosPuntos;
    });

    return { pedido: { id: referenciaPedido.id, ...pedido }, puntosGanados, puntosTotales };
}

// Las reglas de Firestore solo permiten este cambio al administrador
export function cambiarEstadoPedido(id, estado) {
    return updateDoc(doc(db, "pedidos", id), { estado });
}

function escuchar(consulta, alCambiar, alFallar) {
    return onSnapshot(
        consulta,
        (resultado) => {
            const pedidos = resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
            pedidos.sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
            alCambiar(pedidos);
        },
        alFallar
    );
}

// Para el cliente: solo sus pedidos, hechos desde la web o desde el teléfono
export function escucharPedidosDeUsuario(usuarioId, alCambiar, alFallar) {
    const consulta = query(collection(db, "pedidos"), where("usuarioId", "==", usuarioId));
    return escuchar(consulta, alCambiar, alFallar);
}

// Para el admin: todos los pedidos, en tiempo real
export function escucharTodosLosPedidos(alCambiar, alFallar) {
    return escuchar(collection(db, "pedidos"), alCambiar, alFallar);
}