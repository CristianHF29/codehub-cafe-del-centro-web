"use client";

import { useEffect, useMemo, useState } from "react";

type OrderItem = { nombre?: string; nombreProducto?: string; cantidad?: number; precio?: number };
type Order = { id: number; items?: OrderItem[]; total?: number; estado?: string; fecha?: string };
type RankingItem = { name: string; units: number; amount: number; color: string };

const fallbackRanking: RankingItem[] = [
  { name: "Latte de la casa", units: 426, amount: 1917, color: "#b77945" },
  { name: "Cold Brew de la Casa", units: 342, amount: 1881, color: "#ca9a6a" },
  { name: "Cappuccino", units: 288, amount: 1152, color: "#8e9c76" },
  { name: "Filtrados de Especialidad", units: 214, amount: 1230, color: "#d7b36e" },
  { name: "Americano", units: 186, amount: 651, color: "#9caeb0" },
];

function CoffeeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h2a3 3 0 0 1 0 6h-2M8 4c0 1 .7 1.3.7 2.2M12 3c0 1 .7 1.3.7 2.2" /></svg>;
}

function DashboardIcon({ type }: { type: "overview" | "orders" | "products" | "customers" | "chart" | "settings" }) {
  const content = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    orders: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    products: <><path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h2a3 3 0 0 1 0 6h-2" /></>,
    customers: <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7" r="3.5" /><path d="M16 5a3.5 3.5 0 0 1 0 6.4M19.5 20v-1.4a4.5 4.5 0 0 0-3-4.2" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0 .3 1.9 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-2.2 1.4Z" /></>,
  }[type];

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{content}</svg>;
}

