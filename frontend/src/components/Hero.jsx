import React from "react";

const Hero = ({ title, imageUrl }) => {
  return (
    <>
      <div className="hero container">
        <div className="banner">
          <h1>{title}</h1>
          <p>
<<<<<<< HEAD
            Simplify healthcare with Medicore - your all-in-one platform for
=======
            Simplify healthcare with Medicore — your all-in-one platform for
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
            managing patients, schedules, and billing, so you can focus on what
            matters most: care.
          </p>
        </div>
        <div className="banner">
          <img src={imageUrl} alt="hero" className="animated-image" />
          <span>
            <img src="/Vector.png" alt="vector" />
          </span>
        </div>
      </div>
    </>
  );
};

export default Hero;