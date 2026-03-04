import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import NavMobile from "../components/NavMobile";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col mx-auto max-w-360">
      <Header />
      <NavMobile />
      <main className="flex-1 container mx-auto p-6 ">
        <Outlet />
      </main>

      <footer className="border-t p-4 text-center text-sm">
        © 2026 HomeFinder
      </footer>
    </div>
  );
};

export default MainLayout;
