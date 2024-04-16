import './App.css';
import React, { useState, useEffect } from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';

function App() {
  const [departments, setDepartments] = useState(null);

 useEffect(() => {
    fetch("http://localhost:3456")
      .then((res) => res.json())
      .then((data) => setDepartments(data.departments));
  }, []);

  return (
    
    <div className="App">
      <Tabs departments={departments}/>

      <CoursesSelector/>
    </div>
  );
}

export default App;
