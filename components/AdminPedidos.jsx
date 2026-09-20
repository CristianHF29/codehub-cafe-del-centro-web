"use client";
import React from "react";
import { useApp } from "@/context/AppContext";

const ESTADOS = [
  { valor: "pendiente", etiqueta: "Pendiente", clase: "bg-yellow-100 hover:bg-yellow-200 text-yellow-800" },
  { valor: "listo", etiqueta: "Listo", clase: "bg-blue-100 hover:bg-blue-200 text-blue-800" },
  { valor: "entregado", etiqueta: "Entregado", clase: "bg-green-100 hover:bg-green-200 text-green-800" }
];

function badgeEstado(estado) {
  if (estado === "pendiente") return "bg-yellow-100 text-yellow-800";
  if (estado === "listo") return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
}

function detalle(pedido) {
  return (pedido.items ?? []).map(i => `${i.cantidad}x ${i.nombre} (${i.tamano})`).join(", ");
}

export default function AdminPedidos() {
  const { pedidos, cambiarEstadoPedido } = useApp();

  if (pedidos.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
        <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-4">Panel Admin: Gestión de Pedidos</h3>
        <p className="text-gray-500 text-center py-6">No hay pedidos en curso.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-amber-100">
      <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-4">Panel Admin: Gestión de Pedidos</h3>

      <div className="md:hidden space-y-3">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="font-bold text-gray-800">Pedido #{pedido.id}</span>
                <span className="text-xs text-gray-500 block">Usuario ID: {pedido.usuarioId}</span>
              </div>
              <span className="text-lg font-extrabold text-amber-900 shrink-0">
                ${pedido.total.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-gray-600 mt-2">{detalle(pedido)}</p>

            <div className="mt-3">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeEstado(pedido.estado)}`}>
                {pedido.estado}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {ESTADOS.map((estado) => (
                <button
                  key={estado.valor}
                  onClick={() => cambiarEstadoPedido(pedido.id, estado.valor)}
                  disabled={pedido.estado === estado.valor}
                  className={`py-2 text-xs rounded-lg font-medium disabled:opacity-40 ${estado.clase}`}
                >
                  {estado.etiqueta}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
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
                  {detalle(pedido)}
                </td>
                <td className="py-3 px-4 font-semibold text-amber-900">${pedido.total.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeEstado(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                </td>
                <td className="py-3 px-4 text-center space-x-1">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado.valor}
                      onClick={() => cambiarEstadoPedido(pedido.id, estado.valor)}
                      disabled={pedido.estado === estado.valor}
                      className={`px-2 py-1 text-xs rounded font-medium disabled:opacity-40 ${estado.clase}`}
                    >
                      {estado.etiqueta}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}