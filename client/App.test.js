import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';

import App from './App';
import LandingPage from './containers/LandingPage';
import Portfolio from './containers/Portfolio';
import Dashboard from './containers/Dashboard';

// react-router-dom has been mocked in __mocks__ folder, extra wrapping div present

describe('App', () => {
  test('snapshot renders', () => {
    const component = renderer.create(
      <MemoryRouter initialEntries={[ '/' ]}>
        <App />
      </MemoryRouter>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('invalid path should redirect to 404', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={[ '/random' ]}>
        <App/>
      </MemoryRouter>
    );
    expect(wrapper.find(LandingPage)).toHaveLength(0);
  });

  it('renders the LandingPage', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={[ '/' ]}>
        <App />
      </MemoryRouter>
    );
    expect(wrapper.find(LandingPage).length).toEqual(1);
  });

});

describe('LandingPage', () => {
  test('snapshot renders', () => {
    const component = renderer.create(
      <MemoryRouter initialEntries={[ '/' ]}>
        <LandingPage />
      </MemoryRouter>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
