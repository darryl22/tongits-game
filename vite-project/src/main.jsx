import React from 'react';
import { StrictMode } from 'react';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import Home from './components/Home';
import Nav from './components/Nav';
import Game from './components/Game';
import Login from './components/Login';
import Signup from './components/Signup';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav />}>
          <Route index element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
