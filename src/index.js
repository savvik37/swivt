import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router";
import Home from './home';
import Map from './map';
import Nav from './nav';
import './App.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter class="app">
    <div class="app">
      <Nav/>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/map" element={<Map />}/>
      </Routes>
    </div>
  </BrowserRouter>
);