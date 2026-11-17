import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Solo para el admin: las reglas de Firestore no dejan que un cliente lea otros perfiles.
// Devuelve un mapa { uid: { nombre, email } } para mostrar quién hizo cada pedido.
export function escucharClientes(alCambiar, alFallar) {
    return onSnapshot(
        collection(db, "usuarios"),
        (resultado) => {
            const clientes = {};
            resultado.docs.forEach((documento) => {
                const datos = documento.data();
                clientes[documento.id] = { nombre: datos.nombre, email: datos.email };
            });
            alCambiar(clientes);
        },
        alFallar
    );
}