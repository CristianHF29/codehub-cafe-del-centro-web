"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSesion } from "./SesionContext";
import {
  escucharProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "@/services/productosService";
import {
  crearPedido,
  cambiarEstadoPedido as guardarEstadoPedido,
  escucharPedidosDeUsuario,
  escucharTodosLosPedidos
} from "@/services/pedidosService";
import { mensajeError } from "@/services/errores";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { usuario, cargando: cargandoSesion, esAdmin, cerrarSesion: salir } = useSesion();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Catálogo en tiempo real desde Firestore
  useEffect(() => {
    return escucharProductos(
      setProductos,
      (err) => console.error("Error al cargar productos:", err)
    );
  }, []);

  const usuarioId = usuario?.id;

  // Pedidos en tiempo real: el admin ve todos, el cliente solo los suyos.
  // Reemplaza la consulta cada 10 segundos que se usaba con la API en memoria.
  useEffect(() => {
    if (!usuarioId) return;

    const alFallar = (err) => console.error("Error al cargar pedidos:", err);
    return esAdmin
      ? escucharTodosLosPedidos(setPedidos, alFallar)
      : escucharPedidosDeUsuario(usuarioId, setPedidos, alFallar);
  }, [usuarioId, esAdmin]);

  const cerrarSesion = async () => {
    setCarrito([]);
    await salir();
  };

  // --- CARRITO ---
  const agregarAlCarrito = (producto, tamano) => {
    const precioFinal = producto.precios[tamano];

    setCarrito(prev => {
      const existe = prev.some(item => item.id === producto.id && item.tamano === tamano);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id && item.tamano === tamano
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      // Mismo formato de item que usa la app móvil
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        tamano: tamano,
        precio: precioFinal,
        cantidad: 1
      }];
    });
  };

  const actualizarCantidad = (id, tamano, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id && item.tamano === tamano) {
        const nuevaCantidad = item.cantidad + delta;
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const eliminarDelCarrito = (id, tamano) => {
    setCarrito(prev => prev.filter(item => !(item.id === id && item.tamano === tamano)));
  };

  const calcularTotalCarrito = () => {
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toFixed(2);
  };

  // --- PEDIDOS ---
  // Los puntos y la lista de pedidos se actualizan solos por los listeners.
  // Devuelve el pedido creado y los puntos ganados, para la pantalla de confirmación.
  const finalizarPedido = async ({ metodoPago = "efectivo", referenciaPago = null } = {}) => {
    if (carrito.length === 0 || !usuario) {
      throw new Error("El carrito está vacío");
    }

    try {
      const respuesta = await crearPedido({
        usuarioId: usuario.id,
        items: [...carrito],
        total: Number(calcularTotalCarrito()),
        metodoPago,
        referenciaPago
      });
      setCarrito([]);
      return respuesta;
    } catch (error) {
      throw new Error(mensajeError(error));
    }
  };

  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      await guardarEstadoPedido(idPedido, nuevoEstado);
    } catch (error) {
      console.error("Error al cambiar estado:", mensajeError(error));
    }
  };

  // --- PRODUCTOS (CRUD ADMIN) ---
  // Los errores se traducen para que el formulario muestre un mensaje claro
  const conMensaje = async (accion) => {
    try {
      return await accion();
    } catch (error) {
      throw new Error(mensajeError(error));
    }
  };

  const crearProductoAdmin = (producto) => conMensaje(() => {
    // La app móvil ordena el menú por "orden": el producto nuevo va al final
    const siguienteOrden = productos.reduce((max, p) => Math.max(max, p.orden ?? 0), 0) + 1;
    return crearProducto({ ...producto, orden: siguienteOrden });
  });

  const actualizarProductoAdmin = (id, cambios) => conMensaje(() => actualizarProducto(id, cambios));

  const eliminarProductoAdmin = (id) => conMensaje(() => eliminarProducto(id));

  return (
    <AppContext.Provider value={{
      usuario,
      cargandoSesion,
      esAdmin,
      cerrarSesion,
      productos,
      carrito,
      agregarAlCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      calcularTotalCarrito,
      crearProductoAdmin,
      actualizarProductoAdmin,
      eliminarProductoAdmin,
      // Sin sesión no se muestran pedidos de una sesión anterior
      pedidos: usuarioId ? pedidos : [],
      finalizarPedido,
      cambiarEstadoPedido,
      puntosUsuario: usuario?.puntos ?? 0
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);