import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Latex from 'react-latex'
import './App.css';

function App() {

  const getCookies = async () => {
    await axios.get("http://localhost:8080/auth/login", {withCredentials: true})
  }
  
  return (
    <button onClick={getCookies}></button>
  );
}

export default App;