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

function etiquetaEstado(estado) {
  return ESTADOS.find((e) => e.valor === estado)?.etiqueta ?? estado;
}

function textoPago(pedido) {
  if (pedido.metodoPago === "tarjeta") return `Tarjeta •••• ${pedido.referenciaPago ?? ""}`;
  return "Efectivo";
}

function hora(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString("es-SV", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPedidos() {
  const { pedidos, cambiarEstadoPedido } = useApp();

  if (pedidos.length === 0) {
    return (
      <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-amber-100">
        <h3 className="text-2xl font-bold text-amber-900 mb-4">Gestión de pedidos</h3>
        <p className="text-gray-500 text-center py-10 text-lg">No hay pedidos en curso.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-amber-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-amber-900">Gestión de pedidos</h3>
        <p className="text-sm text-gray-500 mt-1">Se actualiza automáticamente cada 10 segundos</p>
      </div>

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
                {etiquetaEstado(pedido.estado)}
              </span>
              <span className="text-xs text-gray-500 ml-2">{textoPago(pedido)}</span>
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
            <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-5">Pedido</th>
              <th className="py-4 px-5">Detalle</th>
              <th className="py-4 px-5">Pago</th>
              <th className="py-4 px-5">Total</th>
              <th className="py-4 px-5">Estado</th>
              <th className="py-4 px-5 text-center">Cambiar estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-base">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-amber-50/40 transition-colors align-top">
                <td className="py-5 px-5">
                  <span className="font-bold text-gray-900 text-lg block">#{pedido.id}</span>
                  <span className="text-sm text-gray-500 block">Cliente {pedido.usuarioId}</span>
                  <span className="text-sm text-gray-400 block">{hora(pedido.fecha)}</span>
                </td>
                <td className="py-5 px-5 text-sm text-gray-700">
                  <ul className="space-y-1">
                    {(pedido.items ?? []).map((item) => (
                      <li key={`${item.id}-${item.tamano}`}>
                        <span className="font-semibold">{item.cantidad}×</span> {item.nombre}{" "}
                        <span className="text-gray-500">({item.tamano})</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-5 px-5 text-sm text-gray-700 whitespace-nowrap">{textoPago(pedido)}</td>
                <td className="py-5 px-5 font-bold text-amber-900 text-lg whitespace-nowrap">
                  ${pedido.total.toFixed(2)}
                </td>
                <td className="py-5 px-5">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap ${badgeEstado(pedido.estado)}`}>
                    {etiquetaEstado(pedido.estado)}
                  </span>
                </td>
                <td className="py-5 px-5">
                  <div className="flex justify-center gap-2">
                    {ESTADOS.map((estado) => (
                      <button
                        key={estado.valor}
                        onClick={() => cambiarEstadoPedido(pedido.id, estado.valor)}
                        disabled={pedido.estado === estado.valor}
                        className={`px-4 py-2 text-sm rounded-xl font-semibold disabled:opacity-40 transition-colors ${estado.clase}`}
                      >
                        {estado.etiqueta}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}