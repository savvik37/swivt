import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router';
import axios from 'axios';
import AuthContext from './context/AuthProvider';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

axios.defaults.withCredentials = true;

export default function User() {

    const {auth, setAuth} = useContext(AuthContext)
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
    <div class="userContainer">
        
        {fallback ? (
            <h1>player not loaded</h1>
            ) : (
            <div>
                <h2>{auth.username}</h2>
                <h4>XP: {user.player.xp}</h4>
                <h4>Health: {user.player.health}</h4>
                <h4>Energy: {user.player.energy}</h4>
                <h4>Cash: {user.player.cash}</h4>
                <h4>Gather Speed: {user.player.gather_speed}</h4>
                <h4>Travel Speed: {user.player.travel_speed}</h4>
            </div>
            )}

    </div>
  )
}
