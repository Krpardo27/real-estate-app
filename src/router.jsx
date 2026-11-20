import { createBrowserRouter, redirect } from "react-router-dom";
import { initializePropertySearch } from "./utils/propertyFilters.js";
import Loading from "./loading.jsx";

import MainLayout from "./layouts/MainLayout";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";

const propertySearchLoader = ({ request }) => {
  const url = new URL(request.url);
  const query = initializePropertySearch(url.searchParams).toString();
  if (query !== url.searchParams.toString()) {
    return redirect(`${url.pathname}?${query}${url.hash}`);
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    // Necesario para la entrada directa a rutas lazy, no para las transiciones internas.
    hydrateFallbackElement: (
      <main id="main-content" className="min-h-screen"><Loading /></main>
    ),
    errorElement: <NotFound />,
    children: [
      {
        // Los errores de render, loader o importación se muestran en el Outlet,
        // sin desmontar la navegación, el main ni la restauración del scroll.
        errorElement: <NotFound />,
        children: [
          { path: "favorites", lazy: async () => ({ Component: (await import("./pages/Favorites.jsx")).default }) },
          { path: "*", element: <NotFound /> },
          { index: true, element: <Home /> },
          {
            path: "property/:id",
            lazy: async () => ({ Component: (await import("./pages/PropertyDetail.jsx")).default }),
            handle: {
              breadcrumb: (match) =>
                match.data?.title || `Propiedad ${match.params.id}`,
            },
          },
          {
            path: "map",
            loader: propertySearchLoader,
            lazy: async () => ({ Component: (await import("./pages/MapView.jsx")).default }),
          },
          {
            path: "search",
            loader: propertySearchLoader,
            lazy: async () => ({ Component: (await import("./pages/SearchResults.jsx")).default }),
            handle: {
              breadcrumb: () => "Resultados",
            },
          },
        ],
      },
    ],
  },
]);

export default router;
