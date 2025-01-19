import React, { useContext, useState, useEffect } from 'react'
import { NavLink } from "react-router";
import AuthContext from './context/AuthProvider'
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Nav() {

  const { auth, setAuth } = useContext(AuthContext);

  const [fallback, setFallback] = useState(true)
  const [user, setUser] = useState({username: "user"})

  const loadMap = async () => {
      try{
          console.log("attempting to load map")
          const res = await axios.get(`${API_BASE_URL}/user`)
          setFallback(false)
          console.log(res.data.username)
          setUser(res.data);
          console.log("user loaded -> ", {user})
      }catch(err){

          console.log("auth: ",{auth})
          setFallback(true)
          console.log("Error loading map:", err.response || err.message)
      }
  }
  
  useEffect(()=>{
      loadMap()
  }, [])

  return (
    <div class="navbar">
      <NavLink to="/" end>
        <div class="navbardivideHome">
          <p class="navp zoomAnimation" id="navp1"><span>Home</span></p>
          <p class="navpSmall zoomAnimation" id="navp1" onClick={(e) => {setAuth({ user: false })}}><span>Sign Out</span></p>
        </div>      
      </NavLink>
        <div class="navbardivideOptions">
        {fallback ? (
            <p>player not loaded</p>
            ) : (
            <div class="na">
                <p>{auth.username}</p>
                <p>XP: {user.player.xp}</p>
                <p>Health: {user.player.health}</p>
                <p>Energy: {user.player.energy}</p>
                <p>Cash: {user.player.cash}</p>
            </div>
            )}
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
