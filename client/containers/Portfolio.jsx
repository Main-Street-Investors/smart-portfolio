import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Switch,
  useRouteMatch,
  useParams,
  Route
} from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function Portfolio() {
  let match = useRouteMatch();

  const [showNewPortfolio, setShowNewPortfolio] = useState(false);
  const [showNewStock, setNewStock] = useState(false);
  const [showSellStock, setSellStock] = useState(false);


  const handleClose = () => setShowNewPortfolio(false);
  const handleClose2 = () => setNewStock(false);
  const handleClose3 = () => setSellStock(false);

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
      <div>

      <Button>Portfolio 1</Button>
      <Button>Portfolio 2</Button>

      <Button>Create new Portfolio</Button>


      <Button><Link to="/Dashboard">Back to Dashboard</Link></Button>
      <Button><Link to="/LandingPage">Logout</Link></Button>


      <Button onClick={() => {
        setShowNewPortfolio(true);
      }}>Rename this Portfolio</Button>
      <Modal show={showNewPortfolio} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Name your Portfolio</Modal.Title>
        </Modal.Header>
        <Form>
          <Form.Group>
            <Form.Label>Give your new portfolio a new name:</Form.Label>
            <Form.Control type="text" placeholder="Portfolio 1" />
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Button onClick={() => {
        setNewStock(true);
      }}>Add Stock</Button>
      <Modal show={showNewStock} onHide={handleClose2}>
      <Modal.Header closeButton>
          <Modal.Title>New Stock</Modal.Title>
        </Modal.Header>
        <Form>
          <Form.Group>
            <Form.Label>Ticker Name:</Form.Label>
            <Form.Control type="text" placeholder="TSLA" />
            <Form.Label>Date Purchased:</Form.Label>
            <Form.Control type="date" placeholder="29-09-2020" />
            <Form.Label>Price Purchased:</Form.Label>
            <Form.Control type="number" min="1" placeholder="420"/>
            <Form.Label># of Shares:</Form.Label>
            <Form.Control type="number" min="1" placeholder="1"/>
            <Form.Label>Tags:</Form.Label>
            <Form.Control type="text" placeholder="tech"/>
          </Form.Group>
        </Form> 
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose2}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Button onClick={() => {
        setSellStock(true);
      }}>Sell Stock</Button>
      <Modal show={showSellStock} onHide={handleClose3}>
      <Modal.Header closeButton>
          <Modal.Title>Sell Stock</Modal.Title>
        </Modal.Header>
        <Form>
          <Form.Group>
            <Form.Label>Ticker Name:</Form.Label>
            <Form.Control type="text" placeholder="TSLA" />
            <Form.Label>Date Purchased:</Form.Label>
            <Form.Control type="date" placeholder="29-09-2020" />
            <Form.Label>Price Purchased:</Form.Label>
            <Form.Control type="number" min="1" placeholder="420"/>
            <Form.Label># of Shares:</Form.Label>
            <Form.Control type="number" min="1" placeholder="1"/>
          </Form.Group>
        </Form> 
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose3}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Button>View History</Button>

      </div>
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
