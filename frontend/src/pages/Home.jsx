import React, { useContext } from "react";
import Hero from "../components/Hero";
import MessageForm from "../components/MessageForm";
import Departments from "../components/Departments";

const Home = () => {
  return (
    <>
      <Hero
        title={
          "Welcome to MediCore! Your Trusted Healthcare Provider"
        }
        imageUrl={"/hero.png"}
      />
      <Departments />
      <MessageForm />
    </>
  );
};

export default Home;