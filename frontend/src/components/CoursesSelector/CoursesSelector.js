import React, { useState } from "react";

export default function CoursesSelector({dept}){
    const [deptCourses, setDeptCourses] = useState([])
    fetchCourses();

    async function fetchCourses(){
        try {
          const response = await fetch("http://localhost:3456/getAllCourses", {
            method: "POST", // or 'PUT'
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({dept: dept}),
          });
          const data = await response.json();
          setDeptCourses(data);
        } catch (error) {
          console.error("Error fetching departments:", error);
        }
      };
    
    return (
        <>
        <h2>COURSES for {dept}:</h2>
        
        {deptCourses.map((course) => (
            // dept course preview ocmonent
            <p>course: {course}</p>
        ))}

        </>

       

    )
}