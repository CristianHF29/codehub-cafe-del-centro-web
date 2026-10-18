import { NextResponse } from "next/server";
import { pedidos, usuarios, siguienteId } from "@/data/db";

// GET /api/pedidos - lista todos los pedidos
// GET /api/pedidos?usuarioId=2 - lista los pedidos de un cliente
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const usuarioId = searchParams.get("usuarioId");

        let resultado = pedidos;

        if (usuarioId) {
            resultado = pedidos.filter((p) => p.usuarioId === Number(usuarioId));
        }

        return NextResponse.json(resultado, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al obtener los pedidos" },
            { status: 500 }
        );
    }
}

// POST /api/pedidos - crea un pedido nuevo
export async function POST(request) {
    try {
        const datos = await request.json();

        if (!datos.usuarioId || !datos.items || !datos.total) {
            return NextResponse.json(
                { mensaje: "Faltan campos obligatorios: usuarioId, items, total" },
                { status: 400 }
            );
        }

        if (!Array.isArray(datos.items) || datos.items.length === 0) {
            return NextResponse.json(
                { mensaje: "El pedido debe tener al menos un producto" },
                { status: 400 }
            );
        }

        if (datos.total <= 0) {
            return NextResponse.json(
                { mensaje: "El total debe ser mayor a cero" },
                { status: 400 }
            );
        }

        const usuario = usuarios.find((u) => u.id === Number(datos.usuarioId));

        if (!usuario) {
            return NextResponse.json(
                { mensaje: "El usuario no existe" },
                { status: 404 }
            );
        }

        const nuevoPedido = {
            id: siguienteId(pedidos),
            usuarioId: Number(datos.usuarioId),
            items: datos.items,
            total: datos.total,
            estado: "pendiente",
            metodoPago: datos.metodoPago === "tarjeta" ? "tarjeta" : "efectivo",
            referenciaPago: datos.metodoPago === "tarjeta" ? datos.referenciaPago ?? null : null,
            fecha: new Date().toISOString()
        };

        pedidos.push(nuevoPedido);

        // Fidelización: 1 punto por cada dólar gastado
        const puntosGanados = Math.floor(datos.total);
        usuario.puntos += puntosGanados;

        return NextResponse.json(
            { pedido: nuevoPedido, puntosGanados, puntosTotales: usuario.puntos },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al crear el pedido" },
            { status: 500 }
        );
    }
}