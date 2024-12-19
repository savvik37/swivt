import React, { useState, useEffect } from 'react'
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const CONSTRING = process.env.REACT_APP_CONSTRING;

export default function Map() {

    const [map, setMap] = useState({})

    useEffect(()=>{
        const loadMap = async () => {
            try{
                console.log("attempting to load map")
                const locations = await axios.get(`${API_BASE_URL}/getAllLocations`)
                setMap(locations.data);
                console.log("map loaded -> ", map)  
            }catch{
                console.log("loadMap error occured")
            }
        }
        loadMap()
    }, [])

  return (
    <div class="mapComponent animated">
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
  )
}
