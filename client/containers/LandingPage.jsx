import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class LandingPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <h1 className="logo">Smart Portfolio</h1>
      <div>
      <button type="button">Google login</button>
      <div>
        <Link to="/Login">
      <button type="button">Smart Portfolio Login</button>
      </Link>
      <Link to="/signup">
        <button type="button">Smart Portfolio Signup</button>
        </Link>
        </div>
      </div>
    </div>
    )
  }
}

export default LandingPage;
