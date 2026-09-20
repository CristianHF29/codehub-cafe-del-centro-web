# Cafe del Centro - Aplicacion Web de Pedidos

Aplicacion web para Cafe del Centro, cafeteria de especialidad ubicada en el Centro Historico de San Salvador. El cliente arma su pedido eligiendo el tamano del vaso con calculo de precio en tiempo real y acumula puntos de fidelidad. El administrador gestiona el catalogo de productos, el estado de los pedidos y consulta un panel de reportes.

Proyecto de la asignatura Diseno y Programacion de Software Multiplataforma (DPS941), Universidad Don Bosco, ciclo 02/2026. Etapa 2: modulo web con React y Next.js.

## Equipo CodeHub (T-010)

| Integrante | Carnet | Modulo desarrollado |
|---|---|---|
| Rebeca Flores | fd253107 | Autenticacion, registro y rutas protegidas |
| Cristian Arturo Hernandez Flores | hf252375 | API REST, capa de servicios e integracion de modulos |
| Henry Chacon | cg253400 | Catalogo de productos y gestion de imagenes |
| Giovanni Quijano | qs242538 | Carrito de compras, pedidos y puntos de fidelidad |
| Eduardo Amaya | am210570 | Landing page, dashboard de reportes y despliegue |

## Demo

Aplicacion desplegada: https://codehub-cafe-del-centro-web.vercel.app

### Credenciales de prueba

| Rol | Correo | Contrasena |
|---|---|---|
| Administrador | admin@cafedelcentro.com | admin123 |
| Cliente | cliente@correo.com | cliente123 |

Tambien se pueden crear cuentas nuevas desde /registro. Todo usuario registrado se crea con rol cliente.

## Tecnologias

- Next.js 16 con App Router
- React 19
- Tailwind CSS 4
- Context API para el estado global
- Route Handlers de Next.js para la API REST
- Vercel Blob para el almacenamiento de imagenes
- Despliegue continuo en Vercel

## Arquitectura

El proyecto separa la interfaz, la logica de negocio y el acceso a datos en tres capas.

Componentes y paginas (app/, components/): solo presentacion e interaccion. Ningun componente hace peticiones HTTP directamente.

Estado global (context/AppContext.jsx): sesion del usuario, carrito, pedidos, puntos y catalogo. Expone las acciones que consumen los componentes.

Capa de servicios (services/): unica responsable de comunicarse con la API. El archivo api.js centraliza el manejo de peticiones y errores, y los demas archivos exponen funciones por recurso.

API REST (app/api/): Route Handlers con validacion de entrada y respuestas con codigos HTTP apropiados.

Esta separacion permite sustituir la fuente de datos sin modificar los componentes, lo que facilita la migracion a Firebase prevista para la siguiente etapa.

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /api/productos | Lista el catalogo completo |
| POST | /api/productos | Crea un producto |
| GET | /api/productos/[id] | Obtiene un producto |
| PUT | /api/productos/[id] | Actualiza un producto |
| DELETE | /api/productos/[id] | Elimina un producto |
| GET | /api/pedidos | Lista los pedidos, admite ?usuarioId= |
| POST | /api/pedidos | Crea un pedido y acredita los puntos |
| GET | /api/pedidos/[id] | Obtiene un pedido |
| PUT | /api/pedidos/[id] | Cambia el estado del pedido |
| POST | /api/auth/login | Valida credenciales y devuelve el usuario con su rol |
| POST | /api/auth/registro | Crea una cuenta de cliente |
| GET | /api/usuarios/[id] | Devuelve los datos y puntos del usuario |
| POST | /api/upload | Sube una imagen y devuelve su URL publica |

## Funcionalidades

Cliente: registro e inicio de sesion, menu con imagenes, seleccion de tamano de vaso (16, 20, 24 y 32 oz) con precio dinamico, carrito con control de cantidades, confirmacion de pedido, acumulacion de un punto por dolar gastado e historial de pedidos con su estado.

Administrador: gestion del catalogo con creacion, edicion, eliminacion y carga de imagenes. Control del flujo de pedidos entre los estados pendiente, listo y entregado. Panel de reportes con ventas totales, ticket promedio, ranking de productos mas vendidos, distribucion por estado y actividad de los ultimos siete dias.

Control de acceso: las rutas /menu y /dashboard requieren sesion activa. El dashboard es exclusivo del rol administrador, y un cliente que intente acceder es redirigido al menu.

## Instalacion

```bash
git clone https://github.com/CristianHF29/codehub-cafe-del-centro-web.git
cd codehub-cafe-del-centro-web
npm install
npm run dev
```

La aplicacion queda disponible en http://localhost:3000

## Estructura del proyecto

```
app/
  api/               Endpoints REST
  login/             Inicio de sesion
  registro/          Registro de clientes
  menu/              Menu del cliente y panel de administracion
  dashboard/         Reportes del administrador
  customer-home.tsx  Landing publica
components/          Carrito, historial, gestion de pedidos y catalogo
context/             Estado global de la aplicacion
services/            Capa de acceso a la API
data/                Fuente de datos en memoria
```


## Consideraciones

Los datos de productos, pedidos y usuarios se almacenan en memoria dentro de data/, por lo que se restablecen con cada despliegue o reinicio del servidor. Las contrasenas se manejan en texto plano por tratarse de datos de prueba. La persistencia con Firebase Firestore y el cifrado de credenciales corresponden a la siguiente etapa del proyecto.
