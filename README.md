# BAYLU – tienda con Supabase (sitio estático, sin build, listo para Vercel)

Archivos: `index.html` + `app.js` (tienda), `admin.html` (panel), `config.js` (único archivo a editar), `schema.sql` (base y permisos), `style.css`, `vercel.json`.

## 1. Crear el proyecto en Supabase (necesitás una cuenta tuya)
1. Entrá a supabase.com, creá una cuenta y un proyecto nuevo (Free alcanza para empezar). Guardá la contraseña de la base.
2. En Project Settings > API copiá **Project URL** y la clave **anon public**. Pegalas en `config.js`.
   Nunca uses ni pegues la clave `service_role` en este proyecto: la tienda no la necesita.

## 2. Tablas y permisos
1. En Supabase abrí **SQL Editor**, pegá todo `schema.sql` y tocá **Run**.
2. Crea las tablas `products`, `categories` y `admins`, el bucket público `products` para imágenes y las reglas RLS: cualquiera lee solo productos publicados; solo los administradores escriben.

## 3. Crear tu usuario administrador
1. Authentication > Users > **Add user**: tu email y una contraseña larga (marcá "Auto Confirm User").
2. En SQL Editor ejecutá (con tu email): `insert into admins(user_id) select id from auth.users where email='tu@email.com';`
3. Recomendado: en Authentication > Sign In / Providers desactivá el registro de nuevos usuarios.

## 4. Conectar Supabase con Vercel
Es un sitio estático: no hace falta variable de entorno. La URL y la clave anon van en `config.js` y son públicas por diseño; la seguridad la dan las reglas RLS. La `service_role` queda fuera.

## 5. Agregar productos
Abrí `tudominio.com/admin.html`, ingresá, completá el formulario (nombre, precio, precio anterior, stock, categoría, variantes, etiquetas, imágenes) y marcá "Publicado". Creá categorías al final de la página.

## 6. Cambiar precios y fotos
En la lista tocá **Editar**, cambiá el precio o stock, quitá una imagen con × y subí otra. Al guardar, el cambio se ve en toda la tienda (inicio, catálogo, buscador, ofertas, ficha y relacionados) porque todo lee la misma tabla.

## 7. Número de WhatsApp
En `config.js`: `WHATSAPP = "549..."` (código de país, sin + ni espacios). Subí el cambio a Vercel.

## 8. Publicar en Vercel
1. Subí esta carpeta a un repositorio de GitHub.
2. En vercel.com: Add New > Project > importá el repo. Framework: **Other**, sin comando de build. Deploy.

## 9. Dominio propio
Vercel > tu proyecto > Settings > Domains > agregá tu dominio. Vercel te muestra los registros DNS exactos para cargar en donde compraste el dominio. La propagación puede tardar desde minutos hasta horas.

## Pendientes antes de vender
- Completar políticas de envío, cambios y privacidad (el pie lo marca).
- Subir fotos reales; mientras tanto los productos sin imagen muestran un bloque con la inicial.
- Mercado Pago: la función `checkout()` en `app.js` es el punto de integración; requiere una función serverless con tu access token en variables de entorno.

## Panel de administración (`/admin`)
- Entrá a `https://TU-DOMINIO/admin` (o `https://tu-proyecto.vercel.app/admin`). Sin sesión ves el login; con un usuario que no está en la tabla `admins`, te saca.
- Secciones: Resumen (totales, sin stock, destacados, últimos agregados), Productos (buscar, agregar, editar, publicar/ocultar, eliminar) y Categorías.
- Las fotos se guardan en Supabase Storage (JPG, PNG o WebP de hasta 5 MB, máximo 8 por producto). Al reemplazar o eliminar, se borran las anteriores.
- Validación: el panel valida los datos y la base los vuelve a validar (`actualizacion-validacion.sql`; ya está incluido al final de `schema.sql`. Si ya habías corrido el `schema.sql` anterior, corré solo `actualizacion-validacion.sql`).
- Nadie puede registrarse como administrador: el panel no tiene registro, y además solo escribe quien esté en `admins` (RLS). Desactivá igualmente "Allow new users to sign up" en Supabase.

## Pedidos por WhatsApp
El carrito arma el mensaje con productos, cantidades y total y abre WhatsApp al número de `config.js` (`WHATSAPP`). El stock no se descuenta solo: ajustalo desde el panel cuando confirmes una venta.
