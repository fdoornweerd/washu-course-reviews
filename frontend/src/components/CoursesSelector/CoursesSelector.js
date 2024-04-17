import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function CoursesSelector(){
    const [courses, setCourses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { school, department } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
      fetchCourses();
    }, [school, department]);

    async function fetchCourses(){
        try {
          setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({school: school, department: department}),
          });
          const data = await response.json();
          setCourses(data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setIsLoading(false);
        }
      };

      if(isLoading){
        return <div>Loading...</div>
      }

      const courseClick = (schoolNav,deptNav,codeNav) => {
        navigate(`/${schoolNav}/${deptNav}/${codeNav}`);
      };
    
    return (
        <>
        <h2>COURSES for {department}:</h2>

        {courses.map((course) => (
            <li>
              <button key={course.id} onClick={ () => courseClick(course.school,course.department,course.code)}>{course.code} - {course.name}</button>
            </li>
        ))}
        </>
    )
}
