var request = require('supertest-as-promised'),
    assert = require('chai').assert,
    Promise = require('bluebird'),
    MongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;

var baseUrl = 'http://localhost:8080/api';
var mongoUrl = 'mongodb://localhost:27017/demo-supertest';

describe('API Test with Promises', function() {

  before('clean database', function() {
    return MongoClient.connectAsync(mongoUrl)
      .then(function(db) {
        db.dropDatabase();
        db.close();
      });
  });

  it('should perform a simple GET', function() {
    return request(baseUrl)
      .get('/bands')
      .expect(200);
  });

  it('should add a band', function() {
    var bandName = "Band " + new Date().getTime();

    return request(baseUrl)
      .post('/bands')
      .send({
        name: bandName
      })
      .expect(200);
  });

  it('should update a band name', function() {
    var bandName = "Band " + new Date().getTime();
    var bandId;

    return request(baseUrl)
      .post('/bands')
      .send({
        name: bandName
      })
      .expect(200)
      .then(function(res) {
        return MongoClient.connectAsync(mongoUrl)
          .then(function(db) {
            return db.collection('bands').findAsync({
                name: bandName
              })
              .then(function(cursor) {
                return cursor.toArrayAsync();
              })
              .then(function(docs) {
                assert.equal(1, docs.length);
                bandId = docs[0]._id;
                db.close();
              });
          });
      })
      .then(function(res) {
        return request(baseUrl)
          .put('/bands/' + bandId)
          .send({
            name: 'New Name'
          })
          .expect(200);
      })
      .then(function(res) {
        return request(baseUrl)
          .get('/bands')
          .expect(200);
      })
      .then(function(res) {
        assert.include(JSON.stringify(res), 'New Name');
      });
  });

});
