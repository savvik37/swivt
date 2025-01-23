//this whole component needs to be way more conditional e.g. conditionally render "total remaining" ONLY if its a gathering action
//actions need to display relevant information conditionally e.g. "go to the nightclub" will teleport the player to a nightclub interface
//this could potentially be solved without conditional hemroids if i just define what all the different types of "actions" are
//for example the actions will be divided into categories that are true in all locations
//(not all have to actually exist there tho, but architectually there is a strucutre to how locations work)
//LOCATION STRUCUTRE:
// Gathering Actions
// Spots (Locations within locations such as shops, clubs blah blah)
// NPC's (cant decide if these should be only at spots or both at location and spots within it)
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router';
import axios from 'axios';
import AuthContext from './context/AuthProvider';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

axios.defaults.withCredentials = true;

export default function Map() {

    const navigate = useNavigate("/")

    const [map, setMap] = useState({})
    const [actions, setActions] = useState({})
    const [currentLocation, setCurrentLocation] = useState({location_id: "67637065a9ec8adb8b96da94"})
    const [playerActions, setPlayerActions] = useState({})
    const [locationsFallback, setLocationsFallback] = useState(false)
    
    const { auth, setAuth } = useContext(AuthContext);
    console.log({auth})

    const loadMap = async () => {
        try{
            console.log("attempting to load map")
            const locations = await axios.get(`${API_BASE_URL}/getAllLocations`)
            setLocationsFallback(false)
            setMap(locations.data);
            console.log("map loaded -> ", {map})
        }catch(err){
            setAuth({
                user: false
            })
            console.log("auth: ",{auth})
            setLocationsFallback(true)
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
            console.log("actions time -> ", actions[0])
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
            MAP:
            {locationsFallback ? (
               <h1>LOCATIONS NOT LOADED</h1>
            ) : (
                Object.values(map).map((location, index)=>(
                    <div key={index} class="transactions2">
                        <p class=""><strong>{location.name}</strong></p>
                        <div class="cordDiv">
                            <p class="">cords: {location.cord_x}, </p>
                            <p class="">{location.cord_y}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div class="actions mapContainer animated">
            <p>Resources:</p>
            {Object.values(actions).map((action, index)=>(
                <div key={index} class="transactions2">
                    <p class=""><strong>{action.action_name}</strong></p>
                    <button type="button" class="actionButton micro-5-small zoomAnimation" onClick={(e) => handleAction(e, action.action_route)}>Gather</button>
                    <p class="animated">total remaining: {action.remaining}</p>
                    <p class="animated">time: {action.time}</p>
                </div>
            ))}
        </div>
        <div class="actions mapContainer animated">
            <p>Spots:</p>
            <div class="transactions2">DUMMYSPOT</div>
        </div>
    </div>
  )
}
