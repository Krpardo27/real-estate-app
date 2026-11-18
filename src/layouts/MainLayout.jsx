import { Outlet, ScrollRestoration } from "react-router-dom";

import Header from "../components/Header";
import NavMobile from "../components/NavMobile";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import NavigationLoader from "../components/NavigationLoader.jsx";

const MainLayout = () => {
  return (
    <div className="site-layout min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <ScrollRestoration />
      <ScrollToTop />
      <Header />
      <NavMobile />

      <main id="main-content" tabIndex={-1} className="page-content flex-1 min-w-0 min-h-[calc(100dvh-80px)] outline-none">
        <NavigationLoader />
        <div className="route-outlet"><Outlet /></div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
