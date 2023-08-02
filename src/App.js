//import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  axios.defaults.withCredentials = true;
  const API_URL = "http://localhost:8080";
  //const API_URL = "https://testing-387121.uc.r.appspot.com"

  const login = async () => {
    window.open(`${API_URL}/auth/discord/login`, "_self");
  }

  const getCourses = async () => {
    await axios.get(`${API_URL}/courses`)
      .then((resp) => console.log(resp))
      .catch((error) => alert("error"))
  }

  const logout = async () => {
    await axios.get(`${API_URL}/auth/logout`)
  }

  const test = async () => {
    await axios.get(`${API_URL}/auth/test`)
      .then((resp) => alert(resp.data))
      .catch((err) => alert("Unauthorized"))
  }

  const getMe = async () => {
    await axios.get(`${API_URL}/users/me`)
      .then((resp) => alert(resp.data.email))
      .catch((err) => alert("Unauthorized"))
  }

  return (
    <div>
      <button onClick={login}></button>
      <button onClick={getCourses}></button>
      <button onClick={logout}></button>
      <button onClick={test}></button>
      <button onClick={getMe}></button>
    </div>
  );
}

export default App;