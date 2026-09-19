import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5MB

// POST /api/upload - sube una imagen a Vercel Blob y devuelve su URL publica
export async function POST(request) {
    try {
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

        const extension = archivo.name.split(".").pop();
        const nombreArchivo = `productos/${crypto.randomUUID()}.${extension}`;

        const blob = await put(nombreArchivo, archivo, {
            access: "public",
            contentType: archivo.type
        });

        return NextResponse.json(
            { url: blob.url },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { mensaje: "Error al subir la imagen" },
            { status: 500 }
        );
    }
}
