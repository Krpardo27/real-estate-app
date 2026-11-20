import { useId } from "react";
import { m as Motion, useReducedMotion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { buildPropertySearchParams } from "../../utils/propertySearch.js";
import { propertySearchSchema } from "./schemas/propertySearch.schema.js";
import RegionSelect from "./fields/RegionSelect.jsx";
import DistrictSelect from "./fields/DistrictSelect.jsx";
import PropertyTypeSelect from "./fields/PropertyTypeSelect.jsx";
import PriceSelect from "./fields/PriceSelect.jsx";

const formOptions = {
  resolver: zodResolver(propertySearchSchema),
  defaultValues: { region: "", district: "", type: "", price: "" },
  mode: "onSubmit",
  reValidateMode: "onChange",
  shouldFocusError: true,
};

const PropertySearchForm = () => {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const headingMotion = {
    initial: reducedMotion ? false : { opacity: 0.8, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] },
  };
  const navigate = useNavigate();
  const methods = useForm(formOptions);
  const { isSubmitting } = methods.formState;

  /** @param {PropertySearchValues} values */
  const handleSearch = (values) => {
    const params = buildPropertySearchParams(values);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSearch)}
        noValidate
        role="search"
        aria-label="Buscar propiedades"
        aria-describedby={`${id}-hint`}
        className="relative mt-6 border border-stone-200 bg-white p-4 text-slate-900 sm:p-6 lg:z-10 lg:-mt-14 lg:p-7"
      >
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <Motion.h2 {...headingMotion} className="text-base font-semibold tracking-tight">¿Qué propiedad buscas?</Motion.h2>
          <Motion.p {...headingMotion} id={`${id}-hint`} className="text-xs leading-5 text-slate-600">Todos los filtros son opcionales.</Motion.p>
        </div>

        <div className="grid min-w-0 items-start gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
          <RegionSelect />
          <DistrictSelect />
          <PropertyTypeSelect />
          <PriceSelect />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:flex-nowrap">
          <p className="max-w-sm text-xs leading-5 text-slate-600 sm:max-w-60 lg:max-w-sm">Algunas comunas no tienen propiedades de demostración.</p>
          <div className="flex flex-col gap-2 sm:ml-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-indigo-700 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 active:bg-indigo-900 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              <FiSearch size={18} aria-hidden="true" />
              Buscar
            </button>
            <button
              type="button"
              onClick={() => navigate("/search?filters=all")}
              className="min-h-12 whitespace-nowrap rounded-md px-3 text-sm font-medium text-indigo-700 underline underline-offset-4 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Ver todo el catálogo
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default PropertySearchForm;