import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Mismo proyecto de Firebase que la app móvil: web y móvil comparten
// usuarios, productos y pedidos. Estos valores identifican al proyecto,
// no dan acceso a los datos; eso lo controlan las reglas de Firestore.
const firebaseConfig = {
    apiKey: "AIzaSyCNdOuEBQzmtxVmeINKB9mpWN7QFfC2MFI",
    authDomain: "cafe-del-centro-5df50.firebaseapp.com",
    projectId: "cafe-del-centro-5df50",
    storageBucket: "cafe-del-centro-5df50.firebasestorage.app",
    messagingSenderId: "470528255428",
    appId: "1:470528255428:web:0ea8c3fe8961791909f091",
};

// Evita inicializar Firebase dos veces cuando Next recarga el código
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);