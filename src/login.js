import AuthContext from './context/AuthProvider';
import { useNavigate } from 'react-router';
import { React, useState, useEffect, useContext } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Login() {

    const { auth, setAuth } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const redirect = useNavigate("/")

    const handleSubmit = async e =>{
      try{
        e.preventDefault();
        const user = { email, password };
        const response = await axios.post(`${API_BASE_URL}/signin`, user, {
          headers: {
            // Overwrite Axios's automatically set Content-Type
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });
        if(!response){
            console.error("LOGIN ERROR TRY SIDE")
        }
        console.log(response.data)
        setAuth({
            user: true,
            username: response.data
        })
      }
      catch (err){
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
        <h2 class="homeH2 zoomAnimation">SWIVT</h2>
        <p id="error-message" class="errMsg fade-in hidden">Credentials are wrong or were not found</p>
        <form class="authForm" onSubmit={handleSubmit}>
            <label>Email</label>
            <input type="text" value={email} onChange={({ target }) => setEmail(target.value)}/>
            <label>Password</label>
            <input type="password" value={password} onChange={({ target }) => setPassword(target.value)}/>
            <button type="submit" class="loginButton zoomAnimationNoColor">Login</button>
        </form>
    </div>
  )
}

export default Login;