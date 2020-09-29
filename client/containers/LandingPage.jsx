import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

class LandingPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <h1 className="logo">Smart Portfolio</h1>
        <div>
          <Button variant="outline-primary">Google login</Button>
          <div>
            <Link to="/Login">
          <Button variant="outline-primary">Smart Portfolio Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline-primary">Smart Portfolio Signup</Button>
          </Link>
        </div>
      </div>
    </div>
    )
  }
}

export default LandingPage;
