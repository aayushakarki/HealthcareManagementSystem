import React from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
const AboutUs = () => {
  return (
    <>
      <Hero
        title={"Learn More About Us | MediCure HealthCare Management. A step towards improving healthcare access"}
        imageUrl={"/about.png"}
      />
      <Biography imageUrl={"/whoweare.png"} />
   </>
  );
};



export default AboutUs;