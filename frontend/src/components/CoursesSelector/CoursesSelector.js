import React, { useState } from "react";

export default function CoursesSelector({dept}){


    const [deptCourses, setDeptCourses] = useState([])

    fetch("http://localhost:3456/getAllCourses", {

        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({dept: dept}),
      });
      .then((res) => res.json())
      .then((data) => setSchools(data));
  }
  
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