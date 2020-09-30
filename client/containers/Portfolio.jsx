import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Switch,
  useRouteMatch,
  useParams,
  Route
} from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function Portfolio() {
  let match = useRouteMatch();

  return (
    <div>
      <div className="topPad"></div>
      <Container fluid={true}>
        <Row>
          <Col lg={2} id="nav">
            <div>
              <Button variant="outline-info" block>Portfolio 1</Button>
              <Button variant="outline-info" block>Portfolio 2</Button>
              <Button variant="outline-info" block>Create New Portfolio</Button>
            </div>
            <div id="logoutDiv">
              <Link to="/Dashboard">
                <Button variant="outline-info" block>Back to Dashboard</Button>
              </Link>
              <Link to="/">
                <Button id="logoutBtn" variant="outline-secondary" block>
                  Logout
                </Button>
              </Link>
            </div>
          </Col>
          <Col>
            <Switch>
              <Route path={`${match.path}/:portfolioID`}>
                <PortfolioManager />
              </Route>
              <Route path={`${match.path}/:portfolioID/history`}>
                <h3>Viewing History</h3>
              </Route>
            </Switch>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function PortfolioManager() {
  let match = useRouteMatch();
  let { portfolioID } = useParams();
  const [loading, setLoading] = useState(false);
  const [portID, setPortID] = useState(portfolioID);

  const [showNewPortfolio, setShowNewPortfolio] = useState(false);
  const [showNewStock, setNewStock] = useState(false);
  const [showSellStock, setSellStock] = useState(false);


  const handleNewPortfolioClose = () => setShowNewPortfolio(false);
  const handleNewStockClose = () => setNewStock(false);
  const handleSellStockClose = () => setSellStock(false);

  return (
    <div>
      <h3>Holdings of {portID}</h3>
      {loading && <div className="mainLoadingContainer">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>}
      {!loading &&
      <div>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Select</th>
            <th>Ticker Name</th>
            <th>Date Purchased</th>
            <th>Purchase Price</th>
            <th>Number of Shares</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td>AAPL</td>
            <td>9/29/20</td>
            <td>$63.51</td>
            <td>7</td>
            <td>tech</td>
          </tr>
        </tbody>
      </Table>
      <Button className="tableButtons" variant="outline-info" onClick={() => {
        setShowNewPortfolio(true);
      }}>Rename this Portfolio</Button>
      <Button className="tableButtons" variant="outline-info" onClick={() => {
        setNewStock(true);
      }}>Add Stock</Button>
      <Button className="tableButtons" variant="outline-info" onClick={() => {
        setSellStock(true);
      }}>Sell Stock</Button>
      <Link to={`${portID}/history`}><Button className="tableButtons" variant="outline-info">View History</Button></Link>

      </div>}
      <Modal centered show={showNewPortfolio} onHide={handleNewPortfolioClose}>
        <Modal.Header closeButton>
          <Modal.Title>Name your Portfolio</Modal.Title>
        </Modal.Header>
        <Form>
          <Form.Group>
            <Form.Label>Give your new portfolio a new name:</Form.Label>
            <Form.Control type="text" placeholder="Portfolio 1"/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="primary" onClick={handleNewPortfolioClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal centered show={showNewStock} onHide={handleNewStockClose}>
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
          <Button variant="primary" onClick={handleNewStockClose}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal centered show={showSellStock} onHide={handleSellStockClose}>
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
          <Button variant="primary" onClick={handleSellStockClose}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Portfolio;
