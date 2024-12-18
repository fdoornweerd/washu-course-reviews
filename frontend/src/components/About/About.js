import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import emailjs from "emailjs-com";
import "./About.css";


export default function About() {
    const [suggestion, setSuggestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("Submit");

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // prevents from submitting multiple times
        setIsSubmitting(true);
        setSubmitStatus("Submitting...")

    
        const templateParams = {
          comment: suggestion, 
        };
        
        const service_ID = process.env.REACT_APP_EMAIL_JS_SERVICE_ID;
        const template_ID = process.env.REACT_APP_EMAIL_JS_TEMPLATE_ID;
        const user_ID = process.env.REACT_APP_EMAIL_JS_USER_ID;
    
        emailjs
          .send(service_ID, template_ID, templateParams, user_ID)
          .then((response) => {
            //Alter the submit button so it goes from submitting... to submited and wait for one second
            setSubmitStatus("Submitted")

            // wait so it shows to the user
            setTimeout(() => {
              setSuggestion(""); // Clear the textarea after submission
              setSubmitStatus("Submit");
              setIsSubmitting(false);
              navigate('/');
            }, 1000);

            
          })
          .catch((err) => {
            console.error("FAILED...", err);
            alert("Failed to send suggestion. Please wait or try again another time. sorry :(");
          });
      };

  return (
    <div>
        <div className="btn-container">
            <button className = "back-btn" onClick={() => {
                navigate(`/`);
            }}>Back</button>
        </div> 

        <form class='container' onSubmit={handleSubmit}>
            <div><strong>About & Improve</strong></div>

            <br></br>

            <div>
            Hey, my name is Finn Doornweerd and I created and maintain this website which is used for helping WashU students 
            find courses and review the courses they have taken. You can filter courses based on quality, difficulty, 
            and attributes, as well as search for courses based on professor, code, name, and keywords of things you may 
            be interested in. When looking at reviews, you can filter by professor and view their Rate My Professor page.
             <br></br>
             <br></br>
            If there are any ways that the website could be improved or ideas about features that would be helpful please submit 
            a comment below and I'll read it and see if I can implement it!

            </div>

            <br></br>

            <textarea
                className="textarea"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
            />

            <button className='submit-btn' disabled={isSubmitting}>
                {submitStatus}
            </button>
        </form>

    </div>
  );
}
