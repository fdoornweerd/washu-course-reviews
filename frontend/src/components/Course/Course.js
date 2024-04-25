import React, { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import "./Course.css";

export default function Course(){
    const [course, setCourse] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDetailsShown, setIsDetailsShown ] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState(['','',''])
    const navigate = useNavigate();

    const { department, name } = useParams();
    const colors = ["#D3D3D3","#DD3730","#FF9500","#FFCD00","#9ED10F","#3BA500"];
    const difficultColors= ["#3BA500","#9ED10F","#FFCD00","#FF9500","#DD3730"]; //green, green yellow, yellow, light red, dark red
    const fetchCourse = useCallback(async () => {
        try {
            setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({name: name}),
          });
          const data = await response.json();
          setCourse(data);
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
            setIsLoading(false);
        }
      }, [name]);

      useEffect(() => {
        fetchCourse();
      }, [fetchCourse, name]);
      
      const animatedStyle = {animation: "inAnimation 400ms ease-in"};
      const unanimatedStyle = {
        animation: "outAnimation 400ms ease-out",
        animationFillMode: "forwards"
      };

    const openRateMyProfessor = (fullName) => {
      let nameSearch;
      if(typeof fullName !== 'string'){
        nameSearch = selectedProfessor[1].replace(' ','%20')
      } else{
        nameSearch = fullName.replace(' ','%20');
      }

      window.open(`https://www.ratemyprofessors.com/search/professors/1147?q=${nameSearch}`, '_blank', 'noopener,noreferrer');
    }
    
    const writeReview = (deptNav,nameNav) => {
      navigate(`/${deptNav}/${nameNav}/review`);
    }

    const selectNewProfessor = (event) => {
      const idx = event.target.value;
      let lastName;
      let fullName;
      let semestersTaught;
      if(idx !== 'All Professors'){
        const sortedInstructors = course.instructors.sort((a, b) => a.lastName.localeCompare(b.lastName));
        lastName = sortedInstructors[idx].lastName;
        fullName = sortedInstructors[idx].fullName;
        semestersTaught = sortedInstructors[idx].semestersTaught;
      } else{
        lastName = '';
        fullName = '';
        semestersTaught = '';
      }
      setSelectedProfessor([lastName,fullName,semestersTaught]);

    }

    const handleBack = () => {
      if(sessionStorage.getItem('prevPath') == null){
        navigate(`/${department}`);
      } else{
        navigate(sessionStorage.getItem('prevPath'));
      }

    }

    if (isLoading) {
      return(
        <>
        <div className = "top-bar">
        <div className="btn-container">
        <button className = "back-btn" onClick={handleBack}>Back</button>
        </div> 
        <div className="title-container">
        <h2>{course.name}</h2>
        </div>
      </div>
        <div className ="loadingScreen">
          <ReactLoading type="bars" color="#606E52"
        height={160} width={80} />
        </div>
        </>
      )  
    }


      

    return (
      <div className="course-body">
           <div className = "top-bar">
              <div className="btn-container">
              <button className = "back-btn" onClick={handleBack}>Back</button>
              </div> 
              <div className="title-container">
              <h2>{course.name}</h2>
              <h5>{course.code.map((code, index) => code).join(', ')}</h5>
              </div>
            </div>

        <div className = "detail">
          <button id = "description-btn"onClick={() => {
            setIsAnimated(!isAnimated)
            if (!isDetailsShown) setIsDetailsShown(true); 
          }}>{isDetailsShown === true ? 'Hide Course Description' : 'Show Course Description'}</button>
          {isDetailsShown && <div className="description" style={isAnimated ? animatedStyle : unanimatedStyle} onAnimationEnd={() => { if (!isAnimated) setIsDetailsShown(false) }}>
            <p id = "course-details">{course.courseDetails}</p>
            <div className = "small">
          This course was most recently offered: {course.lastOffered}
        </div>
            </div>}
        </div>



        <div className="content-container">
        <div id = "before-reviews">
        <div className="review-top-bar">
        <div>
          <h3>Reviews For {selectedProfessor[0] === '' ? 'All Professors' : selectedProfessor[0]}</h3>
          </div>
          <div className="content-and-btn">
          <label htmlFor="professor-select">Select Professor:</label>
          <select id = "professor-select" onChange={selectNewProfessor}>
            <option key={-1} value="All Professors">All Professors</option>
            {
              [...course.instructors]
              .sort((a, b) => a.lastName.localeCompare(b.lastName))
              .map((instructor, index) => (
                <option key={index} value={index}>
                  {instructor.lastName}
                </option>
              ))
            }
          </select>
        </div>
        </div>

        </div>
        <div className="review-btn-container">
          <button id = "write-review-btn" onClick={() => writeReview(department, name)}><span>Write a Review</span></button>
        </div>
        </div>

        
        {selectedProfessor[2] !== '' && 
            <p className = "small">Semesters Taught In The Past: {selectedProfessor[2].map((semester, index) => semester).join(', ')}</p>
          }
          <div>
          {selectedProfessor[0] !== '' && <button id='RMP-btn' onClick={openRateMyProfessor}>Search RateMyProfessor</button>}
        </div>
        <div>



          {course.reviews.map((review,index) => (
            (selectedProfessor[0] === '' || review.instructor.includes(selectedProfessor[0])) && ( 
            <div key={index} className = "review">
               <div className = "rating-container">
                  <p className = "rating-label">Quality:</p>
                  <div className = "rating-box" style={{backgroundColor: colors[Math.floor(review.quality)]}}>
                    <p className = "rating-box-num">{review.quality >0 ? review.quality : 'N/A'}</p>
                  </div>
                </div>
                <div className = "rating-container">
                  <p className = "rating-label">Difficulty:</p>
                  <div className = "rating-box" style={{backgroundColor: difficultColors[Math.round(review.difficulty-1)]}}>
                    <p className = "rating-box-num">{review.difficulty >0 ? review.difficulty: 'N/A'}</p>
                  </div>
                </div>
                <div className = "review-stack">
               <div className="professor-and-date">
              <div className = "professor-container">
              <p>{review.instructor.length === 0 ? '' : (review.instructor.length === 1 ? 'Professor:' : 'Professors:')} {review.instructor.map((instructor,index) => (
                  <li key = {index}>{instructor}</li>
              ))}</p>
              </div>

              <div id='hours-container'>
                <p>Hours per week outside of course: {review.hours}</p>
              </div>

              <div id = "date">
                <p>{review.date}</p>
              </div>
              </div>
              <div id = "review-content">
                <p>{review.comment}</p>
              </div>
              </div>
            </div>
            )
          ))}
        </div>




        </div>
    )
}
