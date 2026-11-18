import React from "react";
import HeroSearch from "../components/HeroSearch";
import PropertyGrid from "../components/PropertyGrid";
import PropertyCategories from "../components/PropertyCategories";
import PropertiesByCity from "../components/PropertiesByCity";

const Home = () => {
  return (
    <div>
      <HeroSearch />
      <PropertyCategories />
      <PropertiesByCity />
      <PropertyGrid />
    </div>
  );
};

export default Home;
