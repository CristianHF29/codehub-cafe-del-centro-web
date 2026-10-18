const foto = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=500&q=80`;

export const productos = [
    {
        id: 1,
        nombre: "Espresso",
        descripcion: "Doble shot corto extraído con precisión milimétrica",
        categoria: "clasicos",
        imagen: foto("photo-1510591509098-f4fdc6d0ff04"),
        disponible: true,
        precios: { "16oz": 2.50, "20oz": 3.00, "24oz": 3.50, "32oz": 4.00 }
    },
    {
        id: 2,
        nombre: "Americano",
        descripcion: "Doble shot de espresso diluido en agua caliente filtrada",
        categoria: "clasicos",
        imagen: foto("photo-1495474472287-4d71bcdd2085"),
        disponible: true,
        precios: { "16oz": 2.75, "20oz": 3.25, "24oz": 3.75, "32oz": 4.25 }
    },
    {
        id: 3,
        nombre: "Cappuccino",
        descripcion: "Espresso clásico con partes iguales de leche y espuma densa",
        categoria: "clasicos",
        imagen: foto("photo-1572442388796-11668a67e53d"),
        disponible: true,
        precios: { "16oz": 3.50, "20oz": 4.00, "24oz": 4.50, "32oz": 5.00 }
    },
    {
        id: 4,
        nombre: "Latte de la casa",
        descripcion: "Textura sedosa de leche coronando nuestro espresso de origen",
        categoria: "clasicos",
        imagen: foto("photo-1541167760496-1628856ab772"),
        disponible: true,
        precios: { "16oz": 3.75, "20oz": 4.25, "24oz": 4.75, "32oz": 5.25 }
    },
    {
        id: 5,
        nombre: "Cold Brew de la Casa",
        descripcion: "Extracción en frío durante 18 horas para un sabor suave y refrescante",
        categoria: "frios",
        imagen: foto("photo-1461023058943-07fcbe16d735"),
        disponible: true,
        precios: { "16oz": 4.50, "20oz": 5.00, "24oz": 5.50, "32oz": 6.00 }
    },
    {
        id: 6,
        nombre: "Filtrados de Especialidad",
        descripcion: "Métodos artesanales (V60, Chemex, Aeropress) con granos premium de temporada",
        categoria: "filtrados",
        imagen: foto("photo-1495474472287-4d71bcdd2085"),
        disponible: true,
        precios: { "16oz": 4.75, "20oz": 5.25, "24oz": 5.75, "32oz": 6.25 }
    }
];