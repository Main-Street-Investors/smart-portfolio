import React, { Component, useState, useEffect } from 'react';
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

  const [loading, setLoading] = useState(true);

  const data = JSON.parse(window.localStorage.getItem('spData'));

  const buttons = data.chartData.reduce((acc, cv, i) => {
    // Skip the first, since it's the consolidated data
    if (i === 0) return acc;

    let portfolioID = 0;

    for (let i = 0; i < data.currentShares.length; i++) {
      if (data.currentShares[i].name === cv.portfolioName) {
        portfolioID = data.currentShares[i].portfolio_id;
        break;
      }
    }

    // Create a button that links to a different management chart
    acc.push(<Link key={`portfolioBtn${i}`} to={`/Portfolio/${portfolioID}`}>
      <Button className={acc.length === 0 ? '' : 'manageNav'} variant="outline-info" block onClick={() => {
        setHistorical(false);
      }}>{cv.portfolioName}</Button>
    </Link>);
    return acc;
  }, []);

  useEffect(() => {
    console.log(data);

    if (window.location.pathname === match.path) {
      window.location.href = `${match.url}/${data.currentShares[1].portfolio_id}`;
    }

    setLoading(false);
  }, [])




  return (
    <div>
      {loading && <div className="mainLoadingContainer">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>}
      {!loading && <div>
        <div className="topPad"></div>
        <Container fluid={true}>
          <Row style={{height: '90vh'}}>
            <Col lg={2} id="nav">
              <div>
                {buttons}
                <Button className="manageNav" variant="outline-info" block onClick={() => {
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
                  <PortfolioManager setHistorical={setHistorical} data={data}/>
                </Route>
                <Route path={`${match.path}/:portfolioID/history`}>
                  <PortfolioHistory data={data}/>
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
      </div>}
    </div>
  );
}

function PortfolioManager(props) {
  let { portfolioID } = useParams();
  const [portID, setPortID] = useState(portfolioID);
  const [portName, setPortName] = useState('');

  const [currentShareID, setCurrentShareID] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedNumberShares, setSelectedNumberShares] = useState(null);
  const [selectedTags, setSelectedTags] = useState(null);

  const [showRenamePortfolio, setRenamePortfolio] = useState(false);
  const [showNewStock, setNewStock] = useState(false);
  const [showSellStock, setSellStock] = useState(false);
  const [showEditStock, setEditStock] = useState(false);

  const handleRenamePortfolioClose = () => setRenamePortfolio(false);
  const handleNewStockClose = () => setNewStock(false);
  const handleSellStockClose = () => setSellStock(false);
  const handleEditStockClose = () => setEditStock(false);

  const onInput = e => {
    setCurrentShareID(e.target.value);
  }

  useEffect(() => {
    for (let i = 0; i < props.data.currentShares.length; i++) {
      if (props.data.currentShares[i]._id === Number(currentShareID)) {
        setSelectedTicker(props.data.currentShares[i].ticker_name);
        setSelectedDate(props.data.currentShares[i].date_purchased);
        setSelectedPrice(props.data.currentShares[i].price);
        setSelectedNumberShares(props.data.currentShares[i].number_shares);
        break;
      }
    }
  }, [currentShareID])

  const rows = [];

  for (let i = 0; i < props.data.currentShares.length; i++) {
    if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
      let sharesLeft = props.data.currentShares[i].number_shares;
      for (let j = 0; j < props.data.soldShares.length; j++) {
        if (props.data.currentShares[i]._id === props.data.soldShares[j].share_id) {
          sharesLeft -= props.data.soldShares[j].number_shares;
        }
      }
      if (sharesLeft > 0) {
        rows.push(<tr key={`row${i}`}>
          <td>
            <input
              type='radio'
              name='stockChoice'
              value={props.data.currentShares[i]._id}
              onChange={onInput}
            />
          </td>
          <td>{props.data.currentShares[i].ticker_name}</td>
          <td>{props.data.currentShares[i].date_purchased}</td>
          <td>${props.data.currentShares[i].price}</td>
          <td>{sharesLeft}</td>
        </tr>)
      }
    }
  }

  useEffect(() => {
    for (let i = 0; i < props.data.currentShares.length; i++) {
      if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
        setPortName(props.data.currentShares[i].name);
        break;
      }
    }
  }, [portfolioID])



  return (
    <div>
      <h3>Holdings of {portName}</h3>
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
              {rows}
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

      </div>
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
            <Form.Control type="text" placeholder={selectedTicker} />
            <Form.Label>Date Purchased:</Form.Label>
            <Form.Control type="date" placeholder={selectedDate} />
            <Form.Label>Price Purchased:</Form.Label>
            <Form.Control type="number" min="1" placeholder={selectedPrice}/>
            <Form.Label># of Shares:</Form.Label>
            <Form.Control type="number" min="1" placeholder={selectedNumberShares}/>
            <Form.Label>Tags:</Form.Label>
            <Form.Control type="text" placeholder={selectedTags}/>
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

const PortfolioHistory = (props) => {
  let { portfolioID } = useParams();
  const [portID, setPortID] = useState(portfolioID);
  const [portName, setPortName] = useState('');
  const [currentShareID, setCurrentShareID] = useState(null);

  const onInput = e => {
    setCurrentShareID(e.target.value);
  }

  const rows = [];

  for (let i = 0; i < props.data.currentShares.length; i++) {
    if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
      rows.push(<tr key={`row${i}`}>
        <td>{props.data.currentShares[i].ticker_name}</td>
        <td>{props.data.currentShares[i].date_purchased}</td>
        <td>${props.data.currentShares[i].price}</td>
        <td>{props.data.currentShares[i].number_shares}</td>
      </tr>)
    }
  }
  for (let i = 0; i < props.data.soldShares.length; i++) {
    if (props.data.soldShares[i].portfolio_id === Number(portfolioID)) {
      rows.push(<tr key={`row${i}`}>
        <td>{props.data.soldShares[i].ticker_name}</td>
        <td></td>
        <td></td>
        <td>{props.data.soldShares[i].number_shares}</td>
        <td>{props.data.soldShares[i].date_sold}</td>
        <td>${props.data.soldShares[i].sell_price}</td>
        <td></td>
      </tr>)
    }
  }

  useEffect(() => {
    for (let i = 0; i < props.data.currentShares.length; i++) {
      if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
        setPortName(props.data.currentShares[i].name);
        break;
      }
    }
  }, [portfolioID])

  return(
    <div>
      <h3>History of {portName}</h3>
        <div className="tableContainer">
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Ticker Name</th>
                <th>Date Purchased</th>
                <th>Purchase Price</th>
                <th>Number of Shares</th>
                <th>Date Sold</th>
                <th>Sell Price</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </div>
    </div>
  )
}

export default Portfolio;
