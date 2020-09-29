import React, { Component } from 'react';
import {
  Switch,
  useRouteMatch,
  useParams,
  Route
} from "react-router-dom";


function Portfolio() {
  let match = useRouteMatch();

  return (
    <div>
      <h1>Portfolio Page</h1>
      <Switch>
        <Route path={`${match.path}/:portfolioID`}>
          <Placeholder />
        </Route>
        <Route path={match.path}>
          <h3>Please select a portfolio.</h3>
        </Route>
      </Switch>
    </div>
  );
}

function Placeholder() {
  let { portfolioID } = useParams();

  return (
    <div>Examining portfolio {portfolioID}</div>
  );
}

export default Portfolio;
