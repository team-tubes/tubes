import React, { useState } from "react";
import { NavItem } from "./NavItem";

export default function Navbar() {
  return (
    <nav className="sticky items-center top-0 z-20 flex flex-wrap justify-between bg-neutral-800 x-2 drop-shadow-lg px-4 py-3">
      <a href="#" className="text-lg font-bold">
        infra.nz
      </a>
      <ul className="flex flex-wrap">
        <NavItem path={"/"} text="Map" />
        <NavItem path={"/issues"} text="Suburbs" />
        <NavItem path={"/report"} text="Report" />
        <NavItem path={"/upload"} text="Upload" />
        <NavItem path={"/reports"} text="All Reports" />
      </ul>
    </nav>
  );
}
