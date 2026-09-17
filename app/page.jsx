"use client";
import React, { useState } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import Carrito from "@/components/Carrito";
import ClienteDashboard from "@/components/ClienteDashboard";
import AdminPedidos from "@/components/AdminPedidos";

function DashboardContent() {
  const { productos, agregarAlCarrito, multiplicadoresTamano } = useApp();
  const [tamanosSeleccionados, setTamanosSeleccionados] = useState({});
  const [vistaAdmin, setVistaAdmin] = useState(false);

  const handleTamanoChange = (productoId, tamano) => {
    setTamanosSeleccionados(prev => ({ ...prev, [productoId]: tamano }));
  };

  return (
    <main className="min-h-screen bg-amber-50/40 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-amber-100 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-amber-900">☕ Café del Centro</h1>
            <p className="text-sm text-gray-500">Módulo Web - Carrito, Pedidos y Puntos de Fidelidad</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVistaAdmin(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!vistaAdmin ? 'bg-amber-800 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Vista Cliente
            </button>
            <button
              onClick={() => setVistaAdmin(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${vistaAdmin ? 'bg-amber-800 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Vista Administrador
            </button>
          </div>
        </header>

        {/* Contenido Dinámico según Rol */}
        {!vistaAdmin ? (
          <div className="space-y-8">
            {/* Sección de Menú y Carrito */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Menú de Productos (Menú real solicitado) */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-amber-900">📜 Menú de Bebidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.map((producto) => {
                    const tamanoActual = tamanosSeleccionados[producto.id] || "16oz";
                    const precioDinamico = (producto.precioBase * multiplicadoresTamano[tamanoActual]).toFixed(2);

                    return (
                      <div key={producto.id} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{producto.nombre}</h3>
                          <p className="text-xs text-gray-500 mt-1">Precio base (16oz): \${producto.precioBase.toFixed(2)}</p>
                          
                          {/* Selector de Tamaño de Vaso */}
                          <div className="mt-3">
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Elige tamaño de vaso:</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {["16oz", "20oz", "24oz", "32oz"].map((oz) => (
                                <button
                                  key={oz}
                                  onClick={() => handleTamanoChange(producto.id, oz)}
                                  className={`py-1 text-xs font-medium rounded-lg border transition-all ${
                                    tamanoActual === oz 
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

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-lg font-extrabold text-amber-900">\${precioDinamico}</span>
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
              </div>

              {/* Componente Carrito */}
              <div>
                <Carrito />
              </div>

            </div>

            {/* Dashboard del Cliente */}
            <ClienteDashboard />
          </div>
        ) : (
          /* Panel de Administrador */
          <AdminPedidos />
        )}

      </div>
    </main>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
