"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { obtenerProductos, crearPedido as apiCrearPedido, cambiarEstadoPedido as apiCambiarEstado } from "@/services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [puntosUsuario, setPuntosUsuario] = useState(0);
  const [pedidos, setPedidos] = useState([]);

  // Multiplicadores según tamaño de vaso ("16oz", "20oz", "24oz", "32oz")
  const multiplicadoresTamano = {
    "16oz": 1.0,
    "20oz": 1.25,
    "24oz": 1.5,
    "32oz": 1.8
  };

  // Cargar productos desde la API al iniciar
  useEffect(() => {
    obtenerProductos()
      .then(data => setProductos(data))
      .catch(err => console.error("Error al cargar productos:", err));
  }, []);

  // --- ACCIONES DEL CARRITO (Corregida la mutación con map) ---
  const agregarAlCarrito = (producto, tamano) => {
    const precioFinal = Number((producto.precioBase * multiplicadoresTamano[tamano]).toFixed(2));
    
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

  // --- ACCIONES DE PEDIDOS (Conectado a services y sin duplicar puntos) ---
  const finalizarPedido = async (usuarioId) => {
    if (carrito.length === 0) return;
    const totalNum = Number(calcularTotalCarrito());
    const fechaActual = new Date().toISOString();

    const nuevoPedidoData = {
      usuarioId: usuarioId,
      items: [...carrito],
      total: totalNum,
      estado: "pendiente", // estado en minúscula
      fecha: fechaActual
    };

    try {
      const pedidoCreado = await apiCrearPedido(nuevoPedidoData);
      setPedidos(prev => [pedidoCreado, ...prev]);
      setCarrito([]); // Limpiar carrito
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

  return (
    <AppContext.Provider value={{
      productos,
      carrito,
      agregarAlCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      calcularTotalCarrito,
      pedidos,
      finalizarPedido,
      cambiarEstadoPedido,
      puntosUsuario,
      multiplicadoresTamano
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
