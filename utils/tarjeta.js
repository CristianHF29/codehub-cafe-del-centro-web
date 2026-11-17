// Validación de tarjeta de demostración: la misma lógica que usa la app móvil.
// No se cobra nada ni se guardan los datos; del número solo se guardan los últimos 4 dígitos.

export const TARJETA_VACIA = { numero: "", nombre: "", vencimiento: "", cvv: "" };

export function soloDigitos(valor) {
    return valor.replace(/\D/g, "");
}

export function formatearNumero(valor) {
    return soloDigitos(valor).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatearVencimiento(valor) {
    const digitos = soloDigitos(valor).slice(0, 4);
    return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

export function detectarMarca(numero) {
    const digitos = soloDigitos(numero);
    if (/^4/.test(digitos)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(digitos)) return "MASTERCARD";
    if (/^3[47]/.test(digitos)) return "AMEX";
    return "";
}

export function ultimosDigitos(numero) {
    return soloDigitos(numero).slice(-4);
}

// Algoritmo de Luhn: detecta números de tarjeta mal escritos
function pasaLuhn(numero) {
    let suma = 0;

    soloDigitos(numero)
        .split("")
        .reverse()
        .forEach((caracter, indice) => {
            const digito = Number(caracter);
            if (indice % 2 === 1) {
                const doble = digito * 2;
                suma += doble > 9 ? doble - 9 : doble;
            } else {
                suma += digito;
            }
        });

    return suma % 10 === 0;
}

function vencimientoValido(valor) {
    if (!/^\d{2}\/\d{2}$/.test(valor)) return false;

    const [mes, anio] = valor.split("/").map(Number);
    if (mes < 1 || mes > 12) return false;

    const hoy = new Date();
    const anioActual = hoy.getFullYear() % 100;
    const mesActual = hoy.getMonth() + 1;

    return anio > anioActual || (anio === anioActual && mes >= mesActual);
}

export function validarTarjeta(datos) {
    const errores = {};
    const numero = soloDigitos(datos.numero);

    if (numero.length < 15) {
        errores.numero = "Número incompleto";
    } else if (!pasaLuhn(numero)) {
        errores.numero = "El número de tarjeta no es válido";
    }

    if (datos.nombre.trim().length < 3) {
        errores.nombre = "Escribe el nombre como aparece en la tarjeta";
    }

    if (!vencimientoValido(datos.vencimiento)) {
        errores.vencimiento = "Fecha inválida o vencida";
    }

    if (!/^\d{3,4}$/.test(datos.cvv)) {
        errores.cvv = "CVV inválido";
    }

    return errores;
}