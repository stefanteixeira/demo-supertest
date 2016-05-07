var request = require('supertest'),
    assert = require('chai').assert,
    MongoClient = require('mongodb').MongoClient;

var baseUrl = 'http://localhost:8080/api';
var mongoUrl = 'mongodb://localhost:27017/demo-supertest';

describe('API Test', function() {

  before('clean database', function(done) {
    MongoClient.connect(mongoUrl, function(err, db) {
      db.dropDatabase();
      db.close();
      done();
    });
  });

  it('should perform a simple GET', function(done) {
    request(baseUrl)
      .get('/bands')
      .expect(200, done);
  });

  it('should add a band', function(done) {
    var bandName = "Band " + new Date().getTime();

    request(baseUrl)
      .post('/bands')
      .send({
        name: bandName
      })
      .expect(200, done);
  });

  it('should update a band name', function(done) {
    var bandName = "Band " + new Date().getTime();
    var bandId;

    request(baseUrl)
      .post('/bands')
      .send({
        name: bandName
      })
      .expect(200)
      .end(function(err, res) {
        if (err) throw done(err);
        MongoClient.connect(mongoUrl, function(err, db) {
          var bands = db.collection('bands');

          bands.find({ name: bandName }).toArray(function(err, docs) {
            assert.equal(1, docs.length);
            bandId = docs[0]._id;
            db.close();

            request(baseUrl)
              .put('/bands/'+bandId)
              .send({
                name: 'New Name'
              })
              .expect(200)
              .end(function(err, res) {
                if (err) throw done(err);
                request(baseUrl)
                  .get('/bands')
                  .expect(200)
                  .end(function(err, res) {
                    if (err) throw done(err);
                    assert.include(JSON.stringify(res), 'New Name');
                    done();
                  });
              });
          });
        });
      });
  });

});
