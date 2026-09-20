"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerPedidos } from "@/services/pedidosService";

type OrderItem = { nombre?: string; nombreProducto?: string; cantidad?: number; precio?: number };
type Order = { id: number; usuarioId?: number; items?: OrderItem[]; total?: number; estado?: string; fecha?: string };
type RankingItem = { name: string; units: number; amount: number; color: string };

const COLORS = ["#b77945", "#ca9a6a", "#8e9c76", "#d7b36e", "#9caeb0"];

function CoffeeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h2a3 3 0 0 1 0 6h-2M8 4c0 1 .7 1.3.7 2.2M12 3c0 1 .7 1.3.7 2.2" /></svg>;
}

function DashboardIcon({ type }: { type: "overview" | "orders" | "products" | "customers" | "chart" | "logout" }) {
  const content = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    orders: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    products: <><path d="M5 8h12v7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z" /><path d="M17 10h2a3 3 0 0 1 0 6h-2" /></>,
    customers: <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7" r="3.5" /><path d="M16 5a3.5 3.5 0 0 1 0 6.4M19.5 20v-1.4a4.5 4.5 0 0 0-3-4.2" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /></>,
    logout: <><path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" /><path d="M20 12H10M17 9l3 3-3 3" /></>,
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
  const router = useRouter();

  const [usuario, setUsuario] = useState<{ nombre?: string; rol?: string } | null>(null);
  const [active, setActive] = useState("Resumen");
  const [orders, setOrders] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
      router.push("/login");
      return;
    }

    const datos = JSON.parse(usuarioGuardado);

    if (datos.rol !== "admin") {
      router.push("/menu");
      return;
    }

    setUsuario(datos);
  }, [router]);

  useEffect(() => {
    obtenerPedidos()
      .then((data: Order[]) => setOrders(Array.isArray(data) ? data : []))
      .catch((e: Error) => setError(e.message || "No se pudieron cargar los pedidos"))
      .finally(() => setCargando(false));
  }, []);

  const ranking = useMemo(() => {
    const totals = new Map<string, { units: number; amount: number }>();
    orders.forEach((order) => order.items?.forEach((item) => {
      const name = item.nombre ?? item.nombreProducto ?? "Producto";
      const current = totals.get(name) ?? { units: 0, amount: 0 };
      current.units += item.cantidad ?? 1;
      current.amount += (item.cantidad ?? 1) * (item.precio ?? 0);
      totals.set(name, current);
    }));
    return Array.from(totals.entries())
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5)
      .map(([name, values], index) => ({ ...values, name, color: COLORS[index] ?? "#b77945" })) as RankingItem[];
  }, [orders]);

  const totalSales = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders ? totalSales / totalOrders : 0;
  const pendientes = orders.filter((order) => order.estado === "pendiente").length;
  const listos = orders.filter((order) => order.estado === "listo").length;
  const entregados = orders.filter((order) => order.estado === "entregado").length;
  const clientesUnicos = new Set(orders.map((order) => order.usuarioId)).size;
  const totalUnidades = ranking.reduce((sum, item) => sum + item.units, 0);
  const lider = ranking[0];
  const porcentajeLider = totalUnidades ? Math.round((lider?.units ?? 0) / totalUnidades * 100) : 0;
  const maxUnidades = ranking.length ? Math.max(...ranking.map((item) => item.units)) : 1;

  const ultimosDias = useMemo(() => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const clave = fecha.toISOString().slice(0, 10);
      const cantidad = orders.filter((order) => (order.fecha ?? "").slice(0, 10) === clave).length;
      dias.push({
        etiqueta: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][fecha.getDay()],
        cantidad,
        esHoy: i === 0,
      });
    }
    return dias;
  }, [orders]);

  const maxDia = Math.max(1, ...ultimosDias.map((dia) => dia.cantidad));
  const pedidosSemana = ultimosDias.reduce((sum, dia) => sum + dia.cantidad, 0);

  const iniciales = (usuario?.nombre ?? "")
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fechaHoy = new Date().toLocaleDateString("es-SV", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  function cerrarSesion() {
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/"><span><CoffeeIcon /></span><strong>Café del Centro</strong><small>Panel administrativo</small></a>
        <div className="dashboard-menu-label">MENÚ PRINCIPAL</div>
        <nav className="dashboard-nav" aria-label="Navegación del panel">
          <button className={active === "Resumen" ? "active" : ""} onClick={() => setActive("Resumen")}><DashboardIcon type="overview" /><span>Resumen</span></button>
          <button onClick={() => router.push("/menu?vista=pedidos")}><DashboardIcon type="orders" /><span>Pedidos</span>{pendientes > 0 && <b>{pendientes}</b>}</button>
          <button onClick={() => router.push("/menu?vista=productos")}><DashboardIcon type="products" /><span>Productos</span></button>
        </nav>
        <div className="dashboard-sidebar-bottom">
          <button className="dashboard-nav-single" onClick={cerrarSesion}><DashboardIcon type="logout" /><span>Cerrar sesión</span></button>
          <div className="dashboard-user"><span>{iniciales}</span><div><strong>{usuario.nombre}</strong><small>Administrador</small></div></div>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumb"><span>Dashboard</span><i>/</i><strong>{active}</strong></div>
          <div className="dashboard-top-actions">
            <span className="dashboard-updated"><i /> {cargando ? "Cargando datos..." : `${totalOrders} pedidos registrados`}</span>
            <span className="dashboard-top-avatar">{iniciales}</span>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <span className="dashboard-kicker">{fechaHoy}</span>
              <h1>Resumen de ventas</h1>
              <p>Esto es lo que está pasando en tu cafetería.</p>
            </div>
            <div className="dashboard-heading-actions">
              <button className="dashboard-period" onClick={() => router.push("/menu?vista=pedidos")}>Gestionar pedidos</button>
              <button className="dashboard-export" onClick={() => router.push("/menu?vista=productos")}>Gestionar catálogo</button>
            </div>
          </div>

          {error && <p style={{ color: "#a33", marginBottom: "16px" }}>{error}</p>}

          <div className="dashboard-metrics">
            <article><span className="metric-badge metric-brown"><DashboardIcon type="chart" /></span><div><small>VENTAS TOTALES</small><strong>{money(totalSales)}</strong></div></article>
            <article><span className="metric-badge metric-peach"><DashboardIcon type="orders" /></span><div><small>PEDIDOS</small><strong>{totalOrders}</strong></div></article>
            <article><span className="metric-badge metric-sage"><DashboardIcon type="products" /></span><div><small>TICKET PROMEDIO</small><strong>{money(averageTicket)}</strong></div></article>
            <article><span className="metric-badge metric-sand"><DashboardIcon type="customers" /></span><div><small>CLIENTES CON PEDIDOS</small><strong>{clientesUnicos}</strong></div></article>
          </div>

          <div className="dashboard-panels">
            <section className="dashboard-panel dashboard-ranking">
              <div className="dashboard-panel-heading">
                <div><h2>Productos más vendidos</h2><p>Unidades vendidas según los pedidos registrados</p></div>
              </div>
              <div className="ranking-legend"><span><i className="legend-brown" /> Unidades vendidas</span></div>
              {ranking.length === 0 ? (
                <p style={{ padding: "24px 0", color: "#a1978c" }}>Aún no hay pedidos para calcular el ranking.</p>
              ) : (
                <>
                  <div className="ranking-chart">
                    {ranking.map((product, index) => (
                      <div className="ranking-column" key={product.name}>
                        <strong>{product.units}</strong>
                        <div className="ranking-bar-track">
                          <i style={{ height: `${Math.max(14, (product.units / maxUnidades) * 100)}%`, backgroundColor: product.color }} />
                        </div>
                        <span>{shortProductName(product.name)}</span>
                        <small>{index + 1}º lugar</small>
                      </div>
                    ))}
                  </div>
                  <div className="ranking-foot">
                    <span>El producto líder representa el <strong>{porcentajeLider}%</strong> de tus unidades vendidas</span>
                    <button onClick={() => router.push("/menu?vista=productos")}>Ver catálogo <span>→</span></button>
                  </div>
                </>
              )}
            </section>

            <section className="dashboard-panel dashboard-sales">
              <div className="dashboard-panel-heading">
                <div><h2>Pedidos por estado</h2><p>Estado actual de la operación</p></div>
              </div>
              <div className="ranking-chart">
                <div className="ranking-column"><strong>{pendientes}</strong><div className="ranking-bar-track"><i style={{ height: `${Math.max(14, (pendientes / Math.max(1, totalOrders)) * 100)}%`, backgroundColor: "#d7b36e" }} /></div><span>Pendiente</span></div>
                <div className="ranking-column"><strong>{listos}</strong><div className="ranking-bar-track"><i style={{ height: `${Math.max(14, (listos / Math.max(1, totalOrders)) * 100)}%`, backgroundColor: "#9caeb0" }} /></div><span>Listo</span></div>
                <div className="ranking-column"><strong>{entregados}</strong><div className="ranking-bar-track"><i style={{ height: `${Math.max(14, (entregados / Math.max(1, totalOrders)) * 100)}%`, backgroundColor: "#8e9c76" }} /></div><span>Entregado</span></div>
              </div>
              <div className="ranking-foot">
                <span>Ingresos acumulados: <strong>{money(totalSales)}</strong></span>
                <button onClick={() => router.push("/menu?vista=pedidos")}>Ver pedidos <span>→</span></button>
              </div>
            </section>

            <section className="dashboard-panel dashboard-week">
              <div className="dashboard-panel-heading">
                <div><h2>Actividad de la semana</h2><p>Pedidos recibidos en los últimos 7 días</p></div>
              </div>
              <div className="week-visual">
                <div className="week-bars">
                  {ultimosDias.map((dia, index) => (
                    <div key={index} className={dia.esHoy ? "today" : ""}>
                      <span style={{ height: `${Math.max(6, (dia.cantidad / maxDia) * 100)}%` }} />
                      <small>{dia.etiqueta}</small>
                    </div>
                  ))}
                </div>
                <div className="week-result">
                  <span>Esta semana</span>
                  <strong>{pedidosSemana} <small>pedidos</small></strong>
                </div>
              </div>
            </section>

            <section className="dashboard-panel dashboard-insight">
              <span className="insight-symbol">✦</span>
              <div>
                <small>RESUMEN</small>
                {lider ? (
                  <>
                    <h2>Tu {lider.name} es el más pedido</h2>
                    <p>Representa el <strong>{porcentajeLider}%</strong> de las unidades vendidas, con {lider.units} unidades y {money(lider.amount)} en ingresos.</p>
                    <button onClick={() => router.push("/menu?vista=productos")}>Editar catálogo <span>→</span></button>
                  </>
                ) : (
                  <>
                    <h2>Todavía no hay datos suficientes</h2>
                    <p>Cuando los clientes empiecen a hacer pedidos, aquí vas a ver el producto más vendido.</p>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}