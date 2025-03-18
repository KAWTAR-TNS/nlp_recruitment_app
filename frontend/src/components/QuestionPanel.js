import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Questions() {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/questions');
                setQuestions(response.data.questions);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchQuestions();
    }, []);

    return (
        <div>
            <h1>Questions</h1>
            {questions.map((question, index) => (
                <p key={index}>{question}</p>
            ))}
        </div>
    );
}

export default Questions;
