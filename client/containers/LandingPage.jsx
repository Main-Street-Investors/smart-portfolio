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
          <Button className="space" variant="outline-info">Google Login</Button>
          <div>
            <Link to="/Login">
          <Button className="space" variant="outline-info">Smart Portfolio Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="space" variant="outline-info">Smart Portfolio Signup</Button>
          </Link>
        </div>
      </div>
    </div>
    )
  }
}

export default LandingPage;
