import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router";
import Home from './home';
import Map from './map';
import Nav from './nav';
import Login from './login';
import Inventory from './inventory';
import User from './User';
import SignUp from "./signup"
import './App.css'
import { AuthProvider } from './context/AuthProvider';
import AuthContext from './context/AuthProvider';

const App = () => {

  const { auth } = useContext(AuthContext);

  return (
    <div class="app">
      {auth?.user? (
        <>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/map" element={<Map />}/>
            <Route path="/inventory" element={<Inventory />}/>
            <Route path="/user" element={<User />}/>
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/signup" element={<SignUp />}/>
        </Routes>

      )}
    </div> 
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter> 
  </AuthProvider>
);