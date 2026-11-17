"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSesion } from "@/context/SesionContext";
import { mensajeError } from "@/services/errores";
import BotonGoogle from "@/components/BotonGoogle";

export default function RegistroPage() {
  const router = useRouter();
  const { usuario, cargando: cargandoSesion, registrarse, iniciarConGoogle } = useSesion();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // Al crearse la cuenta Firebase inicia la sesión, y este efecto lleva al menú
  useEffect(() => {
    if (!cargandoSesion && usuario) {
      router.push(usuario.rol === "admin" ? "/dashboard" : "/menu");
    }
  }, [cargandoSesion, usuario, router]);

  const registrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    setMensaje("");

    if (nombre.trim().length < 3) {
      setMensaje("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);

    try {
      await registrarse(nombre, email, password);
    } catch (error: unknown) {
      setMensaje(mensajeError(error));
      setCargando(false);
    }
  };

  const entrarConGoogle = async () => {
    setMensaje("");
    setCargando(true);

    try {
      const user = await iniciarConGoogle();
      if (!user) setCargando(false);
    } catch (error: unknown) {
      setMensaje(mensajeError(error));
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
          Crear una cuenta
        </p>

        <form onSubmit={registrarUsuario}>
          <label>Nombre completo</label>

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
            minLength={3}
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
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
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
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <BotonGoogle onClick={entrarConGoogle} deshabilitado={cargando} />

        <p style={{ textAlign: "center", marginTop: "22px", color: "var(--muted)" }}>
          ¿Ya tienes una cuenta?
        </p>

        <button
          type="button"
          onClick={() => router.push("/login")}
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
          Iniciar sesión
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