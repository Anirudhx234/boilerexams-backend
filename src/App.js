//import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  const login = async () => {
    window.open("http://localhost:8080/auth/discord/login", "_self");
  }

  const getCourses = async () => {
    await axios.get("http://localhost:8080/courses", { withCredentials: true })
      .then((resp) => alert("success"))
      .catch((error) => console.log("error"))
  }

  const logout = async () => {
    await axios.get("http://localhost:8080/auth/logout", { withCredentials: true })
      .then((resp) => alert(resp.data))
      .catch((err) => alert("something went wrong"))
  }

  const test = async () => {
    await axios.get("http://localhost:8080/auth/test", { withCredentials: true })
      .then((resp) => alert(resp.data))
      .catch((err) => alert("Unauthorized"))
  }

  return (
    <div>
      <button onClick={login}></button>
      <button onClick={getCourses}></button>
      <button onClick={logout}></button>
      <button onClick={test}></button>
    </div>
  );
}

export default App;