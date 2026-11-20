# Auditoría técnica de HomeEstate

Fecha: 2026-11-20. Alcance: SPA raíz, utilidades de build, configuración de despliegue, backend opcional, scripts heredados y dependencias de los tres proyectos.

## Resultado y límites

Se corrigieron defectos verificables sin sustituir React, Vite, Tailwind, React Router ni el catálogo determinista. La SPA raíz sigue siendo estática y no depende de la API opcional.

**No declarar el repositorio listo para publicación sin resolver primero los entornos versionados.** Las verificaciones automatizadas no equivalen a un pentest ni garantizan ausencia de vulnerabilidades o errores. No se accedió al panel de despliegue ni se realizaron subidas, migraciones o transacciones remotas.

## Correcciones

| Área | Problema confirmado | Corrección aplicada |
| --- | --- | --- |
| Filtros | Terrenos/oficinas heredaban dormitorios incompatibles; terrenos heredaban baños | Retirar dependencias al cambiar tipo desde UI, deshabilitar campos no aplicables y conservar parseo estricto de URLs explícitas |
| Navegación | Variantes con barra final o mayúsculas perdían criterios y estado activo | Normalización de pathname en destinos compartidos |
| Catálogo | Enlaces del pie «Todas las propiedades» abrían el preset | Destinos explícitos con filters=all para lista y mapa |
| Accesibilidad | Pérdida de foco al eliminar favoritos/chips y al paginar | Destino de foco estable, sin moverlo por cambios remotos de almacenamiento |
| Scroll | Ajustar filtros/orden podía reiniciar el documento | preventScrollReset en ajustes; paginación conserva su comportamiento específico |
| Nombres accesibles | Estadísticas genéricas y discrepancias entre texto visible, logo, contadores y galería | Texto de apoyo real, separación y orden DOM coherentes; pruebas incluyen WCAG 2.1 A y AA |
| Mapa | Zoom truncado afectaba límites; cierre automático podía perder foco; popup montaba todos los registros | Zoom real para controles, cierre con destino estable, paginación de seis fichas y foco en la lista |
| SEO | Cliente podía volver indexable la demo y el HTML precargaba una imagen ajena a otras rutas | noindex predeterminado y cabecera global; retirada de preload compartido; prioridad del hero solo cuando se renderiza |
| Imágenes | Hero sobredimensionado y descargado aunque estuviera oculto; miniaturas sin candidatos pequeños | sizes ajustado, source móvil local y candidatos pequeños para miniaturas |
| Recursos locales | Originales JPEG sin variantes | WebP responsive de 400/800 px, sin ampliación de originales pequeños; autores y licencias conservados |
| Estilos | Tailwind podía escanear el proyecto alternativo | Exclusión explícita de frontend/backend del escaneo activo |
| Lint | Globals de Node incorrectos y bundles anidados incluidos | Configuración Node para backend y exclusiones de artefactos generados a cualquier profundidad |
| Pruebas | E2E no descubría ninguna suite; scripts audit:* inexistentes | Suite Playwright del bundle productivo y scripts funcionales de Lighthouse/capturas |
| Dependencias | Backend: 14 avisos, incluidos dos críticos; frontend alternativo: 20 | Parches compatibles, SDK Cloudinary actualizado, retirada del adaptador obsoleto y sustitución de nodemon por --watch nativo |
| API opcional | Upload sin autorización ni límites; CORS abierto; errores internos y creaciones ficticias | Autorización antes de Multer, límites multipart/JSON/frecuencia, CORS exacto, firmas MIME, errores controlados y creación 501 sin persistencia |
| Migraciones | Efectos remotos al importar y sobrescritura por defecto | Guardia de entrada explícita, --execute, overwrite=false, aborto ante errores y salida sin sobrescritura local |
| Despliegue | Entornos y proyectos alternativos sin exclusiones suficientes | Reglas .gitignore/.vercelignore y fallback SPA que respeta recursos reservados |

## Entradas de portada solicitadas posteriormente

Framer Motion anima títulos, textos e imagen del hero y las secciones de categorías, propiedades y ciudades. Las entradas por scroll son únicas y escalonadas; se desactivan con prefers-reduced-motion. Los textos mantienen contraste completo en las entradas de sección. En las propiedades se anima la fotografía sin transformar el enlace de título, evitando cambios de scroll al abrir fichas.

## Comprobaciones finales

