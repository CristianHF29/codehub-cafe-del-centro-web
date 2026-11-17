import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Todo usuario nuevo nace como cliente con 0 puntos. El rol de admin solo se
// asigna desde la consola de Firebase, y las reglas impiden que alguien se lo ponga solo.
function perfilInicial(nombre, email) {
    return {
        nombre,
        email,
        rol: "cliente",
        puntos: 0,
        creado: serverTimestamp(),
    };
}

export async function registrar(nombre, email, password) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: nombre });
    await setDoc(doc(db, "usuarios", user.uid), perfilInicial(nombre, email));
    return user;
}

export async function iniciarSesion(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

// En el navegador Google abre una ventana emergente; no hace falta ninguna build.
// Devuelve null si la persona cierra la ventana sin elegir cuenta.
export async function iniciarSesionConGoogle() {
    try {
        const proveedor = new GoogleAuthProvider();
        proveedor.setCustomParameters({ prompt: "select_account" });

        const { user } = await signInWithPopup(auth, proveedor);
        await asegurarPerfil(user);
        return user;
    } catch (error) {
        if (error?.code === "auth/popup-closed-by-user") return null;
        if (error?.code === "auth/cancelled-popup-request") return null;
        throw error;
    }
}

export function cerrarSesion() {
    return signOut(auth);
}

// Crea el perfil si el usuario todavía no tiene uno en Firestore
// (pasa la primera vez que alguien entra con Google)
export async function asegurarPerfil(user) {
    const referencia = doc(db, "usuarios", user.uid);
    const actual = await getDoc(referencia);

    if (!actual.exists()) {
        const nombre = user.displayName ?? user.email?.split("@")[0] ?? "Cliente";
        await setDoc(referencia, perfilInicial(nombre, user.email ?? ""));
    }
}