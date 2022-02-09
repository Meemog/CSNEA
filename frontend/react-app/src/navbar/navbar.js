import React from 'react';
import { Link } from 'react-router-dom'

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.content = (
      <nav className="topnav">
        <ul>
          <span>
            <Link to="/">Home</Link>
          </span>
          <span>
            <Link to="/choice">Play</Link>
          </span>
          <span>
            <Link to="/createQuestion">Create Question</Link>
          </span>
          <span>
            <Link to="/login">Login</Link>
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
