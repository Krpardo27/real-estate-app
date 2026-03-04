import { createBrowserRouter } from "react-router-dom";

// import PropertyDetail from "../pages/PropertyDetail";
// import NotFound from "../pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";

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
        // path: "/property/:id",
        // element: <PropertyDetail />,
      },
    ],
  },
  // {
  //   path: "*",
  //   element: <NotFound />,
  // },
]);

export default router;
