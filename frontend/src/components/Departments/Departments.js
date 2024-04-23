import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ReactLoading from "react-loading";
import "./Departments.css"

export default function Departments({ school}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);


  const [departments, setDepartments] = useState([])
  useEffect(() =>{
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3456/getDepartments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ school: school }),
        });
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();


  }, [school]);


    const deptClick = (school,dept) => {
      navigate(`/${school}/${dept}`);
    };
  
    if (isLoading) {
      return(
        <div className ="loadingScreen">
        <ReactLoading type="spokes" color="#D33C41"
      height={100} width={50} />
      </div>
      )  
    }

  return(
   <div className = "body-container">
      <h2> {school} Departments:</h2>
      <div className = "depts">
        {departments.map((dept) => (
            <button className = "dept-btn" key={dept} onClick={ () => deptClick(school,dept)}>{dept}</button>
        ))}
    </div>
    </div>
  );
}
