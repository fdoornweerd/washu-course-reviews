// NavigateButton.js
import React from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./ViewAll.css";

function ViewAll({ to }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    sessionStorage.setItem('prevPath',location.pathname);
    navigate(to);
  };

  return <button id = "viewAllTab" onClick={handleClick}>View All Courses</button>;
}

export default ViewAll;
