// NavigateButton.js
import React from "react";
import { useNavigate } from 'react-router-dom';

function ViewAll({ to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return <button onClick={handleClick}>View All</button>;
}

export default ViewAll;
