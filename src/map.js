import React, { useState, useEffect } from 'react'
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const CONSTRING = process.env.REACT_APP_CONSTRING;

axios.defaults.withCredentials = true;

export default function Map() {

    const [map, setMap] = useState({})
    const [actions, setActions] = useState({})
    const [currentLocation, setCurrentLocation] = useState({location_id: "67637065a9ec8adb8b96da94"})
    const [playerActions, setPlayerActions] = useState({})

    const loadMap = async () => {
        try{
            console.log("attempting to load map")
            const locations = await axios.get(`${API_BASE_URL}/getAllLocations`, {
                withCredentials: true
            })
            setMap(locations.data);
            console.log("map loaded -> ", {map})
        }catch(err){
            console.log("Error loading map:", err.response || err.message)
        }
    }

    const loadActions = async () => {
        try{
            console.log("attempting to loadActions")
            const response = await axios.post(`${API_BASE_URL}/getactions`,{
                location_id: currentLocation.location_id
            }, {
                withCredentials: true
            })
            setActions(response.data);
            console.log("actions loaded -> ", actions)  
        }catch{
            
            console.log("loadActions error occured")
        }
    } 

    useEffect(()=>{
        loadMap()
        loadActions()
    }, [])

    const handleAction = async (e, actionRoute) =>{
        try{
          e.preventDefault();
          const response = await axios.post(`${API_BASE_URL}/${actionRoute}`,{
            location_id: currentLocation.location_id,
            gather_speed: 5
          });
            loadActions()
          console.log("ACTION SUCCESSFUL -> DETAILS: ", response);
          
        }
        catch{
            console.log("there was an error performing the action")
        }
      };

  return (
    <div class="mapComponent animated">
        <div class="mapContainer animated">
            {Object.values(map).map((location, index)=>(
                <div key={index} class="transactions2">
                    <p class=""><strong>{location.name}</strong></p>
                    <div class="cordDiv">
                        <p class="">cords: {location.cord_x}, </p>
                        <p class="">{location.cord_y}</p>
                    </div>
                </div>
            ))}           
        </div>
        <div class="mapContainer animated">
            {Object.values(actions).map((action, index)=>(
                <div key={index} class="transactions2">
                    <p class=""><strong>{action.action_name}</strong></p>
                    <button type="button" class="actionButton" onClick={(e) => handleAction(e, action.action_route)}>Perform</button>
                    <p class="animated">total remaining: {action.remaining}</p>
                </div>
            ))}
        </div>
    </div>
  )
}
