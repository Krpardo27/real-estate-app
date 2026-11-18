import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { chileRegions } from "../../../data/regions.js";

const RegionSelect = () => {
  const id = useId();
  /** @type {import("react-hook-form").UseFormReturn<import("../schemas/propertySearch.schema.js").PropertySearchValues>} */
  const { register, setValue, clearErrors, formState: { errors } } = useFormContext();
  const error = errors.region;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="property-search-label">Región</label>
      <select
        id={id}
        {...register("region", {
          onChange: () => {
            setValue("district", "", { shouldDirty: true });
            clearErrors("district");
          },
        })}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="property-search-select"
      >
        <option value="">Todas las regiones</option>
        {chileRegions.map((region) => <option key={region.id} value={region.id}>{region.name.replace(/^Región\s+/i, "")}</option>)}
      </select>
      {error && <p id={`${id}-error`} role="alert" className="property-search-error">Error: {error.message}</p>}
    </div>
  );
};

export default RegionSelect;