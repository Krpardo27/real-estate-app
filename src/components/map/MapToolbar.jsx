import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCrosshair, FiList, FiMaximize, FiMinimize, FiMinus, FiNavigation, FiPlus, FiSearch } from "react-icons/fi";
import { MAP_STYLES } from "./mapConfig.js";
import { findMapLocation } from "./mapLocations.js";

export default function MapToolbar({ locations, signature, disabled, listTarget, styleId, onStyleChange, onGoToZone }) {
  const inputId = useId();
  const suggestionsId = useId();
  const helpId = useId();
  const feedbackId = useId();
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const currentFeedback = feedback?.signature === signature && feedback.query === query ? feedback : null;

  return (
    <header className="property-map__toolbar">
      <div className="property-map__toolbar-row">
        <form className="property-map__search" onSubmit={(event) => {
          event.preventDefault();
          if (disabled) return;
          const zone = findMapLocation(locations, query);
          if (!zone) {
            setFeedback({ signature, query, error: true, message: "No hay resultados cartografiables para esa zona en la selección actual. Elige una sugerencia de comuna o ciudad." });
            return;
          }
          onGoToZone(zone);
          setFeedback({ signature, query, error: false, message: `Mapa centrado en ${zone.label}. Se mantienen todas las propiedades de los resultados.` });
        }}>
          <label htmlFor={inputId}>Ir a comuna o ciudad</label>
          <div className="property-map__search-field">
            <FiSearch aria-hidden="true" />
            <input
              id={inputId}
              type="text"
              list={suggestionsId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. Providencia, Santiago"
              autoComplete="off"
              disabled={disabled}
              aria-describedby={`${helpId} ${feedbackId}`}
              aria-invalid={currentFeedback?.error || undefined}
            />
            <button type="submit" aria-label="Ir a zona" disabled={disabled} title="Centrar el mapa en esta zona">
              <FiArrowRight aria-hidden="true" />
            </button>
          </div>
          <datalist id={suggestionsId}>
            {locations.map((zone) => <option key={zone.key} value={zone.label} />)}
          </datalist>
        </form>
        <div className="property-map__toolbar-actions">
          <div className="property-map__styles" role="group" aria-label="Estilo del mapa">
            {MAP_STYLES.map((style) => (
              <button key={style.id} type="button" aria-label={style.label} aria-pressed={styleId === style.id} disabled={disabled} onClick={() => onStyleChange(style.id)}>
                {style.name}
              </button>
            ))}
          </div>
          <Link to={listTarget} className="property-map__list-link"><FiList aria-hidden="true" />Ver lista</Link>
        </div>
      </div>
      <p id={helpId} className="property-map__help">Solo centra el mapa; no cambia los filtros ni busca direcciones externas.</p>
      <p id={feedbackId} role="status" aria-atomic="true" className={`property-map__feedback${currentFeedback?.error ? " property-map__feedback--error" : ""}`}>
        {currentFeedback?.message}
      </p>
    </header>
  );
}

export function MapControls({ disabled, zoom, onZoom, onFit, onLocate, locating, locationHelpId, geolocationSupported, fullscreenSupported, fullscreen, onFullscreen }) {
  return (
    <div className="property-map__controls" role="group" aria-label="Controles del mapa">
      <button type="button" aria-label="Acercar mapa" title="Acercar mapa" disabled={disabled || zoom >= 19} onClick={() => onZoom(1)}><FiPlus aria-hidden="true" /></button>
      <button type="button" aria-label="Alejar mapa" title="Alejar mapa" disabled={disabled || zoom <= 0} onClick={() => onZoom(-1)}><FiMinus aria-hidden="true" /></button>
      <button type="button" aria-label="Centrar resultados" title="Centrar resultados" disabled={disabled} onClick={onFit}><FiCrosshair aria-hidden="true" /></button>
      <button type="button" aria-label="Usar mi ubicación" aria-describedby={locationHelpId} aria-busy={locating} title={geolocationSupported ? "Usar mi ubicación (requiere tu permiso)" : "Ubicación no disponible en este navegador"} disabled={disabled || locating || !geolocationSupported} onClick={onLocate}><FiNavigation aria-hidden="true" /></button>
      <button type="button" aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"} title={fullscreenSupported ? (fullscreen ? "Salir de pantalla completa" : "Pantalla completa") : "Pantalla completa no disponible en este navegador"} disabled={disabled || !fullscreenSupported} onClick={onFullscreen}>
        {fullscreen ? <FiMinimize aria-hidden="true" /> : <FiMaximize aria-hidden="true" />}
      </button>
    </div>
  );
}