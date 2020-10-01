import React, { Component } from 'react';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';


class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      portfolioNum: 0,
      portfolioName: 'Consolidated Portfolio',
      range: 90,
      data: {},
      portfolioChartButtons: [],
      totalValue: 0,
      acquiredValue: 0,
      numberOfShares: 0,
      showIndividualShares: false,
      tickerNames: [],
      ticker: ''
    };
    this.ticker = '';
  }

  // Function to update state for Dashboard, used with either local storage cache or fresh request
  populateStateWithStockData(data) {
    console.log(data);
    data.IEXData.map(cv => {
      cv.data = cv.data.map(point => {
        point.x = new Date(point.x);
        point.x.setHours(0);
        return point;
      })
      return cv;
    });
    data.chartData.map(cv => {
      if (cv.data) {
        cv.data = cv.data.map(point => {
          point.x = new Date(point.x);
          point.x.setHours(0);
          return point;
        })
      }
      return cv;
    });
    const buttons = data.chartData.reduce((acc, cv, i) => {
      // Skip the first, since it's the consolidated data
      if (i === 0) return acc;

      // Create a button that will reset state to show data for this portfolio
      acc.push(<Button className="dashNavBtn" variant="outline-info" key={`portfolioBtn${i}`} block onClick={() => {
        const portName = this.state.data.chartData[i].portfolioName;
        const totalValue = this.state.data.chartData[i].data[63].y;
        const acquiredValue = this.state.data.currentShares.reduce((acc, cv) => {
          if (cv.name === portName) {
            acc += cv.price * cv.number_shares;
          };
          return acc;
        }, 0);
        const numberOfShares = this.state.data.currentShares.reduce((acc, cv) => {
          if (cv.name === portName) {
            acc += cv.number_shares;
          };
          return acc;
        }, 0) - this.state.data.soldShares.reduce((acc, cv) => {
          if (cv.name === portName) {
            acc += cv.number_shares;
          };
          return acc;
        }, 0);
        this.setState({
          ...this.state,
          portfolioNum: i,
          portfolioName: portName,
          totalValue,
          acquiredValue,
          numberOfShares
        });
      }}>{cv.portfolioName}</Button>);
      return acc;
    }, []);

    // Calculate values for glance
    const totalValue = data.chartData[0].data[63].y;
    const acquiredValue = data.currentShares.reduce((acc, cv) => {
      acc += cv.price * cv.number_shares;
      return acc;
    }, 0);
    const numberOfShares = data.currentShares.reduce((acc, cv) => {
      acc += cv.number_shares;
      return acc;
    }, 0) - data.soldShares.reduce((acc, cv) => {
      acc += cv.number_shares;
      return acc;
    }, 0);

    // Create options for individual stocks modal
    const tickerNames = data.IEXData.map(cv => {
      return <option key={`ticker-${cv.ticker}`}>{cv.ticker}</option>
    });

    // Store data in local storage
    if (!data.accessed) {
      data.accessed = new Date();
      window.localStorage.setItem('spData', JSON.stringify(data));
    }

    // Finally, update state and set loading to false
    this.setState({
      ...this.state,
      loading: false,
      data,
      portfolioChartButtons: buttons,
      totalValue,
      acquiredValue,
      numberOfShares,
      tickerNames
    });
  }

  componentDidMount() {
    const spData = window.localStorage.getItem('spData');
    const refresh = window.localStorage.getItem('spRefresh');
    if (spData) {
      let data = JSON.parse(spData);
      if (Date.now() - new Date(data.accessed).getTime() > 86400000 || refresh) {
        // Refresh the data
        if (refresh) {
          window.localStorage.removeItem('spRefresh');
          if (window.localStorage.getItem('spTempPorts')) window.localStorage.removeItem('spTempPorts');
          if (window.localStorage.getItem('spTempRows')) window.localStorage.removeItem('spTempRows');
        }
        window.localStorage.removeItem('spData');
        fetch('/api/getPortfolio')
        .then(resp => resp.json())
        .then(data => {
          this.populateStateWithStockData(data);
        });
      } else {
        this.populateStateWithStockData(data);
      }
    } else {
      // Don't have the data, go get it
      fetch('/api/getPortfolio')
      .then(resp => resp.json())
      .then(data => {
        this.populateStateWithStockData(data);
      });
    };
  };

  render() {
    return(
      <div>
        <div className="topPad"></div>
        {this.state.loading && <div className="mainLoadingContainer">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>}
        {!this.state.loading &&
        <Container fluid={true}>
          <Row style={{height: '90vh'}}>
            <Col lg={2} id="nav">
              <div>
                <Link to="/portfolio">
                  <Button variant="outline-info" block>
                    Manage Your Portfolios
                  </Button>
                </Link>
                <Button className="dashNavBtn" variant="outline-info" block onClick={() => {
                  const totalValue = this.state.data.chartData[0].data[63].y;
                  const acquiredValue = this.state.data.currentShares.reduce((acc, cv) => {
                    acc += cv.price * cv.number_shares;
                    return acc;
                  }, 0);
                  const numberOfShares = this.state.data.currentShares.reduce((acc, cv) => {
                    acc += cv.number_shares;
                    return acc;
                  }, 0) - this.state.data.soldShares.reduce((acc, cv) => {
                    acc += cv.number_shares;
                    return acc;
                  }, 0);
                  this.setState({
                    ...this.state,
                    portfolioNum: 0,
                    portfolioName: 'Consolidated Portfolio',
                    totalValue,
                    acquiredValue,
                    numberOfShares
                  });
                }}>Consolidated Portfolios</Button>
                {this.state.portfolioChartButtons}
                <Button variant="outline-info" block onClick={() => {
                  this.setState({
                    ...this.state,
                    showIndividualShares: true
                  });
                }}>Individual Stocks</Button>
              </div>
              <div id="logoutDiv">
                <Link to="/">
                  <Button variant="outline-secondary" block>
                    Logout
                  </Button>
                </Link>
              </div>
            </Col>

            <Col lg={10}>
              <Row style={{height: '90vh'}}>
                <Col lg={10}>
                  <Row className="centerColumn">
                    <h3 id="chartTitle">{this.state.portfolioNum < 0 ? `${this.state.ticker} Metrics` : this.state.portfolioNum === 0 ? 'Consolidated Portfolio Metrics' : `${this.state.data.chartData[this.state.portfolioNum].portfolioName} Metrics`}</h3>
                  </Row>
                  <Row className="centerColumn">
                    <div id="chartContainer">
                      <VictoryChart
                        theme={VictoryTheme.material}
                        scale={{ x: 'time' }}
                        height={350}
                        width={600}
                      >
                        <VictoryAxis />
                        <VictoryAxis dependentAxis tickFormat={(tick) => `$${tick}`} style={{ tickLabels: { angle: -15 } }}/>
                        <VictoryLine
                          style={{
                            data: { stroke: "#b81752" },
                            parent: { border: "1px solid #b81752"}
                          }}
                          data={this.state.portfolioNum < 0 && this.state.range === 90 ? this.state.data.IEXData.reduce((acc, cv) => {
                              if (cv.ticker === this.state.ticker) {
                                acc = cv.data;
                              }
                              return acc;
                            }, []) :
                            this.state.portfolioNum < 0 && this.state.range === 30 ? this.state.data.IEXData.reduce((acc, cv) => {
                                if (cv.ticker === this.state.ticker) {
                                  acc = cv.data;
                                }
                                return acc;
                              }, []).slice(35) :
                              this.state.portfolioNum < 0 ? this.state.data.IEXData.reduce((acc, cv) => {
                                  if (cv.ticker === this.state.ticker) {
                                    acc = cv.data;
                                  }
                                  return acc;
                                }, []).slice(61) :
                            this.state.range === 90 ? this.state.data.chartData[this.state.portfolioNum].data :
                            this.state.range === 30 ? this.state.data.chartData[this.state.portfolioNum].data.slice(35) :
                            this.state.data.chartData[this.state.portfolioNum].data.slice(61)
                          }
                        />
                      </VictoryChart>
                    </div>
                  </Row>
                  <Row className="centerColumn">
                    <Button className="chartRangeButton" variant="outline-info" onClick={() => {
                      this.setState({
                        ...this.state,
                        range: 5
                      });
                    }}>5 Days</Button>
                    <Button className="chartRangeButton" variant="outline-info" onClick={() => {
                      this.setState({
                        ...this.state,
                        range: 30
                      });
                    }}>1 Month</Button>
                    <Button className="chartRangeButton" variant="outline-info" onClick={() => {
                      this.setState({
                        ...this.state,
                        range: 90
                      });
                    }}>3 Months</Button>
                  </Row>
                </Col>
                <Col lg={2}>
                  <div id="glance">
                    <h4>{this.state.portfolioName}</h4>
                    <p><i>at a Glance</i></p>
                    <p>- - - - - - -</p>
                    <h5>Total Value</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">{`$${this.state.totalValue}`}</p>
                    </div>
                    <h5>Acquired Value</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">{`$${this.state.acquiredValue}`}</p>
                    </div>
                    <h5>All-Time Gain / Loss</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">{`${this.state.totalValue - this.state.acquiredValue < 0 ? '-' : ''}$${Math.round(Math.abs(this.state.totalValue - this.state.acquiredValue) * 100) / 100}`}</p>
                    </div>
                    <h5>Profit</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">{`${this.state.totalValue - this.state.acquiredValue < 0 ? '-' : ''}${this.state.totalValue - this.state.acquiredValue < 0 ? Math.round((1 - (this.state.totalValue / this.state.acquiredValue)) * 10000) / 100 : Math.round((1 - (this.state.acquiredValue / this.state.totalValue)) * 10000) / 100}%`}</p>
                    </div>
                    <h5>Number of Shares</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">{`${this.state.numberOfShares}`}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>}
        <Modal centered show={this.state.showIndividualShares} onHide={() => {
          this.setState({
            ...this.state,
            showIndividualShares: false
          });
        }}>
          <Modal.Header closeButton>
            <Modal.Title>Individual Stock Performance</Modal.Title>
          </Modal.Header>
          <Form>
            <Form.Group>
              <Form.Label>Select a Stock:</Form.Label>
              <Form.Control as="select" onChange={e => {
                this.ticker = e.target.value;
              }}>
                <option>Select a Stock</option>
                {this.state.tickerNames}
              </Form.Control>
            </Form.Group>
          </Form>
          <Modal.Footer>
            <Button variant="outline-info" onClick={(e) => {
              this.setState({
                ...this.state,
                showIndividualShares: false,
                portfolioNum: this.ticker === 'Select a Stock' ? this.state.portfolioNum : -1,
                ticker: this.ticker === 'Select a Stock' ? this.state.ticker : this.ticker
              });
            }}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default Dashboard;
