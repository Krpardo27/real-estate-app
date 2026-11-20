# Optimización de bundles de producción

Fecha: 2026-11-20. Objetivo: eliminar módulos JavaScript mayores de 500 KB sin aumentar el umbral de Vite, desactivar avisos, cambiar rutas/diseño o retirar funciones.

## Medición sin gzip

| Elemento | Antes | Después |
| --- | ---: | ---: |
| Entrada index | 624,09 KB | 109,59 KB |
| Interfaz PropertiesMap | 1.147,36 KB con motor incluido | 38,72 KB |
| Mayor módulo cartográfico | Incluido en el bloque anterior | 287,10 KB |
| Worker | 517,42 KB monolíticos | Entrada de 0,32 KB más dependencias ESM; ninguna mayor de 172,61 KB |
| Total de imports estáticos necesarios para arrancar la página | 624,09 KB | 518,81 KB |

**El tamaño de index no equivale al total de JavaScript inicial.** Ahora React (192,85 KB), router (94,70 KB), formularios (41,07 KB), validación (80,48 KB) y helpers (0,12 KB) son recursos independientes. El conjunto estático inicial baja aproximadamente un 17 %. Las funciones de Motion añaden otro recurso asíncrono de 50,75 KB cuando se monta su proveedor; no están incluidas en esa suma estática.

Separar el mapa no elimina el coste total de su motor: los módulos necesarios se solicitan al abrirlo y se cachean individualmente. El ahorro principal fuera del mapa es no cargar sus recursos y retirar de la carga inicial las funciones completas de Motion que no utiliza la aplicación. No se promete que todas las funciones internas de MapLibre puedan descargarse por separado bajo demanda.

## Implementación

### MapLibre

La distribución publicada de MapLibre era un único módulo ESM preempaquetado. Cambiar únicamente su nombre a vendor no lo habría dividido.

- Alias exacto de la raíz MapLibre hacia la entrada TypeScript incluida en su paquete instalado. Vite transpila esas dependencias; la aplicación sigue siendo JavaScript/JSX.
- Motor importado dinámicamente desde mapLibrary; react-map-gl recibe la promesa mediante su API pública mapLib y conserva su manejador de errores.
- Worker local compilado desde su entrada de fuentes, en formato ESM. No se utiliza CDN, script inline, blob de JavaScript ni se relaja la CSP.
- Particiones por responsabilidad: shaders, fundamentos, datos/símbolos, renderizador e interfaz. Cada capa incorpora su clausura de dependencias no asignadas para no romper registros y orden de inicialización. Los ciclos reales de módulos se mantienen dentro de la misma capa, sin ciclos entre chunks.
- Style-spec, geometría, texto y códecs conservan módulos propios. No se omiten validaciones, estilos ni implementaciones de fuentes.
- El paquete y su entrada de worker quedan excluidos de la preoptimización de desarrollo; se comprobó también el dibujo GeoJSON en desarrollo para evitar un worker mal preempaquetado.
- La licencia original se copia al artefacto en assets/maplibre-gl-6.18.0-LICENSE.txt.

**Mantenimiento:** la compilación usa fuentes internas incluidas en MapLibre 6.18.0, no un subpath público estable. Esa versión está fijada y el build rechaza otra hasta revisar entradas, registros, shaders, CSP, worker, presupuesto y pruebas. No actualizarla a ciegas ni editar node_modules. Publicar dist de forma atómica y conservar temporalmente assets antiguos para clientes abiertos durante despliegues.

### Framer Motion

Se sustituyeron los componentes motion por m y se añadió LazyMotion sin introducir elementos DOM. domAnimation se importa dinámicamente; no se incorporan las funciones de proyección/layout/drag de domMax, que no se utilizaban. Se conservan tiempos, entradas por viewport, ejecución única y movimiento reducido.

### Zod / Rollup

Zod 4.6.7 incluye dos comentarios de documentación que mencionan literalmente el marcador PURE en posiciones que Rollup interpreta como anotaciones defectuosas. El adaptador de build corrige ese texto documental solo en los dos archivos afectados.

No se filtra onwarn, no se retiran las anotaciones PURE reales y no se modifica el esquema ni la lógica de validación. Una prueba garantiza que una anotación real anterior a una llamada permanece intacta. El adaptador puede retirarse cuando una versión upstream deje de incluir el problema.

## Controles de regresión

- Presupuesto de **500.000 bytes por JavaScript minificado**. Se aplica al build principal, assets JS emitidos y compilación del worker; falla el build si se supera.
- Rechazo de ciclos estáticos entre chunks, en lugar de intercambiar un aviso de tamaño por fallos de inicialización.
- Manifest de Vite para inspeccionar imports estáticos y dinámicos.
- Prueba E2E de red: portada sin descargar mapa, motor, worker ni lightbox; funciones de Motion en un recurso separado.
- Prueba E2E de render: GeoJSON procesado por el worker y geometría realmente dibujada, comprobada en píxeles del canvas. No basta un canvas vacío ni que se dispare onLoad.
- Pruebas existentes de búsqueda, filtros, guardados, galería, errores, scroll, responsive y entradas/reduced-motion.

## Verificación

Build completado sin avisos de tamaño, anotaciones Zod ni ciclos de chunks. Todos los JavaScript emitidos están por debajo de 500.000 bytes. Lint, pruebas unitarias, suite de navegación y E2E de producción correctos. Las pruebas cartográficas usan un estilo controlado; no certifican disponibilidad del proveedor externo.