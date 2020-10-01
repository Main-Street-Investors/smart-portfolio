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
  const [newPortName, setNewPortName] = useState('');

  const handleNewPortfolioClose = () => setNewPortfolio(false);

  if (!historical && location.pathname.match(/history/g)) setHistorical(true);

  const [loading, setLoading] = useState(true);

  const data = JSON.parse(window.localStorage.getItem('spData'));

  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    console.log(data);

    if (window.location.pathname === match.path) {
      window.location.href = `${match.url}/${data.chartData[1].portfolio.slice(9)}`;
    }

    let tempPorts = window.localStorage.getItem('spTempPorts');
    if (!tempPorts) {
      tempPorts = [];
    } else {
      tempPorts = JSON.parse(tempPorts);
    }

    setButtons(tempPorts.map(cv => {
      return ({
        portfolioID: cv.portfolioID,
        portfolioName: cv.portfolioName
      })
    }).concat(data.chartData.reduce((acc, cv, i) => {
      // Skip the first, since it's the consolidated data
      if (i === 0) return acc;

      let portfolioID = 0;

      for (let i = 0; i < data.currentShares.length; i++) {
        if (data.currentShares[i].name === cv.portfolioName) {
          portfolioID = data.currentShares[i].portfolio_id;
          break;
        }
      }

      if (tempPorts.filter((cv) => {
        if (cv.portfolioID === portfolioID) return true;
      })[0]) return acc;

      // Create a button that links to a different management chart
      acc.push({
        portfolioID,
        portfolioName: cv.portfolioName
      });
      return acc;
    }, [])));

    setLoading(false);
  }, []);




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
                {buttons.map((cv, i) => {
                  return (<Link key={`portfolioBtn${i}`} to={`/Portfolio/${cv.portfolioID}`}>
                    <Button className='manageNav' variant="outline-info" block onClick={() => {
                      setHistorical(false);
                    }}>{cv.portfolioName}</Button>
                  </Link>)
                })}
                <Button className="manageNav" variant="outline-info" block onClick={() => {
                  setNewPortfolio(true);
                }}>Create New Portfolio</Button>
              </div>
              <div id="logoutDiv">
                {historical && <Link to={`/Portfolio/${location.pathname.slice(11, location.pathname.length - 8)}`}>
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
                  <PortfolioManager buttons={buttons} setButtons={setButtons} setHistorical={setHistorical} data={data}/>
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
              <Form.Label>Name your Portfolio:</Form.Label>
              <Form.Control onChange={(e) => {
                setNewPortName(e.target.value);
              }} type="text" placeholder="Blue Chip Portfolio"/>
            </Form.Group>
          </Form>
          <Modal.Footer>
            <Button variant="outline-info" onClick={() => {
              fetch('/api/newPortfolio', {
                method: 'POST',
                body: JSON.stringify({ name: `${newPortName}` }),
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .then(resp => resp.json())
              .then(newRow => {
                console.log(newRow)
                setButtons([...buttons, newRow]);
                window.localStorage.setItem('spRefresh', 'true');
                let tempPorts = window.localStorage.getItem('spTempPorts');
                if (tempPorts) tempPorts = JSON.parse(tempPorts);
                window.localStorage.removeItem('spTempPorts');
                if (tempPorts) {
                  tempPorts.push(newRow);
                  window.localStorage.setItem('spTempPorts', JSON.stringify(tempPorts));
                } else {
                  window.localStorage.setItem('spTempPorts', JSON.stringify([newRow]));
                }
                setNewPortName('');
                handleNewPortfolioClose();
              })
            }}>
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

  const [tempTicker, setTempTicker] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempPrice, setTempPrice] = useState(0);
  const [tempNumberShares, setTempNumberShares] = useState(0);
  const [tempTags, setTempTags] = useState(null);

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
    let spTempRows = window.localStorage.getItem('spTempRows');
    let found = false;

    if (spTempRows) {
      spTempRows = JSON.parse(spTempRows);
      for (let i = 0; i < spTempRows.length; i++) {
        if (spTempRows[i]._id === Number(currentShareID)) {
          setSelectedTicker(spTempRows[i].ticker_name);
          setSelectedDate(spTempRows[i].date_purchased);
          setSelectedPrice(spTempRows[i].price);
          setSelectedNumberShares(spTempRows[i].number_shares);
          break;
        }
      }
    };

    if (!found) {
      for (let i = 0; i < props.data.currentShares.length; i++) {
        if (props.data.currentShares[i]._id === Number(currentShareID)) {
          setSelectedTicker(props.data.currentShares[i].ticker_name);
          setSelectedDate(props.data.currentShares[i].date_purchased);
          setSelectedPrice(props.data.currentShares[i].price);
          setSelectedNumberShares(props.data.currentShares[i].number_shares);
          break;
        }
      }
    }
  }, [currentShareID])

  const [rows, setRows] = useState([]);

  // Finds name of portfolio
  useEffect(() => {
    let tempPorts = window.localStorage.getItem('spTempPorts');
    if (tempPorts) {
      tempPorts = JSON.parse(tempPorts);
      let found = false;
      for (let i = 0; i < tempPorts.length; i++) {
        if (tempPorts[i].portfolioID === Number(portfolioID)) {
          setPortName(tempPorts[i].portfolioName);
          found = true;
          break;
        }
      }
      if (!found) {
        for (let i = 0; i < props.data.currentShares.length; i++) {
          if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
            setPortName(props.data.currentShares[i].name);
            break;
          }
        }
      }
    } else {
      for (let i = 0; i < props.data.currentShares.length; i++) {
        if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
          setPortName(props.data.currentShares[i].name);
          break;
        }
      }
    }
    const tempRows = [];

    let spTempRows = window.localStorage.getItem('spTempRows');

    const shareIds = {};

    if (spTempRows) {
      spTempRows = JSON.parse(spTempRows);
      for (let i = 0; i < spTempRows.length; i++) {
        if (spTempRows[i].portfolio_id === Number(portfolioID)) {
          shareIds[spTempRows[i]._id] = true;
          let sharesLeft = spTempRows[i].number_shares;

          // Check spTempSoldRows for data

          let spTempSoldRows = window.localStorage.getItem('spTempSoldRows');

          const soldShareIds = {};

          if (spTempSoldRows) {
            spTempSoldRows = JSON.parse(spTempSoldRows);
            for (let j = 0; j < spTempSoldRows.length; j++) {
              if (spTempRows[i]._id === spTempSoldRows[j].shares_id) {
                soldShareIds[spTempSoldRows._id] = true;
                sharesLeft -= spTempSoldRows[j].number_shares;
              }
            }
          };

          for (let j = 0; j < props.data.soldShares.length; j++) {
            if (soldShareIds[props.data.soldShares[j].shares_id]) continue;
            if (spTempRows[i]._id === props.data.soldShares[j].shares_id) {
              sharesLeft -= props.data.soldShares[j].number_shares;
            }
          }
          if (sharesLeft > 0) {
            tempRows.push({
              _id: spTempRows[i]._id,
              ticker_name: spTempRows[i].ticker_name,
              date_purchased: spTempRows[i].date_purchased,
              price: spTempRows[i].price,
              number_shares: sharesLeft,
            })
          }
        }
      }
    };



    for (let i = 0; i < props.data.currentShares.length; i++) {
      if (shareIds[props.data.currentShares[i]._id]) continue;
      if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
        let sharesLeft = props.data.currentShares[i].number_shares;

        // Check spTempSoldRows for data

        let spTempSoldRows = window.localStorage.getItem('spTempSoldRows');

        const soldShareIds = {};

        if (spTempSoldRows) {
          spTempSoldRows = JSON.parse(spTempSoldRows);
          for (let j = 0; j < spTempSoldRows.length; j++) {
            if (props.data.currentShares[i]._id === spTempSoldRows[j].shares_id) {
              soldShareIds[spTempSoldRows._id] = true;
              sharesLeft -= spTempSoldRows[j].number_shares;
            }
          }
        };


        for (let j = 0; j < props.data.soldShares.length; j++) {
          if (soldShareIds[props.data.soldShares[j].shares_id]) continue;
          if (props.data.currentShares[i]._id === props.data.soldShares[j].shares_id) {
            sharesLeft -= props.data.soldShares[j].number_shares;
          }
        }
        if (sharesLeft > 0) {
          tempRows.push({
            _id: props.data.currentShares[i]._id,
            ticker_name: props.data.currentShares[i].ticker_name,
            date_purchased: props.data.currentShares[i].date_purchased,
            price: props.data.currentShares[i].price,
            number_shares: sharesLeft,
          })
        }
      }
    }

    setRows(tempRows);
  }, [portfolioID])

  const [newPortName, setNewPortName] = useState('');


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
              {rows.map((cv, i) => {
                return(<tr key={`row${i}`}>
                  <td>
                    <input
                      type='radio'
                      name='stockChoice'
                      value={cv._id}
                      onChange={onInput}
                    />
                  </td>
                  <td>{cv.ticker_name}</td>
                  <td>{cv.date_purchased}</td>
                  <td>${cv.price}</td>
                  <td>{cv.number_shares}</td>
                </tr>)
              })}
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
        <Link to={`${portfolioID}/history`}>
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
            <Form.Control type="text" placeholder={portName} onChange={e => {
              setNewPortName(e.target.value);
            }}/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="outline-info" onClick={() => {
            fetch('/api/updatePortfolio', {
              method: 'POST',
              body: JSON.stringify({
                id: portfolioID,
                name: newPortName
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(resp => resp.json())
            .then(newRow => {
              console.log(newRow);
              window.localStorage.setItem('spRefresh', 'true');
              let tempPorts = window.localStorage.getItem('spTempPorts');
              if (tempPorts) tempPorts = JSON.parse(tempPorts);
              window.localStorage.removeItem('spTempPorts');
              if (tempPorts) {
                tempPorts.push(newRow);
                window.localStorage.setItem('spTempPorts', JSON.stringify(tempPorts));
              } else {
                window.localStorage.setItem('spTempPorts', JSON.stringify([newRow]));
              }
              setPortName(newRow.portfolioName);
              let buttons = props.buttons;
              let replacedRow = 0;
              for (let i = 0; i < buttons.length; i++) {
                if (buttons[i].portfolioID === portfolioID) {
                  replacedRow = i;
                  break;
                }
              };
              const tempButtons = Array.from(buttons);
              tempButtons[replacedRow] = newRow;
              props.setButtons(tempButtons);
              setNewPortName('');
              handleRenamePortfolioClose();
            });
          }}>
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
            <Form.Control type="text" placeholder="TSLA" onChange={e => {
              setTempTicker(e.target.value);
            }}/>
            <Form.Label>Date Purchased:</Form.Label>
            <Form.Control type="date" placeholder="29-09-2020" onChange={e => {
              setTempDate(e.target.value);
            }}/>
            <Form.Label>Price Purchased:</Form.Label>
            <Form.Control type="number" min="1" placeholder="420" onChange={e => {
              setTempPrice(e.target.value);
            }}/>
            <Form.Label># of Shares:</Form.Label>
            <Form.Control type="number" min="1" placeholder="1" onChange={e => {
              setTempNumberShares(e.target.value);
            }}/>
            <Form.Label>Tags:</Form.Label>
            <Form.Control type="text" placeholder="tech" onChange={e => {
              setTempTags(e.target.value);
            }}/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="outline-info" onClick={() => {
            fetch('/api/addShare', {
              method: 'POST',
              body: JSON.stringify({
                portfolio_id: portfolioID,
                ticker_name: tempTicker,
                date_purchased: tempDate,
                price: tempPrice,
                number_shares: tempNumberShares
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(resp => resp.json())
            .then(newRow => {
              setRows([newRow, ...rows]);
              window.localStorage.setItem('spRefresh', 'true');
              let tempRows = window.localStorage.getItem('spTempRows');
              if (tempRows) tempRows = JSON.parse(tempRows);
              window.localStorage.removeItem('spTempRows');
              if (tempRows) {
                tempRows.push(newRow);
                window.localStorage.setItem('spTempRows', JSON.stringify(tempRows));
              } else {
                window.localStorage.setItem('spTempRows', JSON.stringify([newRow]));
              }
              setTempTicker('');
              setTempDate('');
              setTempPrice(0);
              setTempNumberShares(0);
              setTempTags(null);
              handleNewStockClose();
            })
          }}>
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
            <Form.Control type="date" placeholder={selectedDate} onChange={e => {
              setTempDate(e.target.value);
            }}/>
            <Form.Label>Sell Price:</Form.Label>
            <Form.Control type="number" min="1" placeholder={selectedPrice} onChange={e => {
              setTempPrice(e.target.value);
            }}/>
            <Form.Label># of Shares:</Form.Label>
            <Form.Control type="number" min="1" placeholder={selectedNumberShares} onChange={e => {
              setTempNumberShares(e.target.value);
            }}/>
          </Form.Group>
        </Form>
        <Modal.Footer>
          <Button variant="outline-info" onClick={() => {
            fetch('/api/addSoldShares', {
              method: 'POST',
              body: JSON.stringify({
                portfolio_id: portfolioID,
                shares_id: currentShareID,
                date_sold: tempDate,
                sell_price: tempPrice,
                number_shares: tempNumberShares
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(resp => resp.json())
            .then(newRow => {
              const temporaryRows = Array.from(rows);
              let spot = 0;
              for (let i = 0; i < temporaryRows.length; i++) {
                if (temporaryRows[i]._id === newRow.shares_id) {
                  spot = i;
                  break;
                }
              }
              temporaryRows[spot].number_shares -= newRow.number_shares;
              if (temporaryRows[spot].number_shares <= 0) {
                temporaryRows.splice(spot, 1);
              }
              setRows(temporaryRows);
              window.localStorage.setItem('spRefresh', 'true');
              let tempSoldRows = window.localStorage.getItem('spTempSoldRows');
              if (tempSoldRows) tempSoldRows = JSON.parse(tempSoldRows);
              window.localStorage.removeItem('spTempSoldRows');
              if (tempSoldRows) {
                tempSoldRows.push({...newRow, ticker_name: selectedTicker});
                window.localStorage.setItem('spTempSoldRows', JSON.stringify(tempSoldRows));
              } else {
                window.localStorage.setItem('spTempSoldRows', JSON.stringify([{...newRow, ticker_name: selectedTicker}]));
              }
              setTempDate('');
              setTempPrice(0);
              setTempNumberShares(0);
              handleSellStockClose();
            })
          }}>
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

  let spTempRows = window.localStorage.getItem('spTempRows');

  const shareIds = {};

  if (spTempRows) {
    spTempRows = JSON.parse(spTempRows);
    for (let i = 0; i < spTempRows.length; i++) {
      if (spTempRows[i].portfolio_id === Number(portfolioID)) {
        shareIds[spTempRows[i]._id] = true;
        rows.push(<tr key={`row${i}`}>
          <td>{spTempRows[i].ticker_name}</td>
          <td>{spTempRows[i].date_purchased}</td>
          <td>${spTempRows[i].price}</td>
          <td>{spTempRows[i].number_shares}</td>
        </tr>)
      }
    }
  };

  for (let i = 0; i < props.data.currentShares.length; i++) {
    if (shareIds[props.data.currentShares[i]._id]) continue;
    if (props.data.currentShares[i].portfolio_id === Number(portfolioID)) {
      rows.push(<tr key={`row${i}`}>
        <td>{props.data.currentShares[i].ticker_name}</td>
        <td>{props.data.currentShares[i].date_purchased}</td>
        <td>${props.data.currentShares[i].price}</td>
        <td>{props.data.currentShares[i].number_shares}</td>
      </tr>)
    }
  }

  let spTempSoldRows = window.localStorage.getItem('spTempSoldRows');

  const soldShareIds = {};

  if (spTempSoldRows) {
    spTempSoldRows = JSON.parse(spTempSoldRows);
    for (let i = 0; i < spTempSoldRows.length; i++) {
      if (spTempSoldRows[i].portfolio_id === Number(portfolioID)) {
        shareIds[spTempSoldRows[i]._id] = true;
        rows.push(<tr key={`row${i}`}>
          <td>{spTempSoldRows[i].ticker_name}</td>
          <td></td>
          <td></td>
          <td>{spTempSoldRows[i].number_shares}</td>
          <td>{spTempSoldRows[i].date_sold}</td>
          <td>${spTempSoldRows[i].sell_price}</td>
          <td></td>
        </tr>)
      }
    }
  };

  for (let i = 0; i < props.data.soldShares.length; i++) {
    if (soldShareIds[props.data.currentShares[i]._id]) continue;
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
