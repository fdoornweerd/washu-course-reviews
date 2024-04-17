import './App.css';
import React from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';

function App() {
  const startingSchool = "Architecture";
  const schools = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];

  return (
    
    <div className="App">
      <div className = "tabs">
       <Tabs schools={schools}/> 
      </div>

      <CoursesSelector dept={startingSchool}/>
    </div>
  );
}

export default App;
