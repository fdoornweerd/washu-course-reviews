import React from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./AboutBtn.css";
import informationButton from './information-button.png';

function AboutBtn() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/about');
  };

  return (
    <div className="abt-container" onClick={handleClick}>
      <img src={informationButton} alt="Information Button" id="info-img"/>
      <p className="abt-btn-text">About</p>
    </div>
  );
}

export default AboutBtn;

