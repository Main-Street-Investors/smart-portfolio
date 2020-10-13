const test = require('tape');
const request = require('supertest');
const app = require('../server');

test('Serves HTML', function (t) {
  request(app)
    .get('/')
    .expect('Content-Type', 'text/html')
    .expect(200)
    .end(function (err, res) {
      t.same(res.headers['content-type'], 'text/html; charset=UTF-8', 'Correct content-type');
      t.same(res.text, '<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><link rel="icon" href="./assets/favicon.ico" type="image/x-icon"><title>Smart Portfolio</title></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>', 'Correct HTML text')
      t.end();
    });
});

test('Creates a Portfolio', function (t) {
  request(app)
    .post('/api/newPortfolio')
    .set({name: 'Test Portfolio'})
    .set('Cookie', ['user=frontendteam%40gmail.com'])
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.same(res.headers['content-type'], 'application/json; charset=utf-8', 'Correct content-type');
      t.end();
    });
});
