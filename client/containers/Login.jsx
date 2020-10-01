import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameInput: '',
      passwordInput: ''
    }
  }

  render() {
    return(
      <div>
        <h1 className="logo">Smart Portfolio</h1>
          <div>
            <h3 className="headline">Log in</h3>
            <div>
              Username: <input className="usernameinput" onChange={(e) => {
                this.setState({
                  ...this.state,
                  usernameInput: e.target.value
                });
              }}></input>
              <div>
                Password: <input className="passwordinput" type="password" onChange={(e) => {
                  this.setState({
                    ...this.state,
                    passwordInput: e.target.value
                  });
                }}></input>
                <div>
                  <Button variant="outline-info" onClick={() => {
                    fetch('/api/regularLogin', {
                      method: 'POST',
                      body: JSON.stringify({
                        "username": this.state.usernameInput,
                        "password": this.state.passwordInput,
                      }),
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    })
                    .then(resp => {
                      window.location.href = resp.url;
                    })
                  }}>Submit</Button>
                </div>
              </div>
           </div>
        </div>
      </div>
    )
  }
}

export default Login;
