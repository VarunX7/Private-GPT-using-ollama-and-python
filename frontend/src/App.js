import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'
import Admin from './Admin'
import User from './User'

const App = () => {
  return(
    <Router>
  
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/Admin" element={<Admin/>}></Route>
          <Route path="/User" element={<User/>}></Route>
        </Routes>
     
    </Router>
  );
}

export default App
