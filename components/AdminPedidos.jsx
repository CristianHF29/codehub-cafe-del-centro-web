"use client";
import React from "react";
import { useApp } from "@/context/AppContext";

export default function AdminPedidos() {
  const { pedidos, cambiarEstadoPedido } = useApp();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
      <h3 className="text-xl font-bold text-amber-900 mb-4">🛠️ Panel Admin: Gestión de Pedidos</h3>
      
      {pedidos.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No hay pedidos en curso.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">ID / Usuario</th>
                <th className="py-3 px-4">Detalle</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado Actual</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-800 block">#{pedido.id}</span>
                    <span className="text-xs text-gray-500">Usuario ID: {pedido.usuarioId}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">
                    {pedido.items.map(i => `${i.cantidad}x ${i.nombre} (${i.tamano})`).join(", ")}
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-900">\${pedido.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      pedido.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                      pedido.estado === "listo" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center space-x-1">
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id, "pendiente")}
                      className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded font-medium"
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id, "listo")}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-medium"
                    >
                      Listo
                    </button>
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id, "entregado")}
                      className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded font-medium"
                    >
                      Entregado
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
