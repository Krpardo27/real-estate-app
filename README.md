# HomeEstate · Frontend

React 19, React Router 7, Vite 7 y Tailwind 4. Aplicación JavaScript, sin Next.js ni SSR. En el repositorio completo hay documentación general y una auditoría histórica en la carpeta de documentación; no se necesitan para construir, probar ni publicar esta carpeta por separado.

**Frontend autocontenido, sin backend.** Se puede copiar únicamente esta carpeta: no hay imports, paquetes locales ni datos necesarios fuera de ella. El backend y el paquete compartido anteriores se retiraron definitivamente, junto con API, scripts Cloudinary, manifests, pruebas, dependencias y archivos de entorno propios. Existe un respaldo privado externo verificado de HomeEstate; no se distribuye con el frontend.

## Desarrollo y despliegue

Requiere Node 22.12 o superior compatible con Vite 7. Desde esta carpeta, ejecutar `npm ci` y después `npm run dev`. Para producción ejecutar `npm run build` y publicar **solo el contenido de dist** en un alojamiento estático; no publicar archivos de entorno, dependencias instaladas ni fuentes.

Las reglas de cabeceras, caché y fallback SPA de Vercel están en [vercel.json](vercel.json); aplicar equivalentes en otros alojamientos. `npm run preview` permite comprobar el build con cabeceras, no sustituye al alojamiento de producción. No hay API, proceso de servidor ni migración que arrancar o desplegar.

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

Pruebas de navegador: instalar Chrome o configurar `CHROME_PATH` con el ejecutable de Chromium. Los reportes de prueba, Lighthouse y capturas se regeneran localmente; no se versionan.

Las pruebas unitarias utilizan Vitest con una configuración independiente de los plugins de despliegue. La suite `test:navigation` también usa Vitest y controla Chromium con Playwright; arranca un servidor efímero con la configuración real de Vite, incluidos SEO y cabeceras. Playwright Test descubre exclusivamente archivos `.spec.js`, evitando mezclar ambas suites. Ejecutar `npm audit` para revisar los avisos actuales de dependencias antes de publicar.

El servidor de desarrollo, Vitest y la suite de navegación tienen cachés separadas en `node_modules`. Las dependencias diferidas de detalle y galería se preoptimizan para evitar que abrir una propiedad termine en `504 Outdated Optimize Dep`. La verificación del detalle comprueba contenido renderizado, acceso directo, recarga y galería; no solo el cambio de URL.

Las utilidades [build/seo.js](build/seo.js) y [build/securityHeaders.js](build/securityHeaders.js) son necesarias para arrancar y construir el sitio. Las cabeceras reutilizan [vercel.json](vercel.json) sin relajar la CSP de producción. En desarrollo, Vite recibe un nonce aleatorio para autorizar exclusivamente sus scripts inline, sin habilitar `unsafe-inline` ni `unsafe-eval` para scripts.

## Catálogo e imágenes

La fuente canónica es [src/data/demoCatalog.js](src/data/demoCatalog.js), un módulo JavaScript puro trasladado con la implementación exacta del catálogo compartido anterior: conserva semilla, IDs, datos y resultados deterministas, sin variables de entorno ni servicios. [src/utils/generateProperties.js](src/utils/generateProperties.js) reexporta ese módulo como wrapper de compatibilidad.

[src/data/properties.js](src/data/properties.js) incorpora las imágenes editoriales de [src/data/siteImages.js](src/data/siteImages.js). Esa configuración sigue siendo local y separada del generador: cambiar fotografías no altera los datos demo ni sus IDs. Los anuncios, precios, ubicaciones e imágenes son ilustrativos, no inventario comercial.

## Entorno público

Plantilla en [.env.example](.env.example). `VITE_SITE_URL` debe ser exclusivamente el origen HTTPS definitivo, sin path/query. Vacío conserva `noindex`. Los canales `VITE_CONTACT_EMAIL` y `VITE_CONTACT_PHONE` son opcionales y deben ser reales. Un `mailto:` abre el cliente local: no hay formulario ni promesa de envío desde el sitio.

Las fotografías se configuran en [src/data/siteImages.js](src/data/siteImages.js). Admite rutas públicas locales y URLs HTTPS temporales; no necesita SDK ni configuración Cloudinary. Si falla una imagen se muestra un placeholder local sin bucles. La precarga del hero y las imágenes sociales se generan desde la misma configuración. Las fotografías definitivas todavía no se han recibido.

## Decisiones de rendimiento y accesibilidad

- La portada se importa directamente y las páginas secundarias utilizan `lazy` de React Router. [src/components/NavigationLoader.jsx](src/components/NavigationLoader.jsx) observa `useNavigation` y pasa el pathname de destino a [src/loading.jsx](src/loading.jsx). Muestra un único skeleton contextual, bajo la cabecera y sobre el contenido, tras 120 ms de navegación pendiente. El outlet se conserva montado y solo se oculta al aparecer el skeleton; las navegaciones rápidas no tienen destellos ni pierden estado. No hay Context ni temporizadores que determinen el final. El fallback inicial del router sigue siendo necesario para acceder directamente a rutas lazy y no se duplica con el loading de transición. Las animaciones respetan `prefers-reduced-motion`.
- `ScrollRestoration` es el único mecanismo de restauración del documento. `Loading` no cambia el scroll. El panel de skeletons tiene scroll propio y deja disponibles header y dock; `ScrollToTop` únicamente administra el foco después de cambiar de página.
- Se eliminaron React Select, Axios, Framer Motion y React Query: no hay consultas remotas, animaciones dependientes ni consumidores que justifiquen esas capas. Los formularios usan controles nativos etiquetados.
- El catálogo determinista vive íntegramente en el frontend. Los filtros y la ordenación usan una sola implementación para mapa/lista; páginas de 12 resultados.
- Drawer nativo `dialog` con Escape, foco contenido/restaurado y fondo inerte. Navegación por teclado, enlace de salto, estados visibles y `prefers-reduced-motion`.
- Favoritos centralizados en [src/stores/favoritesStore.js](src/stores/favoritesStore.js), conectados mediante `useSyncExternalStore`: cards, página de guardados y contadores comparten el mismo snapshot inmutable. Se conserva la clave `homeestate:favorites:v1`, sin duplicados ni IDs ajenos al catálogo. Los eventos `storage` sincronizan otras pestañas; las acciones notifican directamente a los consumidores de la pestaña actual. Como `localStorage` no es transaccional, ante escrituras simultáneas prevalece la última.
- Un JSON corrupto no desactiva la persistencia: la siguiente selección repara el valor. Si el acceso o la escritura realmente fallan, los favoritos continúan funcionando en memoria durante la sesión y la vista de guardados lo indica. Las pruebas verifican también persistencia al cerrar y reabrir Chromium con un perfil temporal.
- Las teselas están simuladas en QA automático por la política del proveedor; la comprobación del mapa real se realiza en navegación interactiva.
- Mapa nuevo: react-map-gl/MapLibre y OpenFreeMap, con worker local, agrupación Supercluster y sin claves. Se carga solo al solicitarlo; su chunk GL es más pesado y mantiene visible la advertencia de tamaño de Vite.
- Galería: yet-another-react-lightbox con zoom, contador y controles accesibles. Librería/CSS diferidos hasta el clic. La portada muestra cuatro fichas y conserva el catálogo completo en su ruta.
