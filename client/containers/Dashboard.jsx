import React, { Component } from 'react';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory';
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
      loading: true,
      portfolioNum: 0,
      range: 90,
      data: [],
      portfolioChartButtons: [],
      totalValue: 13654.88,
      acquiredValue: 12362.01,
      numberOfShares: 156,
    };
  }

  componentDidMount() {
    fetch('/api/getPortfolio')
    .then(resp => resp.json())
    .then(data => {
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
        cv.data = cv.data.map(point => {
          point.x = new Date(point.x);
          point.x.setHours(0);
          return point;
        })
        return cv;
      });
      const buttons = data.chartData.reduce((acc, cv, i) => {
        if (i === 0) return acc;
        acc.push(<Button className="dashNavBtn" variant="outline-info" key={`portfolioBtn${i}`} block onClick={() => {
          this.setState({
            ...this.state,
            portfolioNum: i
          });
        }}>{cv.category}</Button>);
        return acc;
      }, []);
      const totalValue = data.currentShares.reduce((acc, cv) => {
        acc += cv.price * cv.number_shares;
        return acc;
      }, 0) - data.soldShares.reduce((acc, cv) => {
        acc += cv.sell_price * cv.number_shares;
        return acc;
      }, 0);
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
      this.setState({
        ...this.state,
        loading: false,
        data: data.chartData,
        portfolioChartButtons: buttons,
        totalValue,
        acquiredValue,
        numberOfShares
      })
    })
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
                <Button className="dashNavBtn" variant="outline-info" block onClick={() => {
                  this.setState({
                    ...this.state,
                    portfolioNum: 0
                  });
                }}>Consolidated Portfolios</Button>
                {this.state.portfolioChartButtons}
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
                    <h3 id="chartTitle">{this.state.portfolioNum === 0 ? 'Consolidated Portfolio Metrics' : `${this.state.data[this.state.portfolioNum].category} Metrics`}</h3>
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
                          data={this.state.range === 90 ? this.state.data[this.state.portfolioNum].data :
                            this.state.range === 30 ? this.state.data[this.state.portfolioNum].data.slice(this.state.data[this.state.portfolioNum].data.length - 29) :
                            this.state.data[this.state.portfolioNum].data.slice(this.state.data[this.state.portfolioNum].data.length - 3)
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
                    <h4>Portfolio {this.state.portfolioNum}</h4>
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
                      <p className="glanceInfoText">{`${Math.round(this.state.acquiredValue / this.state.totalValue * 10 * 100) / 100}%`}</p>
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
      </div>
    )
  }
}

export default Dashboard;
