import './App.css';
import React from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';
import Course from './components/Course/Course';
import WriteReview from './components/Review/WriteReview';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import picture from './picture.png';

function App() {
  const schools = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={
              <div className="App">
                    <div className="title header-with-image">
                      <h1>WashU Course Reviews</h1>
                      <img src={picture} className="smaller-image" alt="Course Review"></img>
                    </div>
                <div className="tabs">
                  <Tabs schools={schools}/> 
                </div>
                
              </div>
            } />

          <Route path="/:school/:department" element={
            <CoursesSelector/>
          } />


          <Route path="/:school/:department/:name" element={
            <Course/>
          } />    

          <Route path="/:school/:department/:name/review" element={
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
