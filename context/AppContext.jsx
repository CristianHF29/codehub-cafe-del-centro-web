"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  obtenerProductos,
  crearProducto as apiCrearProducto,
  actualizarProducto as apiActualizarProducto,
  eliminarProducto as apiEliminarProducto
} from "@/services/productosService";
import {
  crearPedido as apiCrearPedido,
  cambiarEstadoPedido as apiCambiarEstado,
  obtenerPedidos,
  obtenerPedidosDeUsuario
} from "@/services/pedidosService";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [puntosUsuario, setPuntosUsuario] = useState(0);
  const [pedidos, setPedidos] = useState([]);

  // Recuperar la sesion guardada al iniciar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("usuario");
      if (guardado) {
        const datos = JSON.parse(guardado);
        setUsuario(datos);
        setPuntosUsuario(datos.puntos ?? 0);
      }
    } catch {
      localStorage.removeItem("usuario");
    }
    setCargandoSesion(false);
  }, []);

  // Cargar productos
  const recargarProductos = () => {
    return obtenerProductos()
      .then(data => setProductos(data))
      .catch(err => console.error("Error al cargar productos:", err));
  };

  useEffect(() => {
    recargarProductos();
  }, []);

  // Cargar pedidos segun el rol del usuario
  useEffect(() => {
    if (!usuario) {
      setPedidos([]);
      return;
    }
    const consulta = usuario.rol === "admin"
      ? obtenerPedidos()
      : obtenerPedidosDeUsuario(usuario.id);

    consulta
      .then(data => setPedidos(data))
      .catch(err => console.error("Error al cargar pedidos:", err));
  }, [usuario]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCarrito([]);
    setPedidos([]);
    setPuntosUsuario(0);
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
      return [...prev, {
        productoId: producto.id,
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
  const finalizarPedido = async () => {
    if (carrito.length === 0 || !usuario) return;

    const nuevoPedidoData = {
      usuarioId: usuario.id,
      items: [...carrito],
      total: Number(calcularTotalCarrito())
    };

    try {
      const respuesta = await apiCrearPedido(nuevoPedidoData);
      setPedidos(prev => [respuesta.pedido, ...prev]);
      setPuntosUsuario(respuesta.puntosTotales);
      setCarrito([]);

      // Mantener los puntos sincronizados en la sesion guardada
      const actualizado = { ...usuario, puntos: respuesta.puntosTotales };
      setUsuario(actualizado);
      localStorage.setItem("usuario", JSON.stringify(actualizado));
    } catch (error) {
      console.error("Error al crear el pedido en la API:", error);
    }
  };

  const cambiarEstadoPedido = async (idPedido, nuevoEstado) => {
    try {
      await apiCambiarEstado(idPedido, nuevoEstado);
      setPedidos(prev => prev.map(p => p.id === idPedido ? { ...p, estado: nuevoEstado } : p));
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // --- PRODUCTOS (CRUD ADMIN) ---
  const crearProductoAdmin = async (producto) => {
    const nuevo = await apiCrearProducto(producto);
    setProductos(prev => [...prev, nuevo]);
    return nuevo;
  };

  const actualizarProductoAdmin = async (id, cambios) => {
    const actualizado = await apiActualizarProducto(id, cambios);
    setProductos(prev => prev.map(p => (p.id === id ? actualizado : p)));
    return actualizado;
  };

  const eliminarProductoAdmin = async (id) => {
    await apiEliminarProducto(id);
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider value={{
      usuario,
      cargandoSesion,
      esAdmin: usuario?.rol === "admin",
      cerrarSesion,
      productos,
      carrito,
      agregarAlCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      calcularTotalCarrito,
      recargarProductos,
      crearProductoAdmin,
      actualizarProductoAdmin,
      eliminarProductoAdmin,
      pedidos,
      finalizarPedido,
      cambiarEstadoPedido,
      puntosUsuario
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);