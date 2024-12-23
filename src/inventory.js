import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router';
import axios from 'axios';
import AuthContext from './context/AuthProvider';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

axios.defaults.withCredentials = true;

export default function Inventory() {

    const [inventory, setInventory] = useState([])
    const [inventoryFallback, setInventoryFallback] = useState(false)

    const { auth, setAuth } = useContext(AuthContext);
    console.log({auth})
    
    const loadMap = async () => {
        try{
            console.log("attempting to load map")
            const locations = await axios.get(`${API_BASE_URL}/inventory`)
            setInventoryFallback(false)
            setInventory(locations.data);
            console.log("inventory loaded -> ", {inventory})
        }catch(err){
            setAuth({
                user: false
            })
            console.log("auth: ",{auth})
            setInventoryFallback(true)
            console.log("Error loading map:", err.response || err.message)
        }
    }
    
    useEffect(()=>{
        loadMap()
    }, [])

  return (
    <div class="mapComponent animated">
        <div class="inventoryContainer animated">
            {inventoryFallback ? (
            <h1>INVENTORY NOT LOADED</h1>
            ) : (
                inventory.map((item, index)=>(
                    <div key={index} class="inventoryDiv zoomAnimation">
                        <p class=""><strong>{item.item_id[0].item_name}</strong></p>
                        <p class="">x{item.amount}</p>
                        <div class="descDiv">
                            <p class="">{item.item_id[0].item_desc}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  )
}
