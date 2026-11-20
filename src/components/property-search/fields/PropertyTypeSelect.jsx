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
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-slate-600">Tipo de propiedad</label>
      <select
        id={id}
        {...register("type")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-12 w-full min-w-0 rounded-sm border border-stone-300 bg-[#fcfbf8] px-3 py-3 text-sm text-slate-800 transition-colors hover:border-slate-500 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus-visible:border-red-600"
      >
        <option value="">Todos los tipos</option>
        {propertyTypes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs font-medium leading-5 text-red-700">Error: {error.message}</p>}
    </div>
  );
};

export default PropertyTypeSelect;