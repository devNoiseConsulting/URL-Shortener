var express = require('express');
var validUrl = require('valid-url');
var app = express();

app.set('port', (process.env.PORT || 8080));

app.get(/^\/new\/.*/, function(req, res) {
    var output = {
        "error": "Wrong url format, make sure you have a valid protocol and real site."
    };
    var url = req.originalUrl.substr(5);
    if (validUrl.isUri(url)) {
        // Need to work on the mongo storage part
        var id = Math.floor(Math.random() * 90000) + 10000;
        output = {
            "original_url": url,
            "short_url": id.toString(36)
        };
    }
    res.end(JSON.stringify(output, null, 2));
});

app.get('/:id', function(req, res) {
    // Take ID and try to retrive the URL from mongo.
    var url = "http://www.example.com";
    res.location(url);
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

app.listen(app.get('port'), function() {
    console.log('URL Shortener microservice is listening on port ', app.get('port'));
});
