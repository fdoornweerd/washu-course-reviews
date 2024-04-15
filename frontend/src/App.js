import './App.css';
import React, { useState, useEffect } from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';

function App() {
  const [schools, setSchools] = useState([]);
  const [activeDept, setActiveDept] = useState("")

 useEffect(() => {
    fetch("http://localhost:3456")
      .then((res) => res.json())
      .then((data) => setSchools(data));
  }, []);

console.log(schools);
  return (
    <div className="App">
      <Tabs schools={schools} setActiveDept={setActiveDept}/>

      <CoursesSelector dept={activeDept}/>
    </div>
  );
}

export default App;
