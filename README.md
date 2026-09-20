# Panel de Tarjetas QR

App para imprimir carteles con código QR y decidir, desde un panel privado,
a dónde apunta cada uno (reseña de Google, Instagram, o cualquier URL) —
y poder cambiarlo cuando quieras sin reimprimir el QR.

## Cómo funciona

- Cada tarjeta tiene un código (ej. `re-001`) y un QR que apunta a
  `tudominio.com/r/re-001`.
- Esa ruta (`/r/[code]`) es **pública**: cualquiera que escanee el QR
  entra ahí, sin login, y lo mandamos (redirect) a donde vos asignaste.
- El panel de administración (`/admin`) está protegido con contraseña:
  ahí creás tarjetas, les asignás destino, probás el link y descargás
  el QR en PNG para imprimir.
- Los datos se guardan en Redis (Upstash), gratis hasta un uso bastante
  generoso.

## 1. Requisitos

- Node.js 18 o más nuevo instalado en tu computadora.
- Una cuenta gratis en [Upstash](https://upstash.com) (base de datos).
- Una cuenta gratis en [Vercel](https://vercel.com) (para publicar la app).
- Una cuenta en GitHub (para subir el código).

## 2. Probarlo en tu computadora

```bash
npm install
cp .env.example .env.local
```

Editá `.env.local` y completá `ADMIN_PASSWORD` y `ADMIN_SECRET` con lo
que quieras (inventá una frase larga para `ADMIN_SECRET`). Las variables
de Upstash las completás en el paso siguiente.

## 3. Crear la base de datos (Upstash)

1. Entrá a [upstash.com](https://upstash.com) y creá una cuenta gratis.
2. Creá una base de datos de tipo **Redis**.
3. En el detalle de la base, buscá la sección **REST API** y copiá:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Pegalos en tu `.env.local`.

Ahora podés correr:

```bash
npm run dev
```

Y abrir `http://localhost:3000/admin` (te va a pedir la contraseña que
pusiste en `ADMIN_PASSWORD`).

## 4. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "primera versión"
```

Creá un repositorio nuevo en GitHub y seguí las instrucciones que te da
para subir este código (`git remote add origin ...` y `git push`).

## 5. Publicarlo en Vercel

1. Entrá a [vercel.com](https://vercel.com), iniciá sesión con GitHub.
2. "Add New Project" → elegí el repositorio que acabás de subir.
3. En **Environment Variables**, agregá las mismas 4 variables de tu
   `.env.local`:
   - `ADMIN_PASSWORD`
   - `ADMIN_SECRET`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Hacé clic en **Deploy**.

En un par de minutos tenés la app publicada en algo como
`https://qr-panel-tuusuario.vercel.app`. Ese es el dominio que van a
llevar tus QR (se arma solo, no hace falta configurar nada más).

Si más adelante querés un dominio propio (ej. `micarteldigital.com`),
lo conectás desde el mismo proyecto en Vercel → **Settings → Domains**.

## 6. Usar el panel

1. Entrá a `tudominio.com/admin` y poné tu contraseña.
2. Tocá **+ Nueva tarjeta**: se genera un código (`re-001`, `re-002`, ...).
3. Tocá la tarjeta para abrirla, cargá el nombre del local y el destino:
   - **Reseña de Google**: pegá el link de reseñas o el Place ID.
   - **Instagram**: pegá el usuario o el link del perfil.
   - **URL directa**: cualquier link.
4. Tocá **Asignar esta tarjeta**.
5. Descargá el QR (botón **Descargar QR**) e imprimilo donde quieras.
6. Podés reasignar el destino de una tarjeta ya impresa en cualquier
   momento — el QR físico no cambia, solo cambia a dónde apunta.

## Notas de seguridad para producción real

- Este login es simple (una sola contraseña compartida) — suficiente
  para uso propio o de un equipo chico. Si vas a tener varios
  administradores con permisos distintos, conviene sumar un sistema de
  autenticación más completo (ej. NextAuth).
- Usá una `ADMIN_SECRET` larga y random, y no la compartas.
- Cambiá `ADMIN_PASSWORD` de tanto en tanto.