- ESLint global: correcto, incluido el código fuente del backend.
- Vitest: **189 pruebas** correctas.
- Navegador en desarrollo: **41 pruebas** correctas, incluyendo errores, navegación, favoritos, scroll, responsive, WCAG 2.1 A/AA, entradas únicas y movimiento reducido.
- API opcional: **5 pruebas HTTP** correctas, sin contactar Cloudinary.
- Bundle productivo: **3 pruebas E2E** correctas, con cabeceras/CSP reales del preview, filtros móviles, galería, guardados y worker del mapa.
- Compilación raíz y del frontend alternativo: correctas.
- npm audit: **0 avisos reportados** en raíz, backend y frontend alternativo al finalizar. No se utilizó audit fix --force.
- Capturas de cuatro rutas en 375 y 1440 px: generadas mediante el script restaurado.
- Fotografías: suma de cinco variantes de 800 px **266.902 bytes**, frente a **1.606.020 bytes** de originales; reducción aproximada **83 %**. Los originales siguen conservados por trazabilidad/licencias.

Se ejecutó Lighthouse local antes de incorporar Framer Motion: rendimiento móvil 100/escritorio 97, accesibilidad 100 y best practices 96. **Esas puntuaciones no representan una medición del build final con animaciones ni una garantía de producción.** SEO queda limitado deliberadamente por noindex. Los informes quedan en reports/lighthouse y se pueden regenerar con audit:lighthouse sobre un preview activo.

## Atención antes de publicar

### Crítica: archivos de entorno rastreados

Git rastrea tres archivos de entorno reales, incluido el del backend con la variable CLOUDINARY_API_SECRET. Solo se inspeccionaron nombres de variables, nunca se imprimieron valores ni se verificó su validez.

1. Revisar y **rotar/revocar cualquier credencial potencialmente expuesta** en el proveedor correspondiente.
2. Retirar los entornos reales del seguimiento de Git conservando copias locales seguras; mantener solo plantillas sin secretos.
3. Revisar accesos, clones y posible historial publicado. Coordinar cualquier reescritura con colaboradores y respaldos.

Las exclusiones añadidas no eliminan secretos del índice ni del historial. No se alteró automáticamente el índice del usuario ni se reescribió la historia del repositorio.

### Despliegue y servicios externos

- Confirmar raíz del repositorio, salida dist y equivalencia de cabeceras en el alojamiento real. Las reglas Vercel se revisaron estáticamente; las respuestas se probaron en preview, no en un despliegue remoto.
- frontend sigue siendo una implementación anterior independiente: sus dependencias están parchadas, pero no se homogeneizaron todos sus flujos, SEO y políticas con la SPA raíz. No desplegarla accidentalmente.
- La API es una demo de solo lectura, no un sistema inmobiliario comercial. El token de upload es exclusivamente administrativo, nunca una credencial a incluir en VITE_* o en el navegador. Una API comercial necesitaría identidad/roles, persistencia, observabilidad, política distribuida de límites y revisión de infraestructura.
- Las migraciones de propiedades heredadas no tienen una fuente habilitada. Las guardias impiden ejecución accidental, pero una migración real exige revisar datos, cuenta destino, recuperación y objetos parciales remotos.
- La prueba del mapa usa un estilo simulado: verifica motor, worker, CSP y popups, no la cartografía de OpenFreeMap ni su disponibilidad. Revisar visualmente la cartografía real, marcadores periféricos y el mapa móvil antes de publicar.
- Cloudinary no recibió peticiones reales durante las pruebas; deben verificarse su configuración y credenciales nuevas por un canal administrativo seguro.

### Rendimiento y compatibilidad

- Optimización posterior de bundles: MapLibre y su worker se compilan por módulos desde la versión fijada 6.18.0; Motion usa m/LazyMotion y funciones cargadas dinámicamente. Ningún JavaScript emitido supera 500.000 bytes. No se elevó el umbral ni se suprimieron avisos. Medidas y límites de mantenimiento en [PRODUCTION_BUNDLES.md](PRODUCTION_BUNDLES.md).
- Se corrigieron los comentarios documentales de Zod que Rollup interpretaba como anotaciones mal colocadas, sin eliminar anotaciones PURE reales ni cambiar la validación. El build final ya no emite esos avisos.
- Lighthouse registró un aviso CSP en la inspección local HTTP. No se relajaron script-src ni worker-src para mejorar una puntuación; volver a comprobar cabeceras y consola bajo HTTPS real.
- La auditoría automática no sustituye comprobaciones con lector de pantalla, teclado virtual, safe areas, zoom alto, dispositivos reales o redes lentas.