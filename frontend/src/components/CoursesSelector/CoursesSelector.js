import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import ReactLoading from "react-loading";

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
            body: JSON.stringify({school: school === null ? 'all' :school, department: department === null ? 'all' : department}),
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


      if(isLoading){
         return <ReactLoading type="spokes" color="#0000FF"
      height={100} width={50} />;
      }

      const courseClick = (schoolNav,deptNav,codeNav) => {
        navigate(`/${schoolNav}/${deptNav}/${codeNav}`);
      };

      const inputChange = (event) => {
        setInputValue(event.target.value);
      };
    
    return (
        <>
        <h2>COURSES for {department}:</h2>
        <p>Search for course</p>
        <input
          type='text'
          placeholder="code, name, or professor"
          value={inputValue}
          onChange={inputChange}
      />
        {filteredCourses.map((course) => (
            <li key = {course.id}>
              <button key={course.id} onClick={ () => courseClick(course.school,course.department,course.code)}>{course.code} - {course.name}</button>
            </li>
        ))}
        </>
    )
}
