import React, { useContext } from 'react'
import { NavLink } from "react-router";
import AuthContext from './context/AuthProvider'

export default function Nav() {

  const { auth, setAuth } = useContext(AuthContext);

  return (
    <div class="navbar">
      <NavLink to="/" end>
        <div class="navbardivideHome">
          <p class="navp zoomAnimation" id="navp1"><span>Home</span></p>
          <p class="navpSmall zoomAnimation" id="navp1" onClick={(e) => {setAuth({ user: false })}}><span>Sign Out</span></p>
        </div>      
      </NavLink>
        <div class="navbardivideOptions">
        <NavLink to="/map" end>
          <p class="navp zoomAnimation" id="navp2"><span>Map</span></p>
        </NavLink>
        <NavLink to="/inventory" end>
          <p class="navp zoomAnimation" id="navp2"><span>Inventory</span></p>
        </NavLink> 
        <NavLink to="/user" end>
          <div>
            <p class="username zoomAnimation">user: </p>
            <p class="navp zoomAnimation" id="navp2">{auth.username}</p>
          </div>
        </NavLink>           
        </div>  

    </div>
  )
}
