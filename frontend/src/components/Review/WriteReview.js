import React, { useState, useEffect,useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactLoading from "react-loading";
import { useNavigate } from "react-router-dom";


export default function WriteReview() {

  const navigate = useNavigate();

  const [course, setCourse] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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


  const { school, department, code } = useParams();
    
  const fetchCourse = useCallback(async () => {
      try {
          setIsLoading(true);
        const response = await fetch("http://localhost:3456/getCourse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({school: school, department: department, code: code}),
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
    }, [school, department,code]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse, school, department,code]);



    const insertReview = async () => {

      let instructorsInsert = formData.prof.length > 0 ? formData.prof.map(idx => course.instructors[idx].lastName) : [];

      try {
        const response = await fetch("http://localhost:3456/insertReview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            code: code,
            professor: instructorsInsert,
            quality: formData.quality,
            difficulty: formData.difficulty,
            hours: formData.hours,
            comment: formData.comment,
            date: formatter.format(time),
            userID: 1, //TODO OR DELETE
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
    navigate(`/${school}/${department}/${code}`);
  };

  if(isLoading){
    return <ReactLoading type="spokes" color="#0000FF"
    height={100} width={50} />;
  }


  return (
    <form id="loginForm" onSubmit={handleSubmit}>
      <label htmlFor="prof">(hold shift to select multiple) Professor:</label>
      <select multiple name='prof' id='prof' value={formData.prof} onChange={handleChange}>
        {course.instructors.map((instructor, index) => (
            <option key={index} value={index}>
                {instructor.lastName}
            </option>
        ))}
      </select>
      
      <label htmlFor="quality">Quality:</label>
      <input type="number" id="quality" name="quality" value={formData.quality} onChange={handleChange}></input>
      
      <label htmlFor="difficulty">Difficulty:</label>
      <input type="number" id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange}></input>


      <label htmlFor="hours">Hours Per Week:</label>
      <select name='hours' id='hours' value={formData.hours} onChange={handleChange}>
        {hourOptions.map((time, index) => (
            <option key = {index} value = {time}>
                {time}
            </option>
        ))}
       </select>
      
      <label htmlFor="comment">Comment:</label>
      <textarea id="comment" name="comment" rows="4" cols="50" value={formData.comment} onChange={handleChange}></textarea>
      
      <input type="submit"></input>
    </form>
  );
}
