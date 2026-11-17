// Traduce los errores de Firebase a mensajes claros (los mismos que usa la app móvil)
const MENSAJES_FIREBASE = {
    "auth/invalid-credential": "Correo o contraseña incorrectos",
    "auth/invalid-email": "El correo no es válido",
    "auth/email-already-in-use": "Ya existe una cuenta con ese correo",
    "auth/weak-password": "La contraseña es muy débil",
    "auth/too-many-requests": "Demasiados intentos. Espera un momento e intenta de nuevo",
    "auth/network-request-failed": "No hay conexión a internet",
    "auth/user-disabled": "Esta cuenta está deshabilitada",
    "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase",
    "permission-denied": "No tienes permiso para realizar esta acción",
    unavailable: "No se pudo conectar con el servidor. Revisa tu conexión.",
};

export function mensajeError(error) {
    const codigo = error?.code ? String(error.code) : "";
    if (MENSAJES_FIREBASE[codigo]) return MENSAJES_FIREBASE[codigo];
    return error instanceof Error ? error.message : "Ocurrió un error inesperado";
}