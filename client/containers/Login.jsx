import React, { Component } from 'react';

class Login extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
      <h1 className="logo">Smart Portfolio</h1>
      <div>
      <h3 className="headline">Log in</h3>
      <div>
      Username: <input type="text"></input>
      <div>
      Password: <input type="password"></input>
      <div>
      <button type="submit">Submit</button>
                   </div>
              </div>
           </div>
      </div>
  </div>
    )
  }
}

export default Login;
