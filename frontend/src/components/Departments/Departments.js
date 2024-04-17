import React from "react";
import { useState, useEffect } from "react";

export default function Departments({ school}) {

  const [departments, setDepartments] = useState([])
  useEffect(() =>{
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:3456/getDepartments", {
          method: "POST", // or 'PUT'
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ school: school }),
        });
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();


  }, [school]);

  

  return (
    <div>
      <ul>
        {departments.map((dept) => (
          <li>{dept}</li>
        ))}
      </ul>
    </div>
  );
}
