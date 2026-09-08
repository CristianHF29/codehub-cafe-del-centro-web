import { NextResponse } from "next/server";
import { productos } from "@/data/productos";

// GET /api/productos - devuelve todos los productos
export async function GET() {
    try {
        return NextResponse.json(productos, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al obtener los productos" },
            { status: 500 }
        );
    }
}

// POST /api/productos - crea un producto nuevo
export async function POST(request) {
    try {
        const datos = await request.json();

        if (!datos.nombre || !datos.categoria || !datos.precios) {
            return NextResponse.json(
                { mensaje: "Faltan campos obligatorios: nombre, categoria, precios" },
                { status: 400 }
            );
        }

        const nuevoProducto = {
            id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
            nombre: datos.nombre,
            descripcion: datos.descripcion || "",
            categoria: datos.categoria,
            imagen: datos.imagen || "",
            disponible: datos.disponible ?? true,
            precios: datos.precios
        };

        productos.push(nuevoProducto);

        return NextResponse.json(nuevoProducto, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { mensaje: "Error al crear el producto" },
            { status: 500 }
        );
    }
}