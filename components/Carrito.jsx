"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import ModalPago from "@/components/ModalPago";

export default function Carrito() {
  const { carrito, actualizarCantidad, eliminarDelCarrito, calcularTotalCarrito } = useApp();
  const [pagoAbierto, setPagoAbierto] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100 max-w-md w-full">
      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center justify-between">
        <span>🛒 Tu Carrito</span>
        <span className="text-sm bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
          {carrito.reduce((acc, item) => acc + item.cantidad, 0)} ítems
        </span>
      </h2>

      {carrito.length === 0 ? (
        <p className="text-gray-500 text-center py-6">El carrito está vacío. ¡Elige tu bebida favorita!</p>
      ) : (
        <div className="space-y-4">
          <div className="divide-y max-h-60 overflow-y-auto pr-1">
            {carrito.map((item) => (
              <div key={`${item.id}-${item.tamano}`} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
                  <p className="text-xs text-amber-700 font-medium">Vaso: {item.tamano}</p>
                  <p className="text-xs text-gray-500">${item.precio.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-lg bg-gray-50">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.tamano, -1)}
                      aria-label={`Quitar un ${item.nombre}`}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded-l"
                    >-</button>
                    <span className="px-2 text-sm font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.tamano, 1)}
                      aria-label={`Agregar otro ${item.nombre}`}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded-r"
                    >+</button>
                  </div>
                  <button
                    onClick={() => eliminarDelCarrito(item.id, item.tamano)}
                    className="text-red-500 hover:text-red-700 text-sm p-1"
                    title="Eliminar"
                    aria-label={`Eliminar ${item.nombre} del carrito`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-700">Total a pagar:</span>
            <span className="text-xl font-extrabold text-amber-900">${calcularTotalCarrito()}</span>
          </div>

          <button
            onClick={() => setPagoAbierto(true)}
            className="w-full mt-2 bg-amber-800 hover:bg-amber-900 text-white font-medium py-2.5 rounded-xl transition-colors shadow-md"
          >
            Continuar al pago
          </button>
        </div>
      )}

      {/* El modal sigue abierto al vaciarse el carrito, para mostrar la confirmación */}
      <ModalPago abierto={pagoAbierto} onCerrar={() => setPagoAbierto(false)} />
    </div>
  );
}