import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import { NavBar } from './navbar/navbar.js';
import { HomePage } from './homepage/homepage.js';
import { QuestionForm } from './createQuestions/createQuestions.js';
import { CreateQuizPage } from './quiz/createQuiz/createQuiz.js';
import { QuestionPage } from './quiz/playQuiz/playQuiz.js';
import { CreateOrPlay } from './quiz/choice.js';

ReactDOM.render((
  <Router>
    <div>
      <NavBar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/questionPage' element={<QuestionPage />} />
        <Route path='/createQuestion' element={<QuestionForm />} />
        <Route path='/playQuiz' element={<CreateQuizPage />} />
        <Route path='/choice' element={<CreateOrPlay />} />

      </Routes>
    </div>
  </Router>
),document.getElementById('root'));
