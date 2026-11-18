import { useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { chileRegions } from "../../../data/regions.js";

const DistrictSelect = () => {
  const id = useId();
  /** @type {import("react-hook-form").UseFormReturn<import("../schemas/propertySearch.schema.js").PropertySearchValues>} */
  const { register, control, formState: { errors } } = useFormContext();
  const region = useWatch({ control, name: "region", exact: true });
  const selectedRegion = chileRegions.find((entry) => entry.id === region);
  const error = errors.district;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="property-search-label">Comuna</label>
      <select
        id={id}
        {...register("district")}
        disabled={!selectedRegion}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        className="property-search-select"
      >
        <option value="">{selectedRegion ? "Todas las comunas" : "Elige una región"}</option>
        {selectedRegion?.communes.map((commune) => <option key={commune} value={commune}>{commune}</option>)}
      </select>
      <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-slate-600">{selectedRegion ? "Puedes dejar toda la región." : "Selecciona una región para elegir comuna."}</p>
      {error && <p id={`${id}-error`} role="alert" className="property-search-error">Error: {error.message}</p>}
    </div>
  );
};

export default DistrictSelect;