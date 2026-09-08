import { NextResponse } from "next/server";
import { usuarios } from "@/data/usuarios";

// POST /api/auth/login - valida credenciales
export async function POST(request) {
    try {
        const datos = await request.json();

        if (!datos.email || !datos.password) {
            return NextResponse.json(
                { mensaje: "Se requiere correo y contrasena" },
                { status: 400 }
            );
        }

        const usuario = usuarios.find(
            (u) => u.email.toLowerCase() === datos.email.toLowerCase()
        );

        if (!usuario || usuario.password !== datos.password) {
            return NextResponse.json(
                { mensaje: "Correo o contrasena incorrectos" },
                { status: 401 }
            );
        }

        const { password, ...usuarioSinPassword } = usuario;

        return NextResponse.json(usuarioSinPassword, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al iniciar sesion" },
            { status: 500 }
        );
    }
}