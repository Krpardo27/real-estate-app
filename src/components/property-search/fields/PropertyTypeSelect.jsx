import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { propertyTypes } from "../../../data/propertyTypes.js";

const PropertyTypeSelect = () => {
  const id = useId();
  /** @type {import("react-hook-form").UseFormReturn<import("../schemas/propertySearch.schema.js").PropertySearchValues>} */
  const { register, formState: { errors } } = useFormContext();
  const error = errors.type;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="property-search-label">Tipo de propiedad</label>
      <select
        id={id}
        {...register("type")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="property-search-select"
      >
        <option value="">Todos los tipos</option>
        {propertyTypes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
      {error && <p id={`${id}-error`} role="alert" className="property-search-error">Error: {error.message}</p>}
    </div>
  );
};

export default PropertyTypeSelect;