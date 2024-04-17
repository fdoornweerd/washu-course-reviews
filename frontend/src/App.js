import './App.css';
import React, { useState, useEffect } from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';

function App() {
  const [activeDept, setActiveDept] = useState("")
  const schools = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];

  return (
    
    <div className="App">
      <Tabs schools={schools} setActiveDept={setActiveDept}/>

      <CoursesSelector dept={activeDept}/>
    </div>
  );
}

export default App;
