import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Course(){
    const [course, setCourse] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const { school, department, code } = useParams();

    useEffect(() => {
      fetchCourse();
    }, [school, department, code]);

    async function fetchCourse(){
        try {
            setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({school: school, department: department, code: code}),
          });
          const data = await response.json();
          setCourse(data);
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
            setIsLoading(false);
        }
      };

      if(isLoading){
        return <div>Loading...</div>
      }
    
    return (
        <>
        <h2>{course.name}</h2>
        </>
    )
}
