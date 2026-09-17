"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          password,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "Error al registrar la cuenta");
        return;
      }

      // Guardar el usuario registrado
      localStorage.setItem("usuario", JSON.stringify(datos));

      // Ir al menú después del registro
      router.push("/menu");
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
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
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
            color: "var(--brown-dark)",
          }}
        >
          Café del Centro
        </h1>

        <p
          style={{
            textAlign: "center",
            marginBottom: "28px",
            color: "var(--muted)",
          }}
        >
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
            <p
              style={{
                color: "#a33",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
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
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            color: "var(--muted)",
          }}
        >
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
      </div>
    </main>
  );
}