function money(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortProductName(name: string) {
  return name.replace(" de la Casa", "").replace(" de Especialidad", "");
}

export default function DashboardPage() {
  const [active, setActive] = useState("Resumen");
  const [range, setRange] = useState("Este mes");
  const [orders, setOrders] = useState<Order[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/pedidos")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("No se pudieron cargar los pedidos")))
      .then((data: Order[]) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, []);

  const ranking = useMemo(() => {
    if (!orders.length) return fallbackRanking;
    const totals = new Map<string, { units: number; amount: number }>();
    orders.forEach((order) => order.items?.forEach((item) => {
      const name = item.nombre ?? item.nombreProducto ?? "Producto";
      const current = totals.get(name) ?? { units: 0, amount: 0 };
      current.units += item.cantidad ?? 1;
      current.amount += (item.cantidad ?? 1) * (item.precio ?? 0);
      totals.set(name, current);
    }));
    return Array.from(totals.entries()).sort((a, b) => b[1].units - a[1].units).slice(0, 5).map(([name, values], index) => ({ ...values, name, color: fallbackRanking[index]?.color ?? "#b77945" }));
  }, [orders]);

  const totalSales = orders.length ? orders.reduce((sum, order) => sum + (order.total ?? 0), 0) : 12840;
  const totalOrders = orders.length || 843;
  const averageTicket = totalOrders ? totalSales / totalOrders : 15.23;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/"><span><CoffeeIcon /></span><strong>Café del Centro</strong><small>Panel administrativo</small></a>
        <div className="dashboard-menu-label">MENÚ PRINCIPAL</div>
        <nav className="dashboard-nav" aria-label="Navegación del panel">
          {[{ label: "Resumen", icon: "overview" as const }, { label: "Pedidos", icon: "orders" as const }, { label: "Productos", icon: "products" as const }, { label: "Clientes", icon: "customers" as const }].map((item) => <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => { setActive(item.label); if (item.label !== "Resumen") showNotice(`${item.label}: vista disponible próximamente`); }}><DashboardIcon type={item.icon} /><span>{item.label}</span>{item.label === "Pedidos" && <b>12</b>}</button>)}
        </nav>
        <div className="dashboard-menu-label dashboard-report-label">REPORTES</div>
        <button className={`dashboard-nav-single ${active === "Analítica" ? "active" : ""}`} onClick={() => setActive("Analítica")}><DashboardIcon type="chart" /><span>Analítica</span></button>
        <div className="dashboard-sidebar-bottom"><button className="dashboard-nav-single" onClick={() => showNotice("Configuración: vista disponible próximamente")}><DashboardIcon type="settings" /><span>Configuración</span></button><div className="dashboard-user"><span>MG</span><div><strong>María González</strong><small>Administrador</small></div><i>⌄</i></div></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar"><div className="dashboard-breadcrumb"><span>Dashboard</span><i>/</i><strong>{active}</strong></div><div className="dashboard-top-actions"><span className="dashboard-updated"><i /> Datos actualizados hace 5 min</span><button onClick={() => showNotice("No tienes notificaciones nuevas")} aria-label="Notificaciones" className="dashboard-bell">♢<i /></button><span className="dashboard-top-avatar">MG</span></div></header>
        <div className="dashboard-content">
          <div className="dashboard-heading"><div><span className="dashboard-kicker">MIÉRCOLES, 16 DE SEPTIEMBRE DE 2026</span><h1>Resumen de ventas <em>✦</em></h1><p>Esto es lo que está pasando en tu cafetería.</p></div><div className="dashboard-heading-actions"><button onClick={() => setRange(range === "Este mes" ? "Últimos 30 días" : "Este mes")} className="dashboard-period">{range}<span>⌄</span></button><button onClick={() => showNotice("Reporte preparado para descargar")} className="dashboard-export">⇩ <span>Exportar reporte</span></button></div></div>

          <div className="dashboard-metrics"><article><span className="metric-badge metric-brown"><DashboardIcon type="chart" /></span><div><small>VENTAS TOTALES</small><strong>{orders.length ? money(totalSales) : "$12,840"}</strong><p><em>↗ 12.5%</em> vs. mes anterior</p></div><button>•••</button></article><article><span className="metric-badge metric-peach"><DashboardIcon type="orders" /></span><div><small>PEDIDOS</small><strong>{orders.length || "843"}</strong><p><em>↗ 8.2%</em> vs. mes anterior</p></div><button>•••</button></article><article><span className="metric-badge metric-sage"><DashboardIcon type="products" /></span><div><small>TICKET PROMEDIO</small><strong>{orders.length ? money(averageTicket) : "$15.23"}</strong><p><em>↗ 4.3%</em> vs. mes anterior</p></div><button>•••</button></article><article><span className="metric-badge metric-sand"><DashboardIcon type="customers" /></span><div><small>CLIENTES RECURRENTES</small><strong>68.4%</strong><p><em>↗ 6.1%</em> vs. mes anterior</p></div><button>•••</button></article></div>

          <div className="dashboard-panels"><section className="dashboard-panel dashboard-ranking"><div className="dashboard-panel-heading"><div><h2>Productos más vendidos</h2><p>Unidades vendidas este mes</p></div><button className="panel-more" onClick={() => showNotice("Mostrando el ranking completo")}>•••</button></div><div className="ranking-legend"><span><i className="legend-brown" /> Unidades vendidas</span><button onClick={() => showNotice("Filtro de periodo: Este mes")}>{range}<span>⌄</span></button></div><div className="ranking-chart">{ranking.map((product, index) => <div className="ranking-column" key={product.name}><strong>{product.units}</strong><div className="ranking-bar-track"><i style={{ height: `${Math.max(14, (product.units / Math.max(...ranking.map((item) => item.units))) * 100)}%`, backgroundColor: product.color }} /></div><span>{shortProductName(product.name)}</span><small>{index + 1}º lugar</small></div>)}</div><div className="ranking-foot"><span>El producto líder representa el <strong>32.8%</strong> de tus unidades vendidas</span><button onClick={() => showNotice("Abriendo catálogo de productos")}>Ver productos <span>→</span></button></div></section>

            <section className="dashboard-panel dashboard-sales"><div className="dashboard-panel-heading"><div><h2>Ventas por periodo</h2><p>Rendimiento de tus ventas durante el año</p></div><button className="panel-select" onClick={() => showNotice("Año 2026 seleccionado")}>2026 <span>⌄</span></button></div><div className="sales-chart"><div className="sales-y-axis"><span>$2,500</span><span>$2,000</span><span>$1,500</span><span>$1,000</span><span>$500</span></div><div className="sales-plot"><div className="sales-grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 900 250" preserveAspectRatio="none" role="img" aria-label="Ventas por mes"><defs><linearGradient id="salesArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b77945" stopOpacity=".22" /><stop offset="100%" stopColor="#b77945" stopOpacity="0" /></linearGradient></defs><path d="M0 190 L82 154 L164 171 L246 118 L328 136 L410 92 L492 106 L574 63 L656 78 L738 36 L820 58 L900 14 L900 250 L0 250 Z" fill="url(#salesArea)" /><path d="M0 190 L82 154 L164 171 L246 118 L328 136 L410 92 L492 106 L574 63 L656 78 L738 36 L820 58 L900 14" fill="none" stroke="#b77945" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="738" cy="36" r="5" fill="#fffdf8" stroke="#b77945" strokeWidth="3" /></svg><div className="sales-x-axis">{["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((month) => <span key={month}>{month}</span>)}</div></div></div><div className="sales-summary"><div><small>TOTAL DEL AÑO</small><strong>$18,429 <em>↗ 18.2%</em></strong></div><div><small>MEJOR DÍA</small><strong>Miércoles <span>· $2,840</span></strong></div></div></section>

            <section className="dashboard-panel dashboard-week"><div className="dashboard-panel-heading"><div><h2>Actividad de la semana</h2><p>Pedidos recibidos por día</p></div><button className="panel-more" onClick={() => showNotice("Mostrando actividad detallada")}>•••</button></div><div className="week-visual"><div className="week-bars">{[52, 72, 61, 90, 66, 78, 38].map((height, index) => <div key={index} className={index === 3 ? "today" : ""}><span style={{ height: `${height}%` }} /><small>{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}</small></div>)}</div><div className="week-result"><span>Esta semana</span><strong>186 <small>pedidos</small></strong><em>↗ 14.8%</em></div></div></section>

            <section className="dashboard-panel dashboard-insight"><span className="insight-symbol">✦</span><div><small>INSIGHT DE LA SEMANA</small><h2>Tu Latte de la casa es el favorito</h2><p>Representa el <strong>24.6%</strong> de tus ventas. Los miércoles vendes un 32% más de bebidas calientes.</p><button onClick={() => showNotice("Mostrando análisis detallado")}>Ver análisis completo <span>→</span></button></div></section>
          </div>
        </div>
        {notice && <div className="dashboard-toast">✓ {notice}</div>}
      </section>
    </main>
  );
}
