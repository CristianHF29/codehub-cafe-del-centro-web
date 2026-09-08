import { NextResponse } from "next/server";
import { pedidos } from "@/data/pedidos";

const ESTADOS_VALIDOS = ["pendiente", "listo", "entregado"];

// GET /api/pedidos/[id] - devuelve un pedido
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const pedido = pedidos.find((p) => p.id === Number(id));

        if (!pedido) {
            return NextResponse.json(
                { mensaje: "Pedido no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(pedido, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al obtener el pedido" },
            { status: 500 }
        );
    }
}

// PUT /api/pedidos/[id] - actualiza el estado del pedido
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const datos = await request.json();

        if (!datos.estado) {
            return NextResponse.json(
                { mensaje: "Se requiere el campo estado" },
                { status: 400 }
            );
        }

        if (!ESTADOS_VALIDOS.includes(datos.estado)) {
            return NextResponse.json(
                { mensaje: "Estado invalido. Use: pendiente, listo o entregado" },
                { status: 400 }
            );
        }

        const indice = pedidos.findIndex((p) => p.id === Number(id));

        if (indice === -1) {
            return NextResponse.json(
                { mensaje: "Pedido no encontrado" },
                { status: 404 }
            );
        }

        pedidos[indice].estado = datos.estado;

        return NextResponse.json(pedidos[indice], { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al actualizar el pedido" },
            { status: 500 }
        );
    }
}