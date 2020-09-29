import React, { Component } from 'react';
import LandingPage from './containers/LandingPage.jsx';
import Login from './containers/Login.jsx';
import Dashboard from './containers/Dashboard.jsx';
import Portfolio from './containers/Portfolio.jsx';
import {
  BrowserRouter,
  Switch,
  Route
} from "react-router-dom";
import Signup from './containers/Signup.jsx';

// Create App component
class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <BrowserRouter>
        <Switch>
          <Route path='/login' exact component={Login} />
          <Route path='/signup' exact component={Signup} />
          <Route path='/dashboard' exact component={Dashboard} />
          <Route path='/landingpage' exact component={LandingPage} />
          <Route path='/portfolio' component={Portfolio} />
          <Route path='/' exact component={LandingPage} />
          <Route path='/' render={() => <div>404</div>} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
