import React, { useContext, useState, useEffect } from 'react'
import { NavLink } from "react-router";
import AuthContext from './context/AuthProvider'
import axios from 'axios';
import { io } from "socket.io-client";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Nav() {

  const { auth, setAuth } = useContext(AuthContext);

  const [fallback, setFallback] = useState(true)
  const [user, setUser] = useState({username: "user"})
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
        withCredentials: true,
        autoConnect: true,
        transports: ['websocket', 'polling'],
    });
    setSocket(newSocket)

    return () => {
        newSocket.disconnect(); // cleanup
    };
},[]); 

  useEffect(() => {
    if (socket) {
        socket.emit("fetchPlayerStats");
        socket.on("playerStats", (player) => {
            console.log(player)
            setUser((prevUser) => ({ ...prevUser, player }));
            setFallback(false);
        });
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        return () => {
            socket.off("playerStats");
            socket.off("error");
        };
    }
}, [socket, auth]);

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
            <div class="navStats">
                <p>XP: <strong class="purpleText">{user.player.xp}</strong></p>
                <p>Health: <strong class="redText">{user.player.health}</strong></p>
                <p>Energy: <strong class="yellowText">{user.player.energy}</strong></p>
                <p>Cash: <strong class="greenText">{user.player.cash}</strong></p>
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
