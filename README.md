# HomeEstate · Frontend

React 19, React Router 7, Vite 7 y Tailwind 4. Aplicación JavaScript, sin Next.js ni SSR. La entrada activa está en la raíz y carga src/main.jsx. El resultado de la auditoría está en [AUDIT.md](AUDIT.md).

**La SPA activa no necesita backend.** El repositorio conserva dos proyectos independientes: backend (API demo opcional) y frontend (implementación anterior). Ninguno forma parte del build raíz; no deben seleccionarse como raíz del despliegue. No se han eliminado por desconocerse su uso externo. El backend reutiliza el catálogo raíz y debe ejecutarse dentro de este repositorio completo.

## Desarrollo y despliegue

Requiere Node 22.12 o superior compatible con Vite 7. Desde esta carpeta, ejecutar `npm ci` y después `npm run dev`. Para producción ejecutar `npm run build` y publicar **solo el contenido de dist** en un alojamiento estático; no publicar archivos de entorno, dependencias instaladas ni fuentes.

Las reglas de cabeceras, caché y fallback SPA de Vercel están en [vercel.json](vercel.json); aplicar equivalentes en otros alojamientos. `npm run preview` permite comprobar el build con cabeceras, no sustituye al alojamiento de producción. Para publicar la SPA no se arranca ninguna API ni migración. La raíz Vercel debe ser la del repositorio, con salida dist; las exclusiones de despliegue separan los proyectos heredados y los entornos.

## Scripts

| Script npm | Propósito |
|---|---|
| dev | Desarrollo local |
| lint | ESLint y reglas de hooks |
| test | Vitest: pruebas unitarias de catálogo, filtros, formularios, navegación, loading y SEO |
| test:watch | Vitest en modo observación durante el desarrollo |
| test:navigation | Vitest + Chromium: navegación, favoritos entre pestañas/reinicio, almacenamiento y axe |
| build | Bundle productivo y generación de robots/sitemap |
| test:e2e | Build fresco, Chromium y axe; preview propio en 4175 con cabeceras reales |
| preview | Servir el build con cabeceras equivalentes al despliegue |
| audit:lighthouse | Medición móvil/escritorio; necesita preview, acepta AUDIT_URL |
| audit:screenshots | Capturas de rutas y secciones a 375 y 1440; acepta AUDIT_BASE_URL |
| images:optimize | Regenera variantes WebP locales con Sharp (solo desarrollo) |

Pruebas de navegador: instalar Chrome o configurar `CHROME_PATH` con el ejecutable de Chromium. Los reportes de prueba, Lighthouse y capturas se regeneran localmente; no se versionan.

Los scripts audit:* requieren un preview activo. Por defecto usan http://127.0.0.1:4175. Si el entorno de QA aislado no admite sandbox, se puede configurar CHROME_NO_SANDBOX=1; no se recomienda desactivar el sandbox en equipos o CI que manejen credenciales.

Las pruebas unitarias utilizan Vitest con una configuración independiente de los plugins de despliegue. La suite `test:navigation` también usa Vitest y controla Chromium con Playwright; arranca un servidor efímero con la configuración real de Vite, incluidos SEO y cabeceras. Playwright Test descubre exclusivamente archivos `.spec.js`, evitando mezclar ambas suites. Ejecutar `npm audit` para revisar los avisos actuales de dependencias antes de publicar.

El servidor de desarrollo, Vitest y la suite de navegación tienen cachés separadas en `node_modules`. Las dependencias diferidas de detalle y galería se preoptimizan para evitar que abrir una propiedad termine en `504 Outdated Optimize Dep`. La verificación del detalle comprueba contenido renderizado, acceso directo, recarga y galería; no solo el cambio de URL.

Las utilidades [build/seo.js](build/seo.js) y [build/securityHeaders.js](build/securityHeaders.js) son necesarias para arrancar y construir el sitio. Las cabeceras reutilizan [vercel.json](vercel.json) sin relajar la CSP de producción. En desarrollo, Vite recibe un nonce aleatorio para autorizar exclusivamente sus scripts inline, sin habilitar `unsafe-inline` ni `unsafe-eval` para scripts.

## Catálogo e imágenes

La fuente canónica es [src/data/demoCatalog.js](src/data/demoCatalog.js), un módulo JavaScript puro trasladado con la implementación exacta del catálogo compartido anterior: conserva semilla, IDs, datos y resultados deterministas, sin variables de entorno ni servicios. [src/utils/generateProperties.js](src/utils/generateProperties.js) reexporta ese módulo como wrapper de compatibilidad.

[src/data/properties.js](src/data/properties.js) incorpora las imágenes editoriales de [src/data/siteImages.js](src/data/siteImages.js). Esa configuración sigue siendo local y separada del generador: cambiar fotografías no altera los datos demo ni sus IDs. Los anuncios, precios, ubicaciones e imágenes son ilustrativos, no inventario comercial.

## Entorno público

Plantilla en [.env.example](.env.example). `VITE_SITE_URL` debe ser exclusivamente el origen HTTPS definitivo, sin path/query. El catálogo demo siempre permanece noindex, incluso con dominio. Los canales `VITE_CONTACT_EMAIL` y `VITE_CONTACT_PHONE` son opcionales y públicos. Ningún secreto debe usar el prefijo VITE_. Un `mailto:` abre el cliente local: no hay formulario ni promesa de envío desde el sitio.

