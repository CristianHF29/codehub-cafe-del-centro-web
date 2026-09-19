"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

const FORM_VACIO = {
  nombre: "",
  descripcion: "",
  categoria: "clasicos",
  imagen: "",
  disponible: true,
  precios: { "16oz": "", "20oz": "", "24oz": "", "32oz": "" }
};

export default function AdminProductos() {
  const { productos, crearProductoAdmin, actualizarProductoAdmin, eliminarProductoAdmin } = useApp();
  const [editandoId, setEditandoId] = useState(null);
  const [formulario, setFormulario] = useState(FORM_VACIO);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const abrirNuevo = () => {
    setEditandoId(null);
    setFormulario(FORM_VACIO);
    setArchivoImagen(null);
    setPrevisualizacion("");
    setError("");
    setMostrandoFormulario(true);
  };

  const abrirEdicion = (producto) => {
    setEditandoId(producto.id);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      categoria: producto.categoria,
      imagen: producto.imagen || "",
      disponible: producto.disponible,
      precios: {
        "16oz": producto.precios["16oz"] ?? "",
        "20oz": producto.precios["20oz"] ?? "",
        "24oz": producto.precios["24oz"] ?? "",
        "32oz": producto.precios["32oz"] ?? ""
      }
    });
    setArchivoImagen(null);
    setPrevisualizacion(producto.imagen || "");
    setError("");
    setMostrandoFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrandoFormulario(false);
    setEditandoId(null);
    setFormulario(FORM_VACIO);
    setArchivoImagen(null);
    setPrevisualizacion("");
    setError("");
  };

  const handleCambio = (campo, valor) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  const handleArchivoSeleccionado = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!tiposPermitidos.includes(archivo.type)) {
      setError("Formato no soportado. Usa JPG, PNG, WEBP o GIF");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError("La imagen supera el tamaño máximo de 5MB");
      return;
    }

    setError("");
    setArchivoImagen(archivo);
    setPrevisualizacion(URL.createObjectURL(archivo));
  };

  const quitarImagen = () => {
    setArchivoImagen(null);
    setPrevisualizacion("");
    setFormulario(prev => ({ ...prev, imagen: "" }));
  };

  const subirImagen = async (archivo) => {
    const datosFormulario = new FormData();
    datosFormulario.append("imagen", archivo);

    const respuesta = await fetch("/api/upload", {
      method: "POST",
      body: datosFormulario
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "No se pudo subir la imagen");
    }
    return datos.url;
  };

  const handleCambioPrecio = (tamano, valor) => {
    setFormulario(prev => ({
      ...prev,
      precios: { ...prev.precios, [tamano]: valor }
    }));
  };

  const validar = () => {
    if (!formulario.nombre.trim()) return "El nombre es obligatorio";
    if (!formulario.categoria.trim()) return "La categoría es obligatoria";
    const precios = Object.values(formulario.precios);
    if (precios.some(p => p === "" || Number(p) <= 0)) {
      return "Todos los precios por tamaño deben ser mayores a 0";
    }
    return "";
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const mensajeError = validar();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setEnviando(true);
    setError("");

    let urlImagen = formulario.imagen;

    try {
      if (archivoImagen) {
        setSubiendoImagen(true);
        urlImagen = await subirImagen(archivoImagen);
        setSubiendoImagen(false);
      }
    } catch (err) {
      setSubiendoImagen(false);
      setEnviando(false);
      setError(err.message || "No se pudo subir la imagen");
      return;
    }

    const payload = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      categoria: formulario.categoria.trim(),
      imagen: (urlImagen || "").trim(),
      disponible: formulario.disponible,
      precios: {
        "16oz": Number(formulario.precios["16oz"]),
        "20oz": Number(formulario.precios["20oz"]),
        "24oz": Number(formulario.precios["24oz"]),
        "32oz": Number(formulario.precios["32oz"])
      }
    };

    try {
      if (editandoId) {
        await actualizarProductoAdmin(editandoId, payload);
      } else {
        await crearProductoAdmin(payload);
      }
      cerrarFormulario();
    } catch (err) {
      setError(err.message || "No se pudo guardar el producto");
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (producto) => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) return;
    try {
      await eliminarProductoAdmin(producto.id);
    } catch (err) {
      alert(err.message || "No se pudo eliminar el producto");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-xl font-bold text-amber-900">📋 Panel Admin: Catálogo de Productos</h3>
        <button
          onClick={abrirNuevo}
          className="bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          + Nuevo producto
        </button>
      </div>

      {mostrandoFormulario && (
        <form
          onSubmit={handleGuardar}
          className="mb-6 p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-4"
        >
          <h4 className="font-bold text-amber-900">
            {editandoId ? "Editar producto" : "Nuevo producto"}
          </h4>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre</label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => handleCambio("nombre", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-amber-500 focus:outline-none"
                placeholder="Ej. Mocha helado"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Categoría</label>
              <input
                type="text"
                value={formulario.categoria}
                onChange={(e) => handleCambio("categoria", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-amber-500 focus:outline-none"
                placeholder="clasicos, frios, filtrados..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Descripción</label>
              <textarea
                value={formulario.descripcion}
                onChange={(e) => handleCambio("descripcion", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-amber-500 focus:outline-none resize-none"
                placeholder="Breve descripción del producto"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-1">Imagen del producto</label>
              <div className="flex items-center gap-4">
                {previsualizacion ? (
                  <img
                    src={previsualizacion}
                    alt="Vista previa"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-2xl shrink-0">
                    ☕
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleArchivoSeleccionado}
                    className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 file:cursor-pointer cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-400">JPG, PNG, WEBP o GIF · máx. 5MB</span>
                  {previsualizacion && (
                    <button
                      type="button"
                      onClick={quitarImagen}
                      className="text-xs text-red-600 hover:text-red-700 font-medium text-left"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 block mb-2">Precios por tamaño</label>
              <div className="grid grid-cols-4 gap-2">
                {["16oz", "20oz", "24oz", "32oz"].map((oz) => (
                  <div key={oz}>
                    <label className="text-[11px] text-gray-500 block mb-1">{oz}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formulario.precios[oz]}
                      onChange={(e) => handleCambioPrecio(oz, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-amber-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="disponible"
                checked={formulario.disponible}
                onChange={(e) => handleCambio("disponible", e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="disponible" className="text-sm text-gray-700">
                Disponible en el menú
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              {subiendoImagen ? "Subiendo imagen..." : enviando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear producto"}
            </button>
            <button
              type="button"
              onClick={cerrarFormulario}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {productos.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No hay productos en el catálogo.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio (16oz)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs">
                          ☕
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-800 block">{producto.nombre}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{producto.descripcion}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 capitalize">{producto.categoria}</td>
                  <td className="py-3 px-4 font-semibold text-amber-900">
                    ${producto.precios["16oz"].toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      producto.disponible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {producto.disponible ? "Disponible" : "Oculto"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center space-x-1">
                    <button
                      onClick={() => abrirEdicion(producto)}
                      className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(producto)}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
