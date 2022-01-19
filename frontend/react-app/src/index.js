import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { NavBar } from './navbar/navbar.js';
import { QuestionPage } from './playQuiz/playQuiz.js';
import { HomePage } from './homepage/homepage.js';
import { QuestionForm } from './createQuestions/createQuestions.js';

ReactDOM.render((
  <Router>
    <div>
      <NavBar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/questionPage' element={<QuestionPage />} />
        <Route path='/createQuestion' element={<QuestionForm />} />
      </Routes>
    </div>
  </Router>
),document.getElementById('root'));
