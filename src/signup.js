import AuthContext from './context/AuthProvider';
import { useNavigate } from 'react-router';
import { React, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NavLink } from "react-router";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SignUp() {

    const { auth, setAuth } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");

    const redirect = useNavigate("/map")

    const back2Log = useNavigate("/Login")

    const handleSubmit = async e =>{
      try{
        e.preventDefault();
        const user = { username, email, password };
        const response = await axios.post(`${API_BASE_URL}/createuser`, user, {
          headers: {
            // Overwrite Axios's automatically set Content-Type
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        console.log(response.data)
        setAuth({
            user: true,
            username: response.data
        })
      }
      catch (err){
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message); // Set the server error message
      } else {
          setError("An unexpected error occurred. Please try again.");
      }
        console.error("Login error: ", err);
        document.getElementById("error-message").classList.remove('hidden');
      }
    };

    useEffect(()=>{
        if(auth.user){
            redirect()
        }
    }, [])

  return (
    <div class="authBox animated">
      <div class="formLogoInfo">
        <h2 class="homeH2 zoomAnimation">SWIVT</h2>
        <h3 class="infoH2">Create an account -{'>'} </h3>
      </div>
        <p id="error-message" class="errMsg fade-in hidden">{error}</p>
        <form class="authForm" onSubmit={handleSubmit}>
            <label>Username</label>
            <input type="text" value={username} onChange={({ target }) => setUsername(target.value)}/>
            <label>Email</label>
            <input type="text" value={email} onChange={({ target }) => setEmail(target.value)}/>
            <label>Password</label>
            <input type="password" value={password} onChange={({ target }) => setPassword(target.value)}/>
            <button type="submit" class="signUpButton zoomAnimation">Sign Up</button>
            <NavLink to="/" end>
              <button type="button" class="backToLogIn zoomAnimation">Go To Log In</button>
            </NavLink>  
        </form>
    </div>
  )
}

export default SignUp;