import { useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { chileRegions } from "../../../data/regions.js";

const DistrictSelect = () => {
  const id = useId();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const region = useWatch({ control, name: "region", exact: true });
  const selectedRegion = chileRegions.find((entry) => entry.id === region);
  const error = errors.district;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-slate-600">
        Comuna
      </label>
      <select
        id={id}
        {...register("district")}
        disabled={!selectedRegion}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-12 w-full min-w-0 rounded-sm border border-stone-300 bg-[#fcfbf8] px-3 py-3 text-sm text-slate-800 transition-colors hover:border-slate-500 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus-visible:border-red-600"
      >
        <option value="">
          {selectedRegion ? "Todas las comunas" : "Elige una región"}
        </option>
        {selectedRegion?.communes.map((commune) => (
          <option key={commune} value={commune}>
            {commune}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs font-medium leading-5 text-red-700">
          Error: {error.message}
        </p>
      )}
    </div>
  );
};

export default DistrictSelect;
