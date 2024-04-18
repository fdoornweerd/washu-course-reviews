import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import ReactLoading from "react-loading";


export default function WriteReview(){

    let loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
    
      let prof = document.getElementById("prof");
      let quality = document.getElementById("quality");
      let difficulty = document.getElementById("difficulty");
      let comment = document.getElementById("comment");
        prof.value = "";
        quality.value = "";
        difficulty.value = "";
        comment.value = "";
    });

    return(
    <form id = "loginForm">
        <label for="prof">Professor:</label>
        <input type="text" id="prof" name="prof"></input>
        <label for="quality">Quality:</label>
        <input type="number" id="quality" name="quality"></input>
        <label for="difficulty">Difficulty:</label>
        <input type="number" id="difficulty" name="difficulty"></input>
        <label for="comment">Comments:</label>
        <textarea id="comment" name = "comment" rows ="4" cols ="50"></textarea>
        <input type = "submit"></input>
    </form>
    )
}