"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import {
    asegurarPerfil,
    cerrarSesion as salirDeFirebase,
    iniciarSesion as entrarConCorreo,
    iniciarSesionConGoogle,
    registrar,
} from "@/services/authService";

export type Usuario = {
    id: string;
    nombre: string;
    email: string;
    rol: "cliente" | "admin";
    puntos: number;
};

type SesionValor = {
    usuario: Usuario | null;
    cargando: boolean;
    esAdmin: boolean;
    iniciarSesion: (email: string, password: string) => Promise<User>;
    iniciarConGoogle: () => Promise<User | null>;
    registrarse: (nombre: string, email: string, password: string) => Promise<User>;
    cerrarSesion: () => Promise<void>;
};

const SesionContext = createContext<SesionValor | null>(null);

// Sesión global de la web. Reemplaza el usuario que antes se guardaba en localStorage:
// ahora la sesión la maneja Firebase Auth y el perfil (rol y puntos) se lee de Firestore.
export function SesionProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let dejarDeEscucharPerfil: (() => void) | undefined;

        const dejarDeEscucharAuth = onAuthStateChanged(auth, (user) => {
            dejarDeEscucharPerfil?.();
            dejarDeEscucharPerfil = undefined;

            if (!user) {
                setUsuario(null);
                setCargando(false);
                return;
            }

            // El perfil se escucha en tiempo real: si el cliente gana puntos en el
            // teléfono, la web los muestra al instante
            dejarDeEscucharPerfil = onSnapshot(
                doc(db, "usuarios", user.uid),
                (perfil) => {
                    if (!perfil.exists()) {
                        asegurarPerfil(user);
                        return;
                    }

                    const datos = perfil.data();
                    setUsuario({
                        id: user.uid,
                        nombre: datos.nombre,
                        email: datos.email,
                        rol: datos.rol,
                        puntos: datos.puntos ?? 0,
                    });
                    setCargando(false);
                },
                () => setCargando(false)
            );
        });

        return () => {
            dejarDeEscucharPerfil?.();
            dejarDeEscucharAuth();
        };
    }, []);

    const valor: SesionValor = {
        usuario,
        cargando,
        esAdmin: usuario?.rol === "admin",
        iniciarSesion: (email, password) => entrarConCorreo(email.trim().toLowerCase(), password),
        iniciarConGoogle: iniciarSesionConGoogle,
        registrarse: (nombre, email, password) =>
            registrar(nombre.trim(), email.trim().toLowerCase(), password),
        cerrarSesion: salirDeFirebase,
    };

    return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion() {
    const contexto = useContext(SesionContext);
    if (!contexto) throw new Error("useSesion debe usarse dentro de SesionProvider");
    return contexto;
}