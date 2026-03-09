import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import NavMobile from "../components/NavMobile";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <NavMobile />

      <main className="min-h-screen pb-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
