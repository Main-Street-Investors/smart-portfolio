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
import { useLocation } from 'react-router-dom'

function Portfolio() {
  let match = useRouteMatch();
  let location = useLocation();

  
  const [historical, setHistorical] = useState(false);

  const [showNewPortfolio, setNewPortfolio] = useState(false);
  const handleNewPortfolioClose = () => setNewPortfolio(false);

  if (!historical && location.pathname.match(/history/g)) setHistorical(true);

  return (
    <div>
      <div className="topPad"></div>
      <Container fluid={true}>
        <Row style={{height: '90vh'}}>
          <Col lg={2} id="nav">
            <div>
              <Button variant="outline-info" block>Portfolio 1</Button>
              <Button variant="outline-info" block>Portfolio 2</Button>
              <Button variant="outline-info" block onClick={() => {
              setNewPortfolio(true);}}>Create New Portfolio</Button>
            </div>
            <div id="logoutDiv">
              {historical && <Link to={`/Portfolio/${location.pathname.slice(11, 12)}`}>
                <Button variant="outline-info" block onClick={() => {
                  setHistorical(false);
                }}>Back to Manager</Button>
              </Link>}
              <Link to="/Dashboard">
                <Button id="backToDash" variant="outline-info" block>Back to Dashboard</Button>
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
              <Route path={`${match.path}/:portfolioID`} exact>
                <PortfolioManager setHistorical={setHistorical}/>
              </Route>
              <Route path={`${match.path}/:portfolioID/history`}>
                <PortfolioHistory />
              </Route>
            </Switch>
          </Col>
        </Row>
      </Container>
      <Modal centered show={showNewPortfolio} onHide={handleNewPortfolioClose}>
        <Modal.Header closeButton>
          <Modal.Title>New Portfolio</Modal.Title>
        </Modal.Header>
        <Form>
          <Form.Group>
            <Form.Label>Name of Portfolio:</Form.Label>
            <Form.Control type="text" placeholder="Portfolio"/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="outline-info" onClick={handleNewPortfolioClose}>
            Create Portfolio
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function PortfolioManager(props) {
  let { portfolioID } = useParams();
  const [loading, setLoading] = useState(false);
  const [portID, setPortID] = useState(portfolioID);

  const [showRenamePortfolio, setRenamePortfolio] = useState(false);
  const [showNewStock, setNewStock] = useState(false);
  const [showSellStock, setSellStock] = useState(false);
  const [showEditStock, setEditStock] = useState(false);

  const handleRenamePortfolioClose = () => setRenamePortfolio(false);
  const handleNewStockClose = () => setNewStock(false);
  const handleSellStockClose = () => setSellStock(false);
  const handleEditStockClose = () => setEditStock(false);

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
        <div className="tableContainer">
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
                <td>
                  <input type="checkbox" id="checkBox"></input>
                  </td>
                <td>AAPL</td>
                <td>9/29/20</td>
                <td>$63.51</td>
                <td>7</td>
                <td>tech</td>
              </tr>
            </tbody>
          </Table>
        </div>
        <Button className="tableButtons" variant="outline-info" onClick={() => {
          setRenamePortfolio(true);
        }}>Rename this Portfolio</Button>
        <Button className="tableButtons" variant="outline-info" onClick={() => {
          setNewStock(true);
        }}>Add Stock</Button>
        <Button className="tableButtons" variant="outline-info" onClick={() => {
          setSellStock(true);
        }}>Sell Stock</Button>
        <Button className="tableButtons" variant="outline-info" onClick={() => {
          setEditStock(true);
        }}>Edit Stock</Button>
        <Link to={`${portID}/history`}>
          <Button className="tableButtons" variant="outline-info" onClick={() => {
            props.setHistorical(true);
          }}>View History</Button>
        </Link>

      </div>}
      <Modal centered show={showRenamePortfolio} onHide={handleRenamePortfolioClose}>
        <Modal.Header closeButton>
          <Modal.Title>Name your Portfolio</Modal.Title>
        </Modal.Header>
        <Form>
          <Form.Group>
            <Form.Label>Give your portfolio a new name:</Form.Label>
            <Form.Control type="text" placeholder="Portfolio 1"/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="outline-info" onClick={handleRenamePortfolioClose}>
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
          <Button variant="outline-info" onClick={handleNewStockClose}>
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
            <Form.Label>Date Sold:</Form.Label>
            <Form.Control type="date" placeholder="29-09-2020" />
            <Form.Label>Sold Price:</Form.Label>
            <Form.Control type="number" min="1" placeholder="420"/>
            <Form.Label># of Shares:</Form.Label>
            <Form.Control type="number" min="1" placeholder="1"/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="outline-info" onClick={handleSellStockClose}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal centered show={showEditStock} onHide={handleEditStockClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Stock</Modal.Title>
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
          <Button variant="outline-info" onClick={handleEditStockClose}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const PortfolioHistory = () => {
  let { portfolioID } = useParams();
  const [portID, setPortID] = useState(portfolioID);
  const [loading, setLoading] = useState(false);

  return(
    <div>
      <h3>History of {portID}</h3>
      {loading && <div className="mainLoadingContainer">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>}
      {!loading &&
      <div>
        <div className="tableContainer">
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
        </div>
      </div>}
    </div>
  )
}

export default Portfolio;
