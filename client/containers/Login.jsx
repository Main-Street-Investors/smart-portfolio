import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = { username: '', password: '' };

  }

  handleChange(event) {
    this.setState({ ...this.state, [event.target.name]: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await (
        await fetch('http://localhost:3000/api/regularSignup', {
          method: 'POST',
          body: JSON.stringify({
            username: this.state.username,
            password: this.state.password,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ).json();
      if (!response.err) {
        this.props.history.replace('/Dashboard');
      } else {
        alert(
          'Wrong username or password, please try again or register as a new user',
        );
      }
    } catch (error) {
      console.log('Error in handleSubmit of Login:', error);
    }
  }

  render() {
    return(
      <div>
      <h1 className="logo">Smart Portfolio</h1>
      <div>
      <h3 className="headline">Log in</h3>
      <div>
      Username: <input name="username" value={this.state.username} onChange={this.handlechange} className="usernameinput" type="text"></input>
      {/* Username: <input classname="usernameinput" type="text"></input> */}
      <div>
      Password: <input name="password" value={this.state.password} onChange={this.handleChange} className="passwordinput" type="password"></input>
      {/* Password: <input className="passwordinput" type="password"></input> */}
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

export default Login;
