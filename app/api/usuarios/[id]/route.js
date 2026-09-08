import { NextResponse } from "next/server";
import { usuarios } from "@/data/usuarios";

// GET /api/usuarios/[id] - devuelve los datos y puntos del usuario
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const usuario = usuarios.find((u) => u.id === Number(id));

        if (!usuario) {
            return NextResponse.json(
                { mensaje: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        const { password, ...usuarioSinPassword } = usuario;

        return NextResponse.json(usuarioSinPassword, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al obtener el usuario" },
            { status: 500 }
        );
    }
}