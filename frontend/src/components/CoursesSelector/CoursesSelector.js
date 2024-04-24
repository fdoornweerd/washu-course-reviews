import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import ReactLoading from "react-loading";
import './CoursesSelector.css';

export default function CoursesSelector(){
    const [courses, setCourses] = useState([])
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true)
    const { school, department } = useParams();
    const navigate = useNavigate();

    const filteredCourses = courses.filter(course =>
      course.code.some(code => code.toLowerCase().includes(inputValue.toLowerCase())) ||
      course.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (course.instructors && course.instructors.some(instructor => instructor.fullName.toLowerCase().includes(inputValue.toLowerCase())))
  );

  const colors = ["#D3D3D3","#ff7f7f","#ff7f7f","#FFF03A","#90EE90","#D3D3D3"];//grey, red, yellow, green


    //async function fetchCourses(){
      const fetchCourses = useCallback(async () => {
        try {
          setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({school: school === undefined ? 'all' :school, department: department === undefined ? 'all' : department}),
          });
          const data = await response.json();
          setCourses(data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setIsLoading(false);
        }


      }, [school, department]);

    useEffect(() => {
      fetchCourses();
    }, [fetchCourses, school, department]);


    if (isLoading) {
      return(
        <div className ="loadingScreen">
        <ReactLoading type="spokes" color="#D33C41"
      height={100} width={50} />
      </div>
      )  
    }

      const courseClick = (schoolNav,deptNav,nameNav) => {
        navigate(`/${schoolNav}/${deptNav}/${nameNav}`);
      };

      const inputChange = (event) => {
        setInputValue(event.target.value);
      };
    
    return (
          <div className="course-list">
            <div className = "white top-bar">
              <div className="btn-container">
              <button className = "back-btn" onClick={() => navigate(-1)}>Back</button>
              </div> 
              <div className="title-container">
              <h2>COURSES for: {department}</h2>
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
      <div className="course-buttons">
      {filteredCourses.map((course) => (
            <li key = {course.id}>
              <div className = "course-preview">
                <div className = "rating-container">
                  <p className = "rating-label">Quality:</p>
                  <div className = "rating-box" style={{backgroundColor: colors[Math.floor(course.avgQuality)]}}>
                    <p className = "rating-box-num">{course.avgQuality >0 ? course.avgQuality.toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
                <div className = "rating-container">
                  <p className = "rating-label">Difficulty:</p>
                  <div className = "rating-box" style={{backgroundColor: colors[Math.floor(course.avgDifficulty)]}}>
                    <p className = "rating-box-num">{course.avgDifficulty >0 ? course.avgDifficulty.toFixed(2) : 'N/A'}</p>
                  </div>
                </div>
                <div id = "rest-of-li">
              <button className ="course-btn" key={course.id} onClick={ () => courseClick(course.school,course.department,course.name)}>{course.name}</button>
              </div>
              </div>
              
            </li>
        ))}
        </div>
        </div>
    )
}

