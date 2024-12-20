import React, { useContext } from 'react'
import AuthContext from './context/AuthProvider'

export default function Home() {

  const { auth } = useContext(AuthContext);

  return (
    <div className='homeContainer animated'>
        <h1 class="zoomAnimation">project</h1>
        <h2 class="homeH2 zoomAnimation">SWIVT</h2>
        <p class="zoomAnimation">hello</p>
        <p class="zoomAnimation">_{auth.username}</p>
    </div>
  )
}
