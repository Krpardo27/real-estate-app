import { useNavigation } from "react-router-dom";
import Loading from "../loading.jsx";

const NavigationLoader = () => {
  const navigation = useNavigation();
  if (navigation.state === "idle" || !navigation.location) return null;

  return (
    <div className="navigation-loading invisible fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto overscroll-contain bg-gray-50 pb-[var(--mobile-dock-space)] opacity-0 md:pb-0">
      <Loading pathname={navigation.location.pathname} />
    </div>
  );
};

export default NavigationLoader;