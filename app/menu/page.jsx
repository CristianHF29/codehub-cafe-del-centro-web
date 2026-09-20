"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppProvider, useApp } from "@/context/AppContext";
import Carrito from "@/components/Carrito";
import ClienteDashboard from "@/components/ClienteDashboard";
import AdminPedidos from "@/components/AdminPedidos";
import AdminProductos from "@/components/AdminProductos";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { productos, agregarAlCarrito, usuario, cargandoSesion, esAdmin, cerrarSesion } = useApp();
  const [tamanosSeleccionados, setTamanosSeleccionados] = useState({});
  const [vistaAdmin, setVistaAdmin] = useState("pedidos");
  const productosVisibles = productos.filter((producto) => producto.disponible !== false);

  // Permite entrar directo a una pestaña desde el dashboard: /menu?vista=productos
  useEffect(() => {
    const vista = searchParams.get("vista");
    if (vista === "productos" || vista === "pedidos") {
      setVistaAdmin(vista);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!cargandoSesion && !usuario) {
      router.push("/login");
    }
  }, [cargandoSesion, usuario, router]);

  const handleTamanoChange = (productoId, tamano) => {
    setTamanosSeleccionados(prev => ({ ...prev, [productoId]: tamano }));
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    router.push("/login");
  };

  if (cargandoSesion || !usuario) {
    return (
      <main className="min-h-screen bg-amber-50/40 flex items-center justify-center">
        <p className="text-amber-900 font-medium">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50/40 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-amber-100 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-900">Café del Centro</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {esAdmin ? "Panel de administración" : "Menú, carrito y puntos de fidelidad"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="mr-auto sm:mr-0 sm:text-right">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">{usuario.nombre}</p>
              <p className="text-xs text-amber-700 capitalize">{usuario.rol}</p>
            </div>
            {esAdmin && (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Reportes
              </button>
            )}
            <button
              onClick={handleCerrarSesion}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-amber-800 text-white hover:bg-amber-900 transition-all"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {!esAdmin ? (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

              <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                <h2 className="text-lg sm:text-xl font-bold text-amber-900">Menú de Bebidas</h2>

                {productosVisibles.length === 0 ? (
                  <p className="text-gray-500 bg-white p-6 rounded-2xl border border-amber-100">
                    No hay productos disponibles por ahora.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productosVisibles.map((producto) => {
                      const tamanoActual = tamanosSeleccionados[producto.id] || "16oz";
                      const precioDinamico = producto.precios[tamanoActual].toFixed(2);

                      return (
                        <div key={producto.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-between">
                          <div>
                            <div className="flex gap-3">
                              {producto.imagen ? (
                                <img
                                  src={producto.imagen}
                                  alt={producto.nombre}
                                  className="w-16 h-16 rounded-xl object-cover border border-amber-100 shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-xl shrink-0">
                                  ☕
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="font-bold text-gray-800 text-base sm:text-lg">{producto.nombre}</h3>
                                {producto.descripcion && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{producto.descripcion}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Precio base (16oz): ${producto.precios["16oz"].toFixed(2)}</p>

                            <div className="mt-3">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Elige tamaño de vaso:</label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {["16oz", "20oz", "24oz", "32oz"].map((oz) => (
                                  <button
                                    key={oz}
                                    onClick={() => handleTamanoChange(producto.id, oz)}
                                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${tamanoActual === oz
                                      ? 'bg-amber-800 text-white border-amber-800'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                      }`}
                                  >
                                    {oz}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-lg font-extrabold text-amber-900">${precioDinamico}</span>
                            <button
                              onClick={() => agregarAlCarrito(producto, tamanoActual)}
                              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                            >
                              Añadir al Carrito
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="order-1 lg:order-2">
                <Carrito />
              </div>

            </div>

            <ClienteDashboard />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-amber-100 w-full sm:w-fit">
              <button
                onClick={() => setVistaAdmin("pedidos")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  vistaAdmin === "pedidos"
                    ? "bg-amber-800 text-white"
                    : "text-gray-600 hover:bg-amber-50"
                }`}
              >
                Pedidos
              </button>
              <button
                onClick={() => setVistaAdmin("productos")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  vistaAdmin === "productos"
                    ? "bg-amber-800 text-white"
                    : "text-gray-600 hover:bg-amber-50"
                }`}
              >
                Catálogo
              </button>
            </div>

            {vistaAdmin === "pedidos" ? <AdminPedidos /> : <AdminProductos />}
          </div>
        )}

      </div>
    </main>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <Suspense
        fallback={
          <main className="min-h-screen bg-amber-50/40 flex items-center justify-center">
            <p className="text-amber-900 font-medium">Cargando...</p>
          </main>
        }
      >
        <DashboardContent />
      </Suspense>
    </AppProvider>
  );
}