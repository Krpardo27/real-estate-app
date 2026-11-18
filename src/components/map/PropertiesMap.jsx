import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowUpRight, FiMaximize, FiX } from "react-icons/fi";

// MapLibre 6 expone ESM sin default; el worker se sirve localmente mediante Vite.
import "maplibre-gl/dist/maplibre-gl.css";
import FitBounds from "./FitBounds.jsx";
import { createPropertyClusterIndex, getPropertyClusters } from "./clusterProperties.js";
import { INITIAL_VIEW_STATE, MAP_LOCALE, MAP_STYLES, fitMapToCoordinates } from "./mapConfig.js";
import useReducedMotion from "./useReducedMotion.js";
import PropertyImage from "../PropertyImage.jsx";
import MapToolbar, { MapControls } from "./MapToolbar.jsx";
import { buildMapLocations, getLocationCoordinateKey, getMapSelectionSignature } from "./mapLocations.js";
import { hasValidCoordinates } from "./coordinates.js";
import "./map.css";

setWorkerUrl(workerUrl);

const formatPrice = (price) => Number.isFinite(price) && price >= 0
  ? `$${price.toLocaleString("es-CL")} CLP` : "Precio no disponible";

function PropertyMapPopup({ group, onClose, onFit }) {
  const headingId = useId();
  const closeRef = useRef(null);
  const coordinateKey = getLocationCoordinateKey(group.properties);
  const canFit = JSON.parse(coordinateKey).length > 1;
  const names = [...new Set(group.properties.map((property) =>
    property.location || [property.district, property.city].filter(Boolean).join(", ")).filter(Boolean))];
  const cities = [...new Set(group.properties.map(({ city }) => city).filter(Boolean))];
  const heading = names.length === 1 ? names[0] : cities.length === 1 ? cities[0] : "Propiedades en esta zona";
  const count = group.properties.length;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div role="dialog" aria-labelledby={headingId} className="property-map__popup">
      <div className="property-map__popup-heading">
        <div>
          <h3 id={headingId}>{heading}</h3>
          <p>{count} {count === 1 ? "propiedad" : "propiedades"} · Ubicación aproximada</p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar fichas del mapa" className="property-map__close"><FiX aria-hidden="true" /></button>
      </div>
      {canFit && (
        <button type="button" className="property-map__zone-fit" onClick={() => onFit(coordinateKey)}>
          <FiMaximize aria-hidden="true" />Acercar a esta zona
        </button>
      )}
      <ul tabIndex={0} aria-label="Fichas en esta ubicación aproximada" className="property-map__popup-list">
        {group.properties.map((property) => (
          <li key={property.id}>
            <Link to={`/property/${encodeURIComponent(property.id)}`} className="property-map__property">
              <PropertyImage
                src={property.images?.[0]}
                width={160}
                sizes="64px"
                alt=""
                loading="lazy"
                className="property-map__thumbnail"
              />
              <div className="property-map__property-copy">
                <p className="property-map__price">{formatPrice(property.price)}</p>
                <p className="property-map__property-title">{property.title || "Ver propiedad"}</p>
                <p className="property-map__location">{property.location || property.city || "Ubicación aproximada"}</p>
                {property.isDemo && <p className="property-map__demo">Demostración</p>}
                <span className="property-map__detail-link">Ver ficha<FiArrowUpRight aria-hidden="true" /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PropertiesMap({ properties }) {
  const rootRef = useRef(null);
  const mapRef = useRef(null);
  const markerButtonRef = useRef(null);
  const mountedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [resourceError, setResourceError] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [selection, setSelection] = useState(null);
  const [zoom, setZoom] = useState(Math.floor(INITIAL_VIEW_STATE.zoom));
  const [styleId, setStyleId] = useState(MAP_STYLES[0].id);
  const [locating, setLocating] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const reducedMotion = useReducedMotion();
  const instructionsId = useId();
  const locationHelpId = useId();
  const [searchParams] = useSearchParams();
  const listParams = new URLSearchParams(searchParams);
  listParams.delete("view");
  const listQuery = listParams.toString();
  const listTarget = { pathname: "/search", search: listQuery ? `?${listQuery}` : "" };

  // Construir el índice es costoso; consultar sus grupos no requiere otra caché.
  const clusterIndex = useMemo(() => createPropertyClusterIndex(properties), [properties]);
  const { coordinateKey } = clusterIndex;
  const locations = useMemo(() => buildMapLocations(properties), [properties]);
  const signature = getMapSelectionSignature(properties);
  const groups = getPropertyClusters(clusterIndex, zoom);
  // Cambiar los IDs invalida la selección durante el render, sin setState en un efecto.
  const selected = selection?.signature === signature
    ? groups.find((group) => group.key === selection.key) : null;
  const disabled = !loaded || unavailable;
  const fullscreenSupported = typeof document !== "undefined" && document.fullscreenEnabled === true &&
    typeof document.documentElement?.requestFullscreen === "function";
  const geolocationSupported = typeof navigator !== "undefined" && Boolean(navigator.geolocation?.getCurrentPosition);
  const zoneCount = JSON.parse(coordinateKey).length;
  const propertyCount = clusterIndex.properties.length;
  const mapStyle = MAP_STYLES.find((style) => style.id === styleId).url;

  const syncZoom = (event) => {
    // Leer la cámara final, también tras el fit animado de 450 ms y los resize.
    setZoom(Math.floor(event.target.getZoom()));
  };

  const closePopup = useCallback(() => {
    setSelection(null);
    if (markerButtonRef.current?.isConnected) {
      markerButtonRef.current.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === rootRef.current);
      // El evento llega después del cambio de tamaño; no dispara ningún fit.
      mapRef.current?.resize();
    };
    const handleFullscreenError = () => setNotice("No se pudo cambiar la pantalla completa. Puedes seguir usando el mapa o Ver lista.");
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("fullscreenerror", handleFullscreenError);
    return () => {
      mountedRef.current = false;
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("fullscreenerror", handleFullscreenError);
    };
  }, []);

  useEffect(() => {
    if (!loaded || unavailable) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const handleContextLost = () => setUnavailable(true);
    map.on("webglcontextlost", handleContextLost);
    return () => map.off("webglcontextlost", handleContextLost);
  }, [loaded, unavailable]);

  const fitCoordinates = (key) => {
    if (disabled || !mapRef.current) return;
    if (selected) closePopup();
    fitMapToCoordinates(mapRef.current, key, reducedMotion);
  };

  const locate = () => {
    if (disabled || locating) return;
    if (!geolocationSupported) {
      setNotice("La ubicación no está disponible en este navegador. Puedes explorar las zonas o usar Ver lista.");
      return;
    }
    if (selected) closePopup();
    setLocating(true);
    setNotice("Solicitando tu ubicación… Si aceptas, OpenFreeMap cargará la cartografía de esa zona. No guardamos tu ubicación en esta aplicación.");
    const fail = (error) => {
      if (!mountedRef.current) return;
      setLocating(false);
      setNotice(error?.code === 1
        ? "Permiso de ubicación denegado o bloqueado. Puedes explorar las zonas o usar Ver lista."
        : error?.code === 3
          ? "Se agotó el tiempo para obtener tu ubicación. Puedes intentarlo de nuevo o usar Ver lista."
          : "No pudimos obtener tu ubicación. Puedes intentarlo de nuevo o usar Ver lista.");
    };
    try {
      // Solicitud puntual y explícita: no watchPosition, persistencia ni geocodificación.
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        if (!mountedRef.current) return;
        if (!hasValidCoordinates({ lng: coords.longitude, lat: coords.latitude })) {
          fail();
          return;
        }
        setLocating(false);
        if (!mapRef.current) {
          setNotice("El mapa ya no está disponible. Consulta las propiedades con Ver lista.");
          return;
        }
        mapRef.current.stop();
        mapRef.current.easeTo({ center: [coords.longitude, coords.latitude], zoom: 13, duration: reducedMotion ? 0 : 450 });
        setNotice("Mapa centrado en tu ubicación. Los resultados no han cambiado. No guardamos tu ubicación en esta aplicación; OpenFreeMap recibe las solicitudes cartográficas de esa zona.");
      }, fail, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
    } catch {
      fail();
    }
  };

  const toggleFullscreen = async () => {
    if (disabled) return;
    if (!fullscreenSupported || !rootRef.current?.requestFullscreen) {
      setNotice("La pantalla completa no está disponible en este navegador. Puedes seguir usando el mapa o Ver lista.");
      return;
    }
    try {
      if (document.fullscreenElement === rootRef.current) await document.exitFullscreen();
      else await rootRef.current.requestFullscreen();
    } catch {
      if (mountedRef.current) setNotice("No se pudo cambiar la pantalla completa. Puedes seguir usando el mapa o Ver lista.");
    }
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label="Mapa de propiedades"
      aria-describedby={instructionsId}
      data-testid="properties-map"
      data-loaded={loaded && !unavailable ? "true" : "false"}
      data-zoom={zoom}
      className="property-map"
      onKeyDownCapture={(event) => {
        if (event.key === "Escape" && selected) {
          event.preventDefault();
          event.stopPropagation();
          closePopup();
        }
      }}
    >
      <MapToolbar
        locations={locations}
        signature={signature}
        disabled={disabled}
        listTarget={listTarget}
        styleId={styleId}
        onStyleChange={(id) => { setStyleId(id); setResourceError(false); }}
        onGoToZone={(zone) => fitCoordinates(zone.coordinateKey)}
      />
      <p id={instructionsId} className="sr-only">
        Usa Tab para recorrer los controles y marcadores; Enter abre las propiedades.
        Con el mapa enfocado, usa las flechas para desplazarte y + o − para cambiar el zoom.
        Escape cierra la ventana y devuelve el foco al marcador. Las ubicaciones son aproximadas.
      </p>
      <p id={locationHelpId} className="sr-only">La ubicación se solicita solo al pulsar y con tu permiso. No se guarda en esta aplicación. Al centrar la vista, el proveedor cartográfico recibe peticiones de esa zona.</p>
      {(resourceError || unavailable || !groups.length) && (
        <p role="status" className="property-map__status">
          {unavailable
            ? "El mapa no está disponible en este navegador o se ha perdido la conexión gráfica. Consulta las propiedades en la lista."
            : resourceError
              ? "No pudimos cargar parte del mapa base. Puedes consultar las fichas disponibles o usar Ver lista."
              : "No hay propiedades con coordenadas válidas para mostrar."}
        </p>
      )}
      <p role="status" aria-atomic="true" className="property-map__notice">{notice}</p>
      {(!fullscreenSupported || !geolocationSupported) && (
        <p className="property-map__capabilities">
          {!fullscreenSupported && "Pantalla completa no disponible en este navegador. "}
          {!geolocationSupported && "Ubicación no disponible en este navegador. "}
          Puedes usar Ver lista.
        </p>
      )}
      <div className="property-map__stage">
        <div className="property-map__canvas">
        {!unavailable && (
          <Map
            ref={mapRef}
            mapLib={maplibregl}
            initialViewState={INITIAL_VIEW_STATE}
            mapStyle={mapStyle}
            locale={MAP_LOCALE}
            style={{ width: "100%", height: "100%" }}
            keyboard
            scrollZoom={false}
            dragRotate={false}
            pitchWithRotate={false}
            renderWorldCopies={false}
            minZoom={0}
            maxZoom={19}
            attributionControl={false}
            onLoad={(event) => {
              syncZoom(event);
              setLoaded(true);
            }}
            onMoveEnd={syncZoom}
            onZoomStart={() => setSelection(null)}
            onZoomEnd={syncZoom}
            onResize={(event) => { syncZoom(event); setSelection(null); }}
            onError={(event) => {
              // Un único aviso persistente, sin mensajes internos ni spam por tesela.
              if (!event.target || /webgl|context lost|gpu/i.test(event.error?.message || "")) {
                setUnavailable(true);
              } else {
                setResourceError(true);
              }
            }}
          >
            <FitBounds coordinateKey={coordinateKey} loaded={loaded} reducedMotion={reducedMotion} />
            {groups.map((group) => {
              const first = group.properties[0];
              const count = group.properties.length;
              const location = first.location || "Ubicación aproximada";
              const label = count === 1
                ? `${first.title || "Propiedad"}, ${location}. ${formatPrice(first.price)}. Ver ficha${first.isDemo ? ". Demostración" : ""}`
                : `${count} propiedades en esta zona. Ver todas las fichas de ubicaciones aproximadas`;
              return (
                <Marker key={group.key} longitude={group.longitude} latitude={group.latitude} anchor="center">
                  <button
                    type="button"
                    aria-label={label}
                    aria-expanded={selected?.key === group.key}
                    aria-haspopup="dialog"
                    title={label}
                    onClick={(event) => {
                      event.stopPropagation();
                      markerButtonRef.current = event.currentTarget;
                      const map = mapRef.current;
                      if (map) {
                        // Reservar espacio sobre el marcador para toda la ficha.
                        // Solo se mueve la cámara: las coordenadas no se alteran.
                        const canvas = map.getCanvas();
                        map.stop();
                        map.easeTo({
                          center: [group.longitude, group.latitude],
                          offset: [0, Math.max(0, canvas.clientHeight / 2 - 28)],
                          duration: reducedMotion ? 0 : 250,
                        });
                      }
                      setSelection({ key: group.key, signature });
                    }}
                    className={`property-map__marker${count > 1 ? " property-map__marker--cluster" : ""}`}
                  >
                    {count > 1 ? count : Number.isFinite(first.price) && first.price >= 0
                      ? `${(first.price / 1000000).toLocaleString("es-CL", { maximumFractionDigits: 1 })}M` : "Ver"}
                  </button>
                </Marker>
              );
            })}
            {selected && (
              <Popup
                key={selected.key}
                longitude={selected.longitude}
                latitude={selected.latitude}
                offset={30}
                anchor="bottom"
                maxWidth="min(330px, calc(100vw - 108px))"
                className="property-map__maplibre-popup"
                closeButton={false}
                closeOnClick={false}
                closeOnMove={false}
                focusAfterOpen
                onClose={closePopup}
              >
                <PropertyMapPopup group={selected} onClose={closePopup} onFit={fitCoordinates} />
              </Popup>
            )}
          </Map>
        )}
        {!loaded && !resourceError && !unavailable && (
          <p role="status" className="property-map__loading">Cargando cartografía…</p>
        )}
        </div>
        <MapControls
          disabled={disabled}
          zoom={zoom}
          onZoom={(delta) => {
            if (disabled || !mapRef.current) return;
            if (selected) closePopup();
            mapRef.current.stop();
            mapRef.current.easeTo({ zoom: Math.max(0, Math.min(19, mapRef.current.getZoom() + delta)), duration: reducedMotion ? 0 : 250 });
          }}
          onFit={() => fitCoordinates(coordinateKey)}
          onLocate={locate}
          locationHelpId={locationHelpId}
          locating={locating}
          geolocationSupported={geolocationSupported}
          fullscreenSupported={fullscreenSupported}
          fullscreen={fullscreen}
          onFullscreen={toggleFullscreen}
        />
      </div>
      <footer className="property-map__footer">
        <p className="property-map__metadata">Ubicaciones aproximadas · {propertyCount} {propertyCount === 1 ? "propiedad" : "propiedades"} · {zoneCount} {zoneCount === 1 ? "zona" : "zonas"}</p>
        <div className="property-map__attribution">
        <span>Cartografía:</span>
        <a href="https://openfreemap.org/">OpenFreeMap</a><span>·</span>
        <a href="https://openmaptiles.org/">© OpenMapTiles</a><span>·</span>
        <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a><span>·</span>
        <a href="https://maplibre.org/">MapLibre</a>
        </div>
      </footer>
    </div>
  );
}
