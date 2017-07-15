var express = require('express');
var app = express();

app.use(express.static('./deploy/outputweb/src/website/'));
app.get('/', function (req, res) {
    res.sendFile('./deploy/outputweb/src/website/index.html');
});

app.get('/api', function (req, res) {
    var parameters = req.url.substring(req.url.indexOf("?") + 1);
    console.log("Url : " + req.url);
    console.log("Parameters : " + parameters);

    const results = {
        pictureResults : [
            {
                meta:{
                    
                }
            }
        ]
    } ;

    res.json({ key: "value" });
    // res.json(JSON.parse(body));
});


app.listen(8080);