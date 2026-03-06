import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import NavMobile from "../components/NavMobile";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col mx-auto">
      <Header />
      <NavMobile />

      <main className="flex-1 lg:p-6 p-1 max-w-360 mx-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
