"use client";
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
    TARJETA_VACIA,
    detectarMarca,
    formatearNumero,
    formatearVencimiento,
    soloDigitos,
    ultimosDigitos,
    validarTarjeta
} from "@/utils/tarjeta";

// Simula el tiempo de respuesta de una pasarela de pago (igual que en la app móvil)
const ESPERA_PROCESO = 1800;
const MASCARA = "•••• •••• •••• ••••";

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Animaciones de la pantalla de confirmación: el check aparece con un rebote y luego el texto
const ANIMACIONES = `
  @keyframes pago-rebote {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes pago-subir {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .pago-rebote { animation: pago-rebote 0.5s ease-out both; }
  .pago-subir { animation: pago-subir 0.4s ease-out 0.35s both; }
`;

function OpcionPago({ icono, titulo, descripcion, activa, onClick, deshabilitada }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={deshabilitada}
            aria-pressed={activa}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${activa ? "border-amber-600 bg-amber-50" : "border-gray-200 hover:bg-gray-50"}`}
        >
            <span className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${activa ? "bg-amber-700 text-white" : "bg-amber-100"}`}>
                {icono}
            </span>
            <span className="flex-1">
                <span className="block font-semibold text-gray-800">{titulo}</span>
                <span className="block text-xs text-gray-500">{descripcion}</span>
            </span>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activa ? "border-amber-700" : "border-gray-300"}`}>
                {activa && <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />}
            </span>
        </button>
    );
}

function TarjetaVisual({ numero, nombre, vencimiento }) {
    const marca = detectarMarca(numero);
    const numeroVisible = numero + MASCARA.slice(numero.length);

    return (
        <div className="relative h-44 rounded-2xl bg-amber-900 text-white p-5 flex flex-col justify-between overflow-hidden shadow-md">
            <span className="absolute -top-16 -right-10 w-52 h-52 rounded-full bg-amber-500/20" />
            <span className="absolute -bottom-20 -left-8 w-44 h-44 rounded-full bg-amber-300/10" />

            <div className="relative flex justify-between items-center">
                <span className="w-10 h-7 rounded-md bg-amber-300/80" />
                <span className="text-sm font-bold tracking-widest">{marca || "TARJETA"}</span>
            </div>

            <p className="relative font-mono text-lg sm:text-xl tracking-wider">{numeroVisible}</p>

            <div className="relative flex justify-between gap-4 text-xs">
                <div className="min-w-0">
                    <span className="block text-amber-200/80 tracking-wider">TITULAR</span>
                    <span className="block font-semibold truncate">{nombre.trim() ? nombre.toUpperCase() : "TU NOMBRE"}</span>
                </div>
                <div>
                    <span className="block text-amber-200/80 tracking-wider">VENCE</span>
                    <span className="block font-semibold">{vencimiento || "MM/AA"}</span>
                </div>
            </div>
        </div>
    );
}

function Campo({ etiqueta, error, ...props }) {
    return (
        <label className="block">
            <span className="text-xs font-semibold text-gray-600">{etiqueta}</span>
            <input
                {...props}
                aria-invalid={Boolean(error)}
                className={`mt-1 w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-amber-300 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
        </label>
    );
}

