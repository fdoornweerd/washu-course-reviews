import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate,useLocation } from 'react-router-dom';
import ReactLoading from "react-loading";
import './CoursesSelector.css';

export default function CoursesSelector(){
    const [courses, setCourses] = useState([])
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    const { department } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const filteredCourses = courses.filter(course =>
      course.code.some(code => code.toLowerCase().includes(inputValue.toLowerCase())) ||
      course.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (course.instructors && course.instructors.some(instructor => instructor.fullName.toLowerCase().includes(inputValue.toLowerCase())))
  );

  const colors = ["#D3D3D3","#DD3730","#FF9500","#FFCD00","#9ED10F","#3BA500"];//grey, red, yellow, green
  const difficultColors= ["D3D3D3","#3BA500","#9ED10F","#FFCD00","#FF9500","#DD3730"];

    //async function fetchCourses(){
      const fetchCourses = useCallback(async () => {
        try {
          setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({department: department === undefined ? 'all' : department}),
          });
          const data = await response.json();
          setCourses(data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setIsLoading(false);
        }


      }, [department]);

    useEffect(() => {
      fetchCourses();
    }, [fetchCourses, department]);



      const courseClick = (deptNav,nameNav) => {
        sessionStorage.setItem('prevPath', location.pathname);
        navigate(`/${deptNav}/${nameNav}`);
      };

      const inputChange = (event) => {
        setInputValue(event.target.value);
      };

    
    return (
          <div className="course-list">
            <div className = "white top-bar">
              <div className="btn-container">
              <button className = "back-btn" onClick={() => {navigate(`/`);}}>Back</button>
              </div> 
              <div className="title-container">
              <h2>{department === (undefined || 'all') ? 'All Courses' : `Courses for ${department}`}</h2>
              </div>
            </div>
        <div className = "search-bar">
        <p id = "search">Search for course</p>
        <input
          type='text'
          placeholder="code, name, or professor"
          value={inputValue}
          onChange={inputChange}
      />
      </div>

      {isLoading &&    
        <div className ="loadingScreen">
          <ReactLoading type="bars" color="#606E52"
        height={160} width={80} />
        </div>
      }

      <div className="course-buttons">
      {filteredCourses.map((course) => (
            <li key={course.id} >
              <div className = "course-preview" onClick={ () => courseClick(course.department,course.name)}>
                <div className = "rating-container">
                  <p className = "rating-label">Quality:</p>
                  <div className = "rating-box" style={{backgroundColor: colors[Math.round(course.avgQuality)]}}>
                    <p className = "rating-box-num">{course.avgQuality >0 ? course.avgQuality.toFixed(1) : 'N/A'}</p>
                  </div>
                </div>
                <div className = "rating-container">
                  <p className = "rating-label">Difficulty:</p>
                  <div className = "rating-box" style={{backgroundColor: (course.avgDifficulty===0 ? "#D3D3D3" : difficultColors[Math.round((course.avgDifficulty))])}}>
                    <p className = "rating-box-num">{course.avgDifficulty >0 ? course.avgDifficulty.toFixed(1) : 'N/A'}</p>
                  </div>
                </div>
                <div id = "rest-of-li">
              <button className ="course-btn">{course.name}</button>
              </div>
              </div>
              
            </li>
        ))}
        </div>
        </div>
    )
}

