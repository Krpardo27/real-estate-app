import { Outlet, ScrollRestoration } from "react-router-dom";

import Header from "../components/Header";
import NavMobile from "../components/NavMobile";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import NavigationLoader from "../components/NavigationLoader.jsx";

const MainLayout = () => {
  return (
    <div className="site-layout flex min-h-screen flex-col pb-[var(--mobile-dock-space)] md:pb-0">
      <a href="#main-content" className="fixed top-3 left-4 z-10000 -translate-y-24 rounded-md bg-indigo-700 px-4 py-3 text-sm font-semibold text-white focus:translate-y-0">Saltar al contenido</a>
      <ScrollRestoration />
      <ScrollToTop />
      <Header />
      <NavMobile />

      <main id="main-content" tabIndex={-1} className="page-content flex-1 min-w-0 min-h-[calc(100dvh-80px)] outline-none">
        <NavigationLoader />
        <div className="route-outlet min-w-0"><Outlet /></div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
