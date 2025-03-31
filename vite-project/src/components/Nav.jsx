import { Outlet, Link } from "react-router-dom";
import React from "react";

const Nav = () => {
  return (
    <>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/game">Game</Link>
      </nav>
      <Outlet />
    </>
  )
};

export default Nav;