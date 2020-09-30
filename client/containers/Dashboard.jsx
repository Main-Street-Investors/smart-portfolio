import React, { Component } from 'react';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Link } from 'react-router-dom';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      portfolioNum: 1,
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 7 }
      ]
    };
  }

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
                <Link to="/portfolio/1">
                  <Button variant="outline-info" block>
                    Manage Your Portfolios
                  </Button>
                </Link>
                <Button className="dashNavBtn" variant="outline-info" block>Portfolio 1</Button>
                <Button variant="outline-info" block>Portfolio 2</Button>
                <Button variant="outline-info" block>Individual Stocks</Button>
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
                    <h3 id="chartTitle">Aggregated Stocks for {this.state.portfolioNum}</h3>
                  </Row>
                  <Row className="centerColumn">
                    <div id="chartContainer">
                      <VictoryChart
                        theme={VictoryTheme.material}
                      >
                        <VictoryLine
                          style={{
                            data: { stroke: "#c43a31" },
                            parent: { border: "1px solid #ccc"}
                          }}
                          data={this.state.data}
                        />
                      </VictoryChart>
                    </div>
                  </Row>
                  <Row className="centerColumn">
                    <Button className="chartRangeButton" variant="outline-info">5 Days</Button>
                    <Button className="chartRangeButton" variant="outline-info">1 Month</Button>
                    <Button className="chartRangeButton" variant="outline-info">3 Months</Button>
                  </Row>
                </Col>
                <Col lg={2}>
                  <div id="glance">
                    <h4>Portfolio {this.state.portfolioNum}</h4>
                    <p><i>at a Glance</i></p>
                    <p>- - - - - - -</p>
                    <h5>Total Value</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">$13,654.88</p>
                    </div>
                    <h5>Acquired Value</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">$12,362.01</p>
                    </div>
                    <h5>All-Time Gain / Loss</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">$1,292.87</p>
                    </div>
                    <h5>Profit</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">9.5%</p>
                    </div>
                    <h5>Number of Shares</h5>
                    <div className="glanceInfo">
                      <p className="glanceInfoText">156</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>}
      </div>
    )
  }
}

export default Dashboard;
