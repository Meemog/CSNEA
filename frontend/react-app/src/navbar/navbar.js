import React from 'react';
import { Link } from 'react-router-dom'
import './navbar.css';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.content = (
      <nav class='topnav'>
        <ul>
          <span>
            <Link to="/">Home</Link>
          </span>
          <span>
            <Link to="/questionPage">Play</Link>
          </span>
          <span>
            <Link to="/createQuestion">Create Question</Link>
          </span>
        </ul>
      </nav>
    );
  }

  render() {
    return this.content;
  }
}

export { NavBar };