export default function ModalPago({ abierto, onCerrar }) {
    const { carrito, calcularTotalCarrito, finalizarPedido } = useApp();
    const [metodo, setMetodo] = useState("efectivo");
    const [tarjeta, setTarjeta] = useState(TARJETA_VACIA);
    const [errores, setErrores] = useState({});
    const [estado, setEstado] = useState("listo"); // listo | procesando | enviando
    const [errorGeneral, setErrorGeneral] = useState("");
    const [confirmado, setConfirmado] = useState(null);

    const ocupado = estado !== "listo";
    const total = Number(calcularTotalCarrito());
    const cantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    // Al cerrar se limpia todo, así el próximo pago empieza de cero
    const cerrar = () => {
        if (ocupado) return;
        setMetodo("efectivo");
        setTarjeta(TARJETA_VACIA);
        setErrores({});
        setErrorGeneral("");
        setConfirmado(null);
        onCerrar();
    };

    // Escape cierra el modal, salvo mientras se procesa el pago
    useEffect(() => {
        if (!abierto) return;
        const alPresionar = (e) => { if (e.key === "Escape") cerrar(); };
        window.addEventListener("keydown", alPresionar);
        return () => window.removeEventListener("keydown", alPresionar);
    });

    if (!abierto) return null;

    const cambiarTarjeta = (campo, valor) => {
        let limpio = valor;
        if (campo === "numero") limpio = formatearNumero(valor);
        if (campo === "vencimiento") limpio = formatearVencimiento(valor);
        if (campo === "cvv") limpio = soloDigitos(valor).slice(0, 4);

        setTarjeta((actual) => ({ ...actual, [campo]: limpio }));
        if (errores[campo]) setErrores((actual) => ({ ...actual, [campo]: undefined }));
    };

    const pagar = async () => {
        setErrorGeneral("");

        if (metodo === "tarjeta") {
            const encontrados = validarTarjeta(tarjeta);
            setErrores(encontrados);
            if (Object.keys(encontrados).length > 0) return;

            setEstado("procesando");
            await esperar(ESPERA_PROCESO);
        }

        setEstado("enviando");

        try {
            const respuesta = await finalizarPedido({
                metodoPago: metodo,
                referenciaPago: metodo === "tarjeta" ? ultimosDigitos(tarjeta.numero) : null
            });
            setConfirmado({ ...respuesta, metodo });
        } catch (error) {
            setErrorGeneral(error.message || "No se pudo registrar el pedido. Intenta de nuevo.");
        } finally {
            setEstado("listo");
        }
    };

    const mensajeEstado =
        estado === "procesando" ? "Verificando tu tarjeta..." : estado === "enviando" ? "Enviando tu pedido..." : "";

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={cerrar}
        >
            <style>{ANIMACIONES}</style>

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-pago"
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-6"
            >
                {confirmado ? (
                    // --- Pedido confirmado ---
                    <div className="text-center py-4">
                        <div className="pago-rebote mx-auto w-28 h-28 rounded-full bg-amber-100 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-amber-700 flex items-center justify-center">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12l5 5L20 7" />
                                </svg>
                            </div>
                        </div>

                        <div className="pago-subir">
                            <p className="mt-6 text-xs font-bold tracking-widest text-amber-700">
                                PEDIDO #{String(confirmado.pedido.id).slice(0, 6).toUpperCase()}
                            </p>
                            <h2 id="titulo-pago" className="text-2xl font-black text-amber-900 mt-1">¡Gracias por tu pedido!</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                {confirmado.metodo === "tarjeta" ? "Tu pago fue aprobado." : "Pagas en caja al recogerlo."} Te avisamos cuando esté listo.
                            </p>

                            <div className="mt-5 grid grid-cols-2 divide-x border border-gray-100 rounded-xl py-3">
                                <div>
                                    <span className="block text-xs text-gray-500">Total</span>
                                    <span className="block text-lg font-extrabold text-amber-900">${confirmado.pedido.total.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500">Puntos ganados</span>
                                    <span className="block text-lg font-extrabold text-amber-900">+{confirmado.puntosGanados}</span>
                                </div>
                            </div>

                            <button
                                onClick={cerrar}
                                className="w-full mt-6 bg-amber-800 hover:bg-amber-900 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                Ver mis pedidos
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- Elegir método y pagar ---
                    <>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="text-xs font-bold tracking-widest text-amber-700">ÚLTIMO PASO</span>
                                <h2 id="titulo-pago" className="text-2xl font-black text-amber-900">¿Cómo quieres pagar?</h2>
                            </div>
                            <button
                                onClick={cerrar}
                                disabled={ocupado}
                                aria-label="Cerrar"
                                className="text-gray-400 hover:text-gray-700 text-2xl leading-none disabled:opacity-40"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-medium text-gray-700">
                                    {cantidad} {cantidad === 1 ? "bebida" : "bebidas"}
                                </span>
                                <span className="text-2xl font-black text-amber-900">${total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-amber-700 mt-1">Ganas {Math.floor(total)} puntos con este pedido</p>
                        </div>

                        <div className="mt-4 space-y-2">
                            <OpcionPago
                                icono="💵"
                                titulo="Efectivo"
                                descripcion="Pagas en caja al recoger tu pedido."
                                activa={metodo === "efectivo"}
                                onClick={() => setMetodo("efectivo")}
                                deshabilitada={ocupado}
                            />
                            <OpcionPago
                                icono="💳"
                                titulo="Tarjeta"
                                descripcion="Débito o crédito."
                                activa={metodo === "tarjeta"}
                                onClick={() => setMetodo("tarjeta")}
                                deshabilitada={ocupado}
                            />
                        </div>

                        {metodo === "tarjeta" && (
                            <div className="mt-4 space-y-4">
                                <TarjetaVisual numero={tarjeta.numero} nombre={tarjeta.nombre} vencimiento={tarjeta.vencimiento} />

                                <Campo
                                    etiqueta="Número de tarjeta"
                                    placeholder="1234 5678 9012 3456"
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    maxLength={19}
                                    value={tarjeta.numero}
                                    onChange={(e) => cambiarTarjeta("numero", e.target.value)}
                                    error={errores.numero}
                                    disabled={ocupado}
                                />
                                <Campo
                                    etiqueta="Nombre en la tarjeta"
                                    placeholder="Como aparece impreso"
                                    autoComplete="cc-name"
                                    value={tarjeta.nombre}
                                    onChange={(e) => cambiarTarjeta("nombre", e.target.value)}
                                    error={errores.nombre}
                                    disabled={ocupado}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Campo
                                        etiqueta="Vence"
                                        placeholder="MM/AA"
                                        inputMode="numeric"
                                        autoComplete="cc-exp"
                                        maxLength={5}
                                        value={tarjeta.vencimiento}
                                        onChange={(e) => cambiarTarjeta("vencimiento", e.target.value)}
                                        error={errores.vencimiento}
                                        disabled={ocupado}
                                    />
                                    <Campo
                                        etiqueta="CVV"
                                        placeholder="123"
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="cc-csc"
                                        maxLength={4}
                                        value={tarjeta.cvv}
                                        onChange={(e) => cambiarTarjeta("cvv", e.target.value)}
                                        error={errores.cvv}
                                        disabled={ocupado}
                                    />
                                </div>

                                <p className="text-xs text-gray-500 flex gap-2">
                                    <span aria-hidden="true">🔒</span>
                                    Pago de demostración. No se realiza ningún cobro ni se guardan los datos de la tarjeta.
                                </p>
                            </div>
                        )}

                        {errorGeneral && (
                            <p className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{errorGeneral}</p>
                        )}

                        <button
                            onClick={pagar}
                            disabled={ocupado}
                            className="w-full mt-5 bg-amber-800 hover:bg-amber-900 disabled:opacity-70 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {ocupado && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                            {ocupado ? mensajeEstado : metodo === "tarjeta" ? `Pagar $${total.toFixed(2)}` : "Confirmar pedido"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}