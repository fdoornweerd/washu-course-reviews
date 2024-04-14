import './App.css';
import React, { useState, useEffect } from "react";
import { getSchools } from '../../backend/functions';

function App() {
  const [schools, setSchools] = useState([]);
  useEffect(() => {
  if(schools === []){
    getSchools().then(value => setSchools(value));
  } }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        {schools.map((school) => (
          <p>
            {school}
          </p>
        ))}
      </header>
    </div>
  );
}

export default App;
