import { useNavigation } from "react-router-dom";
import Loading from "../loading.jsx";

const NavigationLoader = () => {
  const navigation = useNavigation();
  if (navigation.state === "idle" || !navigation.location) return null;

  return (
    <div className="navigation-loading">
      <Loading pathname={navigation.location.pathname} />
    </div>
  );
};

export default NavigationLoader;