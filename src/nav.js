import React from 'react'
import { NavLink } from "react-router";

export default function Nav() {
  return (
    <div class="navbar">
      <NavLink to="/" end>
        <div class="navbardivideHome">
          <p class="navp" id="navp1"><span>Home</span></p>
        </div>      
      </NavLink>
        <div class="navbardivideOptions">
        <NavLink to="/map" end>
          <p class="navp" id="navp2"><span>Map</span></p>
        </NavLink>
        <NavLink to="/" end>
          <p class="navp" id="navp2"><span>OPTION</span></p>
        </NavLink>
        <NavLink to="/" end>
          <p class="navp" id="navp2"><span>OPTION</span></p>
        </NavLink>      
        <NavLink to="/" end>
          <p class="navp" id="navp2"><span>OPTION</span></p>
        </NavLink>           
        </div>  

    </div>
  )
}
