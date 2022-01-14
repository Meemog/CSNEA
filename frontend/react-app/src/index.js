import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import { QuestionPage } from './quiz/questions.js'
import { HomePage } from './homepage/homepage.js'
import { QuestionForm } from './createQuestions/createQuestions.js'

ReactDOM.render((
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/questionPage">Play</Link>
          </li>
          <li>
            <Link to="/createQuestion">Create Question</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/questionPage' element={<QuestionPage />} />
        <Route path='/createQuestion' element={<QuestionForm />} />
      </Routes>
    </div>
  </Router>
),document.getElementById('root'));
