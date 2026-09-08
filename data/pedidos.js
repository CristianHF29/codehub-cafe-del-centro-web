export const pedidos = [
    {
        id: 1,
        usuarioId: 2,
        items: [
            { productoId: 1, nombre: "Espresso", tamano: "16oz", precio: 2.50, cantidad: 2 },
            { productoId: 3, nombre: "Cappuccino", tamano: "20oz", precio: 4.00, cantidad: 1 }
        ],
        total: 9.00,
        estado: "entregado",
        fecha: "2026-09-01T14:30:00.000Z"
    },
    {
        id: 2,
        usuarioId: 2,
        items: [
            { productoId: 5, nombre: "Cold Brew de la Casa", tamano: "24oz", precio: 5.50, cantidad: 1 }
        ],
        total: 5.50,
        estado: "pendiente",
        fecha: "2026-09-05T10:15:00.000Z"
    }
];