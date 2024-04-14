import './App.css';
import React, { useState, useEffect } from "react";


function App() {
  const [schools, setSchools] = useState([]);

 useEffect(() => {
    fetch("http://localhost:3456")
      .then((res) => res.json())
      .then((data) => setSchools(data));
  }, []);

  return (
    <div className="App">
        {schools.map((school) => (
          <p>
            {school}
          </p>
        ))}
    </div>
  );
}

export default App;
