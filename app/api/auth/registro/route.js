import { NextResponse } from "next/server";
import { usuarios } from "@/data/usuarios";

// POST /api/auth/registro - crea una cuenta de cliente
export async function POST(request) {
    try {
        const datos = await request.json();

        if (!datos.nombre || !datos.email || !datos.password) {
            return NextResponse.json(
                { mensaje: "Faltan campos obligatorios: nombre, email, password" },
                { status: 400 }
            );
        }

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoEmail.test(datos.email)) {
            return NextResponse.json(
                { mensaje: "El correo no tiene un formato valido" },
                { status: 400 }
            );
        }

        if (datos.password.length < 6) {
            return NextResponse.json(
                { mensaje: "La contrasena debe tener al menos 6 caracteres" },
                { status: 400 }
            );
        }

        const existe = usuarios.find(
            (u) => u.email.toLowerCase() === datos.email.toLowerCase()
        );

        if (existe) {
            return NextResponse.json(
                { mensaje: "Ya existe una cuenta con ese correo" },
                { status: 409 }
            );
        }

        const nuevoUsuario = {
            id: usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1,
            nombre: datos.nombre,
            email: datos.email.toLowerCase(),
            password: datos.password,
            rol: "cliente",
            puntos: 0
        };

        usuarios.push(nuevoUsuario);

        const { password, ...usuarioSinPassword } = nuevoUsuario;

        return NextResponse.json(usuarioSinPassword, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al registrar el usuario" },
            { status: 500 }
        );
    }
}