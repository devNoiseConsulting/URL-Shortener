var mongo = require('mongodb').MongoClient;
var validUrl = require('valid-url');
var db = require('./db');
var express = require('express');

var app = express();
let dbUrl = "mongodb://" + process.env.DBUSER + ":" + process.env.DBPASSWORD + "@" + process.env.DBURL;

app.set('port', (process.env.PORT || 8080));

app.get(/^\/new\/.*/, function(req, res) {
    var output = {
        "error": "Wrong url format, make sure you have a valid protocol and real site."
    };
    var url = req.originalUrl.substr(5);
    if (validUrl.isUri(url)) {
        // Need to work on the mongo storage part
        var collection = db.get().collection('smaller');
        if (collection) {
            collection.findOne({
                $query: {},
                $orderby: {
                    _id: -1
                }
            }, gotMaxId);
        }
    } else {
        res.end(JSON.stringify(output, null, 2));
    }

    function gotMaxId(err, document) {
        output = {
            "error": "Something went wrong with the database."
        };
        if (err) {
            res.end(JSON.stringify(output, null, 2));
        }
        if (document) {
            document._id++;
            document.url = url;
            var shortUrl = 'http://' + req.get('host') + '/' + document._id.toString(36);
            try {
                collection.insert(document);
                output = {
                    "original_url": url,
                    "short_url": shortUrl
                };
                res.end(JSON.stringify(output, null, 2));
            } catch (e) {
                res.end(JSON.stringify(output, null, 2));
            }
        }
    }
});

app.get('/:id', function(req, res) {
    var linkId = parseInt(req.params.id, 36);
    var collection = db.get().collection('smaller');
    if (collection) {
        collection.findOne({
            _id: linkId
        }, redirect);
    }

    function redirect(err, document) {
        if (err) {
            res.location('/');
        }
        if (document) {
            res.redirect(document.url);
        }
    }
});

app.get('/', function(req, res) {
    var output = {
        "app": "URL Shortener Microservice",
        "paths": {
            "/new/<uri>": "Provide a URL for shortening.",
            "/<id>": "Retrive a shortened URL."
        }
    };
    res.end(JSON.stringify(output, null, 2));
});

db.connect(dbUrl, function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
        app.listen(app.get('port'), function() {
            console.log('URL Shortener microservice is listening on port ', app.get('port'));
            console.log(dbUrl);
        });
    }
});
