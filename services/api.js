const BASE_URL = "/api";

export async function peticion(ruta, opciones = {}) {
    try {
        const respuesta = await fetch(`${BASE_URL}${ruta}`, {
            headers: { "Content-Type": "application/json" },
            ...opciones
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || "Ocurrio un error en la peticion");
        }

        return datos;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("No se pudo conectar con el servidor");
        }
        throw error;
    }
}