import React, { Component } from 'react';

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
      <button type="button">Smart Portfolio Login</button>
        <button type="button">Smart Portfolio Signup</button>
        </div>
      </div>
    </div>
    )
  }
}

export default LandingPage;
