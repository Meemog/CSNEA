import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import { NavBar } from './navbar/navbar.js';
import { HomePage } from './homepage/homepage.js';
import { QuestionForm } from './createQuestions/createQuestions.js';
import { CreateQuizPage } from './quiz/createQuiz/createQuiz.js';
import { CreateOrPlay } from './quiz/choice.js';
import { JoinPage } from './quiz/joinQuiz/joinQuiz.js';

ReactDOM.render((
  <Router>
    <div>
      <NavBar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/createQuestion' element={<QuestionForm />} />
        <Route path='/createQuiz' element={<CreateQuizPage />} />
        <Route path='/joinQuiz' element={<JoinPage />} />
        <Route path='/choice' element={<CreateOrPlay />} />

      </Routes>
    </div>
  </Router>
),document.getElementById('root'));
