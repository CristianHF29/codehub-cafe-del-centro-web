"use client";
import React from "react";
import { useApp } from "@/context/AppContext";

export default function ClienteDashboard() {
  const { pedidos, puntosUsuario } = useApp();

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "listo": return "bg-blue-100 text-blue-800 border-blue-300";
      case "entregado": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Widget de Puntos de Fidelidad */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
        <div>
          <span className="text-amber-200 text-sm font-medium uppercase tracking-wider">Fidelidad Café del Centro</span>
          <h3 className="text-3xl font-extrabold mt-1">Tus Puntos</h3>
        </div>
        <div className="my-6 text-center">
          <span className="text-6xl font-black">{puntosUsuario}</span>
          <p className="text-amber-200 text-sm mt-1">¡Acumula puntos con cada compra!</p>
        </div>
        <div className="bg-amber-900/40 p-3 rounded-xl text-xs text-amber-100">
          💡 Canjea tus puntos por bebidas gratis.
        </div>
      </div>

      {/* Historial de Pedidos */}
      <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
        <h3 className="text-xl font-bold text-amber-900 mb-4">📋 Mis Pedidos Activos e Historial</h3>
        
        {pedidos.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No tienes pedidos registrados aún.</p>
        ) : (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="border border-gray-100 p-4 rounded-xl shadow-sm bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800">Pedido #{pedido.id}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getEstadoBadge(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {pedido.items.map(i => `${i.cantidad}x ${i.nombre} (${i.tamano})`).join(", ")}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(pedido.fecha).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-900">\${pedido.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
