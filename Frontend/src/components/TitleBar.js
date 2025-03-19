import React from "react";
import { Link } from "react-router-dom";
import Logo from "../favicon.svg";

const TitleBar = () => {
  return (
    <div className="bg-teal-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          {/* Logo from /public/favicon.svg */}
          <img src={Logo} alt="FairShare AI Logo" className="h-12 w-12" />
          {/* Text Logo */}
          <div>
            <h1 className="text-xl font-bold">FairShare AI</h1>
            <p className="text-xs text-teal-200">Bill Splitting Made Easy</p>
          </div>
        </Link>
        <div className="hidden md:flex space-x-4 items-center">
          <Link to="/" className="hover:text-teal-200 transition duration-200">
            New Event
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
