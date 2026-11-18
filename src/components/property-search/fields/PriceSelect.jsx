import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { PROPERTY_PRICE_LIMITS, formatFilterValue } from "../../../utils/propertyFilters.js";

const PriceSelect = () => {
  const id = useId();
  /** @type {import("react-hook-form").UseFormReturn<import("../schemas/propertySearch.schema.js").PropertySearchValues>} */
  const { register, formState: { errors } } = useFormContext();
  const error = errors.price;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="property-search-label">Precio máximo (CLP)</label>
      <select
        id={id}
        {...register("price")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="property-search-select"
      >
        <option value="">Sin límite de precio</option>
        {PROPERTY_PRICE_LIMITS.map((limit) => <option key={limit} value={String(limit)}>{formatFilterValue("price", limit)}</option>)}
      </select>
      {error && <p id={`${id}-error`} role="alert" className="property-search-error">Error: {error.message}</p>}
    </div>
  );
};

export default PriceSelect;