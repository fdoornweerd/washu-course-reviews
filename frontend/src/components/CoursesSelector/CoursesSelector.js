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
      course.code.toLowerCase().includes(inputValue.toLowerCase()) ||
      course.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (course.instructors && course.instructors.some(instructor => instructor.fullName.toLowerCase().includes(inputValue.toLowerCase())))
  );


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

      const courseClick = (schoolNav,deptNav,codeNav) => {
        navigate(`/${schoolNav}/${deptNav}/${codeNav}`);
      };

      const inputChange = (event) => {
        setInputValue(event.target.value);
      };
    
    return (
          <div className="course-list">
        <h2>COURSES for {department}:</h2>
        <div className = "search-bar">
        <p id = "search">Search for course</p>
        <input
          type='text'
          placeholder="code, name, or professor"
          value={inputValue}
          onChange={inputChange}
      />
      </div>
        {filteredCourses.map((course) => (
            <li key = {course.id}>
              <button className ="course-btn" key={course.id} onClick={ () => courseClick(course.school,course.department,course.code)}>{course.code} - {course.name}</button>
            </li>
        ))}
        </div>
    )
}
