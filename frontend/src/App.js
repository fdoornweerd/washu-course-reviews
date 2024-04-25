import './App.css';
import React from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';
import Course from './components/Course/Course';
import WriteReview from './components/Review/WriteReview';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


function App() {
  const schools = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={
              <div className="App">
                    <div className="title">
                      <h1>WashU Course Reviews</h1>
                    </div>
                <div className="tabs">
                  <Tabs schools={schools}/> 
                </div>
                
              </div>
            } />

          <Route path="/:department" element={
            <CoursesSelector/>
          } />


          <Route path="/:department/:name" element={
            <Course/>
          } />    

          <Route path="/:department/:name/review" element={
            <WriteReview/>
          } />    

          <Route path="/:all" element={
            <CoursesSelector/>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
