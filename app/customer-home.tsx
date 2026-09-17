"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  disponible: boolean;
  precios?: Record<string, number>;
};

const fallbackProducts: Product[] = [
  { id: 1, nombre: "Espresso", descripcion: "Doble shot corto extraído con precisión milimétrica.", categoria: "clásicos", disponible: true, precios: { "16oz": 2.5 } },
  { id: 2, nombre: "Americano", descripcion: "Espresso doble con agua caliente filtrada.", categoria: "clásicos", disponible: true, precios: { "16oz": 2.75 } },
  { id: 3, nombre: "Cappuccino", descripcion: "Espresso clásico, leche sedosa y espuma densa.", categoria: "clásicos", disponible: true, precios: { "16oz": 3.5 } },
  { id: 4, nombre: "Latte de la casa", descripcion: "Textura sedosa de leche coronando nuestro espresso.", categoria: "clásicos", disponible: true, precios: { "16oz": 3.75 } },
];

function CoffeeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h2a3 3 0 0 1 0 6h-2M8 4c0 1 .7 1.3.7 2.2M12 3c0 1 .7 1.3.7 2.2" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function formatPrice(product: Product) {
  const price = product.precios?.["16oz"] ?? 0;
  return `$${price.toFixed(2)}`;
}

export default function CustomerHome() {
  const [products, setProducts] = useState(fallbackProducts);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/productos")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("No se pudo cargar el menú")))
      .then((data: Product[]) => {
        if (Array.isArray(data) && data.length > 0) setProducts(data.filter((product) => product.disponible).slice(0, 4));
      })
      .catch(() => undefined);
  }, []);

  function addToCart(productName: string) {
    setCartCount((count) => count + 1);
    setNotice(`${productName} se agregó a tu pedido`);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <main className="storefront">
      <header className="store-header">
        <a className="store-brand" href="#inicio"><span className="brand-cup"><CoffeeIcon /></span><span><strong>Café del Centro</strong><small>Especialidad, calidez y buenos momentos</small></span></a>
        <nav className="store-nav" aria-label="Navegación de la cafetería"><a href="#menu">Menú</a><a href="#historia">Nuestra historia</a><a href="#contacto">Contacto</a></nav>
        <div className="store-actions"><a className="dashboard-link" href="/dashboard">Panel admin</a><button className="cart-button" aria-label={`Pedido, ${cartCount} productos`} onClick={() => setNotice(cartCount ? `Tienes ${cartCount} producto${cartCount === 1 ? "" : "s"} en tu pedido` : "Tu pedido está vacío")}>Pedido <span>{cartCount}</span></button></div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy"><span className="section-kicker">CAFÉ DE ESPECIALIDAD · DESDE 2018</span><h1>Un buen café<br /><em>conecta.</em></h1><p>Granos seleccionados, manos expertas y un espacio para disfrutar sin prisa en el corazón de la ciudad.</p><div className="hero-actions"><a className="primary-button" href="#menu">Ver el menú <ArrowIcon /></a><a className="quiet-link" href="#historia">Conoce nuestra historia <ArrowIcon /></a></div></div>
        <div className="hero-art" aria-label="Ilustración de una taza de café"><div className="sun-disc" /><div className="steam steam-one" /><div className="steam steam-two" /><div className="cup-illustration"><div className="cup-top"><span /></div><div className="cup-body" /><div className="cup-handle" /></div><span className="art-caption">HECHO CON TIEMPO<br /><strong>Y BUEN GRANO</strong></span></div>
        <div className="hero-foot"><span>San Salvador · Centro Histórico</span><span className="scroll-hint"><i /> Desliza para descubrir</span><span>Lun — Sáb · 7:00 AM — 6:00 PM</span></div>
      </section>

      <section className="menu-section" id="menu"><div className="section-intro"><div><span className="section-kicker">PARA CADA MOMENTO</span><h2>Elige tu<br /><em>favorito.</em></h2></div><p>Desde un espresso intenso hasta un latte suave. Preparamos cada taza respetando el origen y el momento.</p></div><div className="menu-grid">{products.map((product, index) => <article className={`menu-card card-${index + 1}`} key={product.id}><div className="card-number">0{index + 1}</div><div className="card-icon"><CoffeeIcon /></div><span className="product-category">{product.categoria}</span><h3>{product.nombre}</h3><p>{product.descripcion}</p><div className="card-bottom"><strong>{formatPrice(product)}</strong><button aria-label={`Agregar ${product.nombre}`} onClick={() => addToCart(product.nombre)}><ArrowIcon /></button></div></article>)}</div><a className="outline-button" href="#contacto">Ver todos los productos <ArrowIcon /></a></section>

      <section className="story-section" id="historia"><div className="story-visual"><div className="story-stamp">CD<br /><small>2018</small></div><span>ORIGEN · OFICIO · ENCUENTRO</span></div><div className="story-copy"><span className="section-kicker">NUESTRA FILOSOFÍA</span><h2>El café sabe mejor<br /><em>cuando se comparte.</em></h2><p>Creemos que una cafetería es mucho más que una barra. Es ese punto de encuentro donde las ideas se vuelven conversaciones y el tiempo se disfruta de otra forma.</p><a className="quiet-link" href="#contacto">Ven a conocernos <ArrowIcon /></a></div></section>

      <section className="contact-section" id="contacto"><div><span className="section-kicker">ATENCIÓN & RESERVAS</span><h2>Conectemos sobre<br /><em>un buen café.</em></h2><p>¿Tienes una ocasión especial o quieres reservar un espacio? Escríbenos, nos encantará recibirte.</p></div><a className="primary-button" href="mailto:hola@cafedelcentro.com">Enviar un mensaje <ArrowIcon /></a></section>

      <footer className="store-footer"><a className="store-brand" href="#inicio"><span className="brand-cup"><CoffeeIcon /></span><span><strong>Café del Centro</strong><small>Especialidad, calidez y buenos momentos</small></span></a><span>© 2026 Café del Centro</span><div><a href="#menu">Menú</a><a href="#contacto">Contacto</a><a href="/dashboard">Dashboard</a></div></footer>
      {notice && <div className="store-toast">✓ {notice}</div>}
    </main>
  );
}
