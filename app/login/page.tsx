"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesion activa, no tiene sentido mostrar el login
  useEffect(() => {
    const guardado = localStorage.getItem("usuario");
    if (guardado) {
      try {
        const datos = JSON.parse(guardado);
        router.push(datos.rol === "admin" ? "/dashboard" : "/menu");
      } catch {
        localStorage.removeItem("usuario");
      }
    }
  }, [router]);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      const datos = await login(email, password);

      localStorage.setItem("usuario", JSON.stringify(datos));

      if (datos.rol === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/menu");
      }
    } catch (error: unknown) {
      const texto = error instanceof Error ? error.message : "Error al iniciar sesión";
      setMensaje(texto);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--paper)",
          padding: "32px",
          borderRadius: "16px",
          border: "1px solid var(--line)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "8px", color: "var(--brown-dark)" }}>
          Café del Centro
        </h1>

        <p style={{ textAlign: "center", marginBottom: "28px", color: "var(--muted)" }}>
          Iniciar sesión
        </p>

        <form onSubmit={iniciarSesion}>
          <label>Correo electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              marginBottom: "18px",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "6px",
              marginBottom: "18px",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          {mensaje && (
            <p style={{ color: "#a33", marginBottom: "16px", textAlign: "center" }}>
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "var(--brown)",
              color: "white",
              cursor: cargando ? "not-allowed" : "pointer",
              fontSize: "16px",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "22px", color: "var(--muted)" }}>
          ¿No tienes una cuenta?
        </p>

        <button
          type="button"
          onClick={() => router.push("/registro")}
          style={{
            width: "100%",
            padding: "11px",
            border: "1px solid var(--brown)",
            borderRadius: "8px",
            background: "transparent",
            color: "var(--brown-dark)",
            cursor: "pointer",
          }}
        >
          Crear cuenta
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "11px",
            border: "none",
            background: "transparent",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Volver al inicio
        </button>
      </div>
    </main>
  );
}