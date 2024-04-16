import React, { useState } from "react";

export default function CoursesSelector({dept}){




    const [deptCourses, setDeptCourses] = useState([])

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