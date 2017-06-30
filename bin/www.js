var express = require('express');
var app = express();

app.use(express.static('./deploy/outputweb/src/website/'));
app.get('/', function (req, res) {
    res.sendFile('./deploy/outputweb/src/website/index.html');
});

app.listen(8080);