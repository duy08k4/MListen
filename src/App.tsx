// Import libraries
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages
import StartPage from "./ui/pages/startPage/StartPage.page";
import MainPage from "./ui/pages/mainPage/MainPage.page";

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
