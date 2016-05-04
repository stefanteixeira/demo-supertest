var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var Band = require('./app/models/band');

mongoose.connect('mongodb://localhost:27017/demo-supertest');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.use(function(req, res, next) {
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'API working!' });
});

router.route('/bands')
      .post(function(req, res) {
        var band = new Band();
        band.name = req.body.name;

        band.save(function(err) {
          if (err) res.send(err);

          res.json({ message: 'Band created!' });
        });
      })
      .get(function(req, res) {
        Band.find(function(err, bands) {
          if (err) res.send(err);

          res.json(bands);
        });
      });

router.route('/bands/:band_id')
      .get(function(req, res) {
        Band.findById(req.params.band_id, function(err, band) {
          if (err) res.send(err);

          res.json(band);
        });
      })
      .put(function(req, res) {
        Band.findById(req.params.band_id, function(err, band) {
          if (err) res.send(err);

          band.name = req.body.name;

          band.save(function(err) {
            if (err) res.send(err);

            res.json({ message: 'Band updated!' });
          });
        });
      })
      .delete(function(req, res) {
        Band.remove({
          _id: req.params.band_id
        }, function(err, band) {
          if (err) res.send(err);

          res.json({ message: 'Band deleted!' })
        });
      });

app.use('/api', router);

app.listen(port);
console.log('Server started on port ' + port);
