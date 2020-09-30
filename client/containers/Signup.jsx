import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class Signup extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return(
      <div>
      <h1 className="logo">Smart Portfolio</h1>
      <div>
      <h3 className="headline">Sign up</h3>
      <div>
      Username: <input className="usernameinput" type="text"></input>
      <div>
      Password: <input className="passwordinput" type="password"></input>
      <div>
      <Button variant="outline-info">Submit</Button>
                   </div>
              </div>
           </div>
      </div>
  </div>
    )
  }
}

export default Signup;
