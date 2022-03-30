import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import { NavBar } from './navbar/navbar.js';
import { LoginPage } from './logins/login.js';
import { RegisterPage } from './logins/register.js';
import { HomePage } from './homepage/homepage.js';
import { QuestionForm } from './createQuestions/createQuestions.js';
import { CreateQuizPage } from './quiz/createQuiz/createQuiz.js';
import { CreateOrPlay } from './quiz/choice.js';
import { JoinForm } from './quiz/joinQuiz/joinQuiz.js';
import { QuizSession } from './quiz/createSession.js';

ReactDOM.render((
  <Router>
    <div>
      <NavBar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/createQuestion' element={<QuestionForm />} />
        <Route path='/createQuiz' element={<CreateQuizPage />} />
        <Route path='/joinQuiz' element={<JoinForm />} />
        <Route path='/choice' element={<CreateOrPlay />} />
        <Route path='/createSession' element={<QuizSession/>} />

      </Routes>
    </div>
  </Router>
),document.getElementById('root'));
