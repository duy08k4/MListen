// Import libraries
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import images
import AppLogo from "./assets/LogoApp.png"

// Import pages
import StartPage from "./pages/startPage/StartPage.page";
import MainPage from "./pages/mainPage/MainPage.page";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={StartPage} />
        <Route path="/main" Component={MainPage} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
