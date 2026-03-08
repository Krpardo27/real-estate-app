import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import MainLayout from "./layouts/MainLayout";

const Home = lazy(() => import("./pages/Home"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));

const loader = <div className="p-10 text-center">Cargando...</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={loader}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "property/:id",
        element: (
          <Suspense fallback={loader}>
            <PropertyDetail />
          </Suspense>
        ),
        handle: {
          breadcrumb: (match) =>
            match.data?.title || `Propiedad ${match.params.id}`,
        },
      },
      {
        path: "search",
        element: (
          <Suspense fallback={loader}>
            <SearchResults />
          </Suspense>
        ),
        handle: {
          breadcrumb: () => "Resultados",
        },
      },
    ],
  },
]);

export default router;