**Acción de seguridad pendiente:** hay entornos previamente versionados en Git, incluido un nombre de variable de secreto de Cloudinary en el entorno del backend. Las reglas de exclusión nuevas no eliminan archivos del índice ni del historial. Revisar y rotar credenciales potencialmente expuestas, retirar los entornos reales del seguimiento y coordinar cualquier limpieza del historial con los colaboradores. La auditoría no ha impreso valores ni rotado claves.

Las fotografías se configuran en [src/data/siteImages.js](src/data/siteImages.js). La SPA no necesita SDK ni configuración Cloudinary. Si falla una imagen se muestra un placeholder local sin bucles. No se precarga el hero desde el HTML compartido por todas las rutas: tiene prioridad al renderizarse en la portada y no descarga la foto oculta en móvil. Las ciudades usan variantes WebP locales y conservan originales, atribuciones y licencias. Al incorporar otro proveedor HTTPS hay que autorizar su origen concreto en CSP; no ampliar la política a cualquier host.

## Decisiones de rendimiento y accesibilidad

- La portada se importa directamente y las páginas secundarias utilizan `lazy` de React Router. [src/components/NavigationLoader.jsx](src/components/NavigationLoader.jsx) observa `useNavigation` y pasa el pathname de destino a [src/loading.jsx](src/loading.jsx). Muestra un único skeleton contextual, bajo la cabecera y sobre el contenido, tras 120 ms de navegación pendiente. El outlet se conserva montado y solo se oculta al aparecer el skeleton; las navegaciones rápidas no tienen destellos ni pierden estado. No hay Context ni temporizadores que determinen el final. El fallback inicial del router sigue siendo necesario para acceder directamente a rutas lazy y no se duplica con el loading de transición. Las animaciones respetan `prefers-reduced-motion`.
- `ScrollRestoration` es el único mecanismo de restauración del documento. `Loading` no cambia el scroll. El panel de skeletons tiene scroll propio y deja disponibles header y dock; `ScrollToTop` únicamente administra el foco después de cambiar de página.
- La SPA raíz no usa React Select, Axios ni React Query; el proyecto alternativo aún conserva otras dependencias. Los formularios activos usan controles nativos etiquetados. Framer Motion proporciona entradas breves del hero y secciones de portada, una vez al entrar en pantalla y respetando movimiento reducido; las fichas conservan enlaces y posiciones de foco estables.
- El catálogo determinista vive íntegramente en el frontend. Los filtros y la ordenación usan una sola implementación para mapa/lista; páginas de 12 resultados.
- Drawer nativo `dialog` con Escape, foco contenido/restaurado y fondo inerte. Navegación por teclado, enlace de salto, estados visibles y `prefers-reduced-motion`.
- Favoritos centralizados en [src/stores/favoritesStore.js](src/stores/favoritesStore.js), conectados mediante `useSyncExternalStore`: cards, página de guardados y contadores comparten el mismo snapshot inmutable. Se conserva la clave `homeestate:favorites:v1`, sin duplicados ni IDs ajenos al catálogo. Los eventos `storage` sincronizan otras pestañas; las acciones notifican directamente a los consumidores de la pestaña actual. Como `localStorage` no es transaccional, ante escrituras simultáneas prevalece la última.
- Un JSON corrupto no desactiva la persistencia: la siguiente selección repara el valor. Si el acceso o la escritura realmente fallan, los favoritos continúan funcionando en memoria durante la sesión y la vista de guardados lo indica. Las pruebas verifican también persistencia al cerrar y reabrir Chromium con un perfil temporal.
- El E2E de producción simula el estilo del mapa para comprobar motor, worker local, CSP y fichas sin depender de terceros. No certifica disponibilidad ni calidad de la cartografía real: requiere comprobación interactiva antes de publicar.
- Mapa nuevo: react-map-gl/MapLibre y OpenFreeMap, con worker local, agrupación Supercluster y sin claves. Se carga solo al solicitarlo; su chunk GL es más pesado y mantiene visible la advertencia de tamaño de Vite.
- Galería: yet-another-react-lightbox con zoom, contador y controles accesibles. Librería/CSS diferidos hasta el clic. La portada muestra tres fichas y conserva las 600 propiedades en su ruta.

## Backend opcional

No forma parte del alojamiento estático. Sus pruebas se ejecutan con el script test de su propio manifiesto y no contactan Cloudinary. El desarrollo usa --watch nativo de Node y escucha en 127.0.0.1 salvo configuración explícita.

Las subidas quedan deshabilitadas sin UPLOAD_API_TOKEN de al menos 32 caracteres. Es un canal administrativo servidor-a-servidor, no un mecanismo de autenticación para usuarios del navegador. Tiene límites de frecuencia, 5 MiB por archivo, MIME y firmas JPEG/PNG/WebP; la decodificación final corresponde a Cloudinary. No admite SVG. La API de propiedades es de demostración y solo lectura: las creaciones responden 501 porque no hay persistencia.

Los scripts Cloudinary no ejecutan migraciones al importarse y exigen --execute para autorizar efectos remotos; no sobrescriben recursos por defecto. Los antiguos catálogos de propiedades del backend no están habilitados: se debe revisar fuente, destino y recuperación antes de intentar una migración real. No ejecutar esos scripts como parte del build.
