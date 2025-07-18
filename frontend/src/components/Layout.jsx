import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Optional Footer */}
      <footer className="bg-gray-100 py-4 text-center text-gray-600">
        &copy; {new Date().getFullYear()} IIITBH Connect. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;