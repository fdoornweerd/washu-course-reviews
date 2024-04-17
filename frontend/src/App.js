import './App.css';
import React from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';
import Course from './components/Course/Course';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  const startingSchool = "Architecture";
  const schools = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];

  return (
    <Router>
      <div>
        <Routes>



          <Route path="/" element={
              <div className="App">
                <div className="tabs">
                  <Tabs schools={schools}/> 
                </div>
                
              </div>
            } />

          <Route path="/:school/:department" element={
            <CoursesSelector/>
          } />


          <Route path="/:school/:department/:code" element={
            <Course/>
          } />    




        </Routes>
      </div>
    </Router>
  );
}

export default App;
