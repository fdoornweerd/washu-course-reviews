import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import ReactLoading from "react-loading";
import "./Departments.css";

export default function Departments({ school }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true); // Start loading

      // clear session storage in case the user used browser's back btn and not the one I made
      sessionStorage.removeItem('searchTerm');
      sessionStorage.removeItem('filterType');
      sessionStorage.removeItem('selectedAttribute');
      sessionStorage.removeItem('selectedSchoolAttr');
      sessionStorage.removeItem('savedCourses');
      sessionStorage.removeItem('savedAttributions');

      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/getDepartments`, {
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
        setIsLoading(false); // End loading
      }
    };

    fetchDepartments();
  }, [school]); // Dependency array includes school, refetch if school changes

  const deptClick = (school, dept) => {
    sessionStorage.setItem('prevPath', location.pathname);
    navigate(`/${dept}`);
  };

  return (
    <div className="body-container">
      <h2>{school} Departments:</h2>
      {isLoading ? (
        <div className="loadingScreen">
          <ReactLoading type="bars" color="#606E52" height={160} width={80} />
        </div>
      ) : (
        <div className="depts">
          {departments.map((dept) => (
            <button className="dept-btn" key={dept} onClick={() => deptClick(school, dept)}>
              {dept}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
