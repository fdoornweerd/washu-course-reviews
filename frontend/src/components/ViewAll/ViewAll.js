// NavigateButton.js
import React from "react";
import { useNavigate } from 'react-router-dom';
import "./ViewAll.css";

function ViewAll({ to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return <button id = "viewAllTab" onClick={handleClick}>View All</button>;
}

export default ViewAll;
