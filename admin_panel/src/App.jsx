import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./Router/AppRouter";
import "./components/pages/Home/all.css"

const App = () => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

export default App;
