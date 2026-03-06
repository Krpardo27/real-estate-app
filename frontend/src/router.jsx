import { createBrowserRouter } from "react-router-dom";

// import NotFound from "../pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import SearchResults from "./pages/SearchResults";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "property/:id",
        element: <PropertyDetail />,
        handle: {
          breadcrumb: (match) =>
            match.data?.title || `Propiedad ${match.params.id}`,
        },
      },
      {
        path: "/search",
        element: <SearchResults />,
        handle: {
          breadcrumb: () => "Resultados",
        },
      },
    ],
  },
]);

export default router;
