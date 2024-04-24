import React, { useState, useEffect,useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { TbSquare } from "react-icons/tb";
import "./Review.css";

export default function WriteReview() {

  const navigate = useNavigate();

  const [course, setCourse] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [rating,setRating] = useState(0)
  const [difficulty, setDifficulty] = useState(0)
  const [hover, setHover] = useState(null);
  const [hover2, setHover2] = useState(null);
  const [tempText, setTempText] = useState("");
  const [formData, setFormData] = useState({
    prof: [],
    quality: '',
    difficulty: '',
    hours: '',
    comment: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const hourOptions = ['1','2-4', '5-8', '9-12', '13+'];
  const time = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });

  const colorsAndWords= new Map([
    [1, ["#00FF00", "Easy"]],//green
    [2,["#DFFF00", "Not too bad"]],//greenish yellow
    [3,["#ffc107", "Meh"]],
    [4,["#ff7f7f", "Hard"]],
    [5,["#FF5733", "Super hard"]],
  ]);
  const { school, department, name } = useParams();
    
  const fetchCourse = useCallback(async () => {
      try {
          setIsLoading(true);
        const response = await fetch("http://localhost:3456/getCourse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({school: school, department: department, name: name}),
        });
        const data = await response.json();
        setCourse(data);
        setFormData(prevFormData => ({
          ...prevFormData,
          hours: hourOptions[0],
        }));
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
          setIsLoading(false);
      }
    }, [school, department,name]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse, school, department,name]);



    const insertReview = async () => {
      try {
        const response = await fetch("http://localhost:3456/insertReview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            name: name,
            professor: formData.prof,
            quality: formData.quality,
            difficulty: formData.difficulty,
            hours: formData.hours,
            comment: formData.comment,
            date: formatter.format(time)
          }),
        });
        const data = await response.json();
      } catch (error) {
        console.error("Error inserting review:", error);
      }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'prof') {
      setFormData(prevState => {
        const newProfs = [...prevState.prof];
        
        if (newProfs.includes(value)) {
          return {
            ...prevState,
            prof: newProfs.filter(el => el !== value)
          };
        } else {

          newProfs.push(value);
          return {
            ...prevState,
            prof: newProfs
          };
        }
      });
    } else{
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

  }
  const handleMouseEnter = (diff) => {
    setHover2(diff);
    setTempText(colorsAndWords.get(diff)[1]);
  }

  const handleMouseLeave = () =>{
    setHover2(null);
    setTempText(null);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    const response = await insertReview();
    setFormData({
      prof: '',
      quality: '',
      difficulty: '',
      hours: '',
      comment: '',
    });
    navigate(`/${school}/${department}/${name}`);
  };

  if (isLoading) {
    return(
      <div className ="loadingScreen">
      <ReactLoading type="spokes" color="#D33C41"
    height={100} width={50} />
    </div>
    )  
  }
  return (
    <>
    <div className = "top-bar">
    <div className="btn-container">
    <button className = "back-btn" onClick={() => navigate(-1)}>Back</button>
    </div> 
    <div className="title-container">
    <h2>Review for: {course.name}</h2>
    </div>
    </div>
    <form id="reviewForm" onSubmit={handleSubmit}>
      <div className = "form-container">
      <div className = "input-section">
      <label> Professor: </label>
      <details>
        <summary> Choose one or many</summary>
      <ul id = "dropdown">
      {course.instructors.map((instructor, index) => (
            <li key = {index}> <label> <input type = "checkbox" name = "prof" value = {instructor.lastName} onChange={handleChange}/>{instructor.lastName}</label>
            </li>
      ))}
      </ul>
      </details>
      </div>
      <div className = "input-section">
        <label htmlFor="quality"> Quality: </label>
        <div className="shapes">
      {[...Array(5)].map((_, index) => {
    const givenRating = index + 1;
    return (
      <label key={index}>
        <input
          type="radio"
          name="quality"
          value={givenRating}
          checked={rating === givenRating}
          onChange={handleChange}
          onClick={() => setRating(givenRating)}
        />
        <FaStar
           color = {givenRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
          className="star"
          onMouseEnter={() => setHover(givenRating)}
          onMouseLeave={() => setHover(null)}
        />
      </label>
    );
  })}
  </div>
      </div>
      <div className = "input-section">
      <label htmlFor="difficulty">Difficulty:</label>
      <div className="shapes">
      {[...Array(5)].map((_, index) => {
    const givenDifficulty = index + 1;
    return (
      <label className = "squares" key={index}>
        <input
          type="radio"
          name="difficulty"
          value={givenDifficulty}
          checked={difficulty === givenDifficulty}
          onChange={handleChange}
          onClick={() => setDifficulty(givenDifficulty)}
        />
        <TbSquare
          color = {givenDifficulty <= (hover2 || difficulty) ? colorsAndWords.get(givenDifficulty)[0]: "#e4e5e9"}
          className="square"
          onMouseEnter={() => handleMouseEnter(givenDifficulty)}
          onMouseLeave={() => handleMouseLeave()}
        />
      </label>
    );
  })}
   <p id = "tempText">{tempText}</p>
  </div>
      </div>
      <div className = "input-section">
      <label htmlFor="hours">Hours Per Week:</label>
      <select name='hours' id='hours' value={formData.hours} onChange={handleChange}>
        {hourOptions.map((time, index) => (
            <option key = {index} value = {time}>
                {time}
            </option>
        ))}
       </select>
      </div>
      <div className = "input-section">
      <label htmlFor="comment">Comment:</label>
      </div>
      <div className="input-section">
      <textarea id="comment" name="comment" rows="5" cols="60" value={formData.comment} onChange={handleChange}></textarea>
      </div>
      <div id = "submit">
      <input className = "course-action-btn" type="submit" disabled={formData.quality === '' || formData.difficulty === '' || formSubmitted}></input>
      </div>
      </div>
    </form>
    </>
  );
}
