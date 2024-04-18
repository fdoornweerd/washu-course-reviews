import './App.css';
import React from "react";
import Tabs from './components/Tabs/Tabs';
import CoursesSelector from './components/CoursesSelector/CoursesSelector';
import Course from './components/Course/Course';
import WriteReview from './components/Review/WriteReview';
import ViewAll from './components/ViewAll/ViewAll';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  const schools = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];

  return (
    <Router>
      <div>
        <Routes>



          <Route path="/" element={
              <div className="App">
                <div className="tabs">
                  <Tabs schools={schools}/> 
                  <ViewAll to="/all"></ViewAll>
                </div>
                
              </div>
            } />

          <Route path="/:school/:department" element={
            <CoursesSelector/>
          } />


          <Route path="/:school/:department/:code" element={
            <Course/>
          } />    

          <Route path="/:school/:department/:code/review" element={
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
