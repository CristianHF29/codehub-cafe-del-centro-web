import { NextResponse } from "next/server";
import { productos } from "@/data/productos";

// GET /api/productos/[id] - devuelve un producto
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const producto = productos.find((p) => p.id === Number(id));

        if (!producto) {
            return NextResponse.json(
                { mensaje: "Producto no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(producto, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al obtener el producto" },
            { status: 500 }
        );
    }
}

// PUT /api/productos/[id] - actualiza un producto
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const datos = await request.json();
        const indice = productos.findIndex((p) => p.id === Number(id));

        if (indice === -1) {
            return NextResponse.json(
                { mensaje: "Producto no encontrado" },
                { status: 404 }
            );
        }

        productos[indice] = {
            ...productos[indice],
            ...datos,
            id: productos[indice].id
        };

        return NextResponse.json(productos[indice], { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al actualizar el producto" },
            { status: 500 }
        );
    }
}

// DELETE /api/productos/[id] - elimina un producto
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const indice = productos.findIndex((p) => p.id === Number(id));

        if (indice === -1) {
            return NextResponse.json(
                { mensaje: "Producto no encontrado" },
                { status: 404 }
            );
        }

        const eliminado = productos.splice(indice, 1)[0];

        return NextResponse.json(
            { mensaje: "Producto eliminado", producto: eliminado },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al eliminar el producto" },
            { status: 500 }
        );
    }
}