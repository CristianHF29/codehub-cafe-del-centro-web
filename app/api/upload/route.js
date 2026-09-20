import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5MB

// POST /api/upload - sube una imagen a Vercel Blob y devuelve su URL publica
export async function POST(request) {
    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json(
                { mensaje: "Falta configurar BLOB_READ_WRITE_TOKEN en el entorno" },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const archivo = formData.get("imagen");

        if (!archivo || typeof archivo === "string") {
            return NextResponse.json(
                { mensaje: "No se recibió ningún archivo" },
                { status: 400 }
            );
        }

        if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
            return NextResponse.json(
                { mensaje: "Formato no soportado. Usa JPG, PNG, WEBP o GIF" },
                { status: 400 }
            );
        }

        if (archivo.size > TAMANO_MAXIMO) {
            return NextResponse.json(
                { mensaje: "La imagen supera el tamaño máximo de 5MB" },
                { status: 400 }
            );
        }

        const blob = await put(`productos/${archivo.name}`, archivo, {
            access: "public",
            addRandomSuffix: true
        });

        return NextResponse.json({ url: blob.url }, { status: 201 });
    } catch (error) {
        console.error("ERROR UPLOAD:", error);
        return NextResponse.json(
            { mensaje: `Error al subir la imagen: ${error.message}` },
            { status: 500 }
        );
    }
}