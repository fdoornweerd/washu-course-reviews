import React, { useState, useEffect,useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./Review.css";

export default function WriteReview() {

  const navigate = useNavigate();

  const [course, setCourse] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [rating,setRating] = useState(0)
  const [hover, setHover] = useState(null);
  const [formData, setFormData] = useState({
    prof: [],
    quality: '',
    difficulty: '',
    hours: '',
    comment: '',
  });
  const hourOptions = ['1','2-4', '5-8', '9-12', '13+'];
  const time = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });


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
          prof: data.instructors && data.instructors.length > 0 ? data.instructors[0] : '',
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

      let instructorsInsert = formData.prof.length > 0 ? formData.prof.map(idx => course.instructors[idx].lastName) : [];

      try {
        const response = await fetch("http://localhost:3456/insertReview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            name: name,
            professor: instructorsInsert,
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
    const { name, value, options } = e.target;
    if (name === 'prof' && options) {
      const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData(prevState => ({
        ...prevState,
        [name]: selectedValues
      }));
    } else{
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <form id="loginForm" onSubmit={handleSubmit}>
      <div className = "form-container">
      <div className = "input-section">
      <label> Professor: </label>
      <details>
        <summary> Choose one or many</summary>
      <ul>
      {course.instructors.map((instructor, index) => (
            <li key = {index}> <label> <input type = "checkbox" name = "fc" value = {instructor.lastName} onChange={handleChange}/>{instructor.lastName}</label>
            </li>
      ))}
      </ul>
      </details>
      </div>
      <div className = "input-section">
        <label htmlFor="quality"> Quality: </label>
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
      <div className = "input-section">
      <label htmlFor="difficulty">Difficulty:</label>
      <input type="number" id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange}></input>
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
      <textarea id="comment" name="comment" rows="4" cols="50" value={formData.comment} onChange={handleChange}></textarea>
      
      <input type="submit"></input>
      </div>
      </div>
    </form>
    </>
  );
}
/* 
<label for="prof">(hold shift to select multiple) Professor:</label>
<select multiple name='prof' id='prof' value={formData.prof} onChange={handleChange}>
        {course.instructors.map((instructor, index) => (
            <option key={index} value={index}>
                {instructor.lastName}
            </option>
        ))}
      </select>
   <input type="number" id="quality" name="quality" value={formData.quality} onChange={handleChange}></input>
      </div>*/