import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Mismo orden que usa la app móvil para mostrar el menú
const consultaProductos = () => query(collection(db, "productos"), orderBy("orden"));

function convertir(documento) {
    return { id: documento.id, ...documento.data() };
}

export async function obtenerProductos() {
    const resultado = await getDocs(consultaProductos());
    return resultado.docs.map(convertir);
}

// El catálogo se escucha en tiempo real: si el admin edita un producto,
// el cambio aparece en la web y en el teléfono sin recargar
export function escucharProductos(alCambiar, alFallar) {
    return onSnapshot(
        consultaProductos(),
        (resultado) => alCambiar(resultado.docs.map(convertir)),
        alFallar
    );
}

export async function crearProducto(producto) {
    const referencia = await addDoc(collection(db, "productos"), producto);
    return { id: referencia.id, ...producto };
}

export async function actualizarProducto(id, cambios) {
    await updateDoc(doc(db, "productos", id), cambios);
    return { id, ...cambios };
}

export function eliminarProducto(id) {
    return deleteDoc(doc(db, "productos", id));
}