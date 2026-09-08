import { peticion } from "./api";

export function login(email, password) {
    return peticion("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}

export function registrar(nombre, email, password) {
    return peticion("/auth/registro", {
        method: "POST",
        body: JSON.stringify({ nombre, email, password })
    });
}

export function obtenerUsuario(id) {
    return peticion(`/usuarios/${id}`);
}