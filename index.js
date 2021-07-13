const express = require("express");
const path = require('path');
const randomColor = require('randomcolor');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

function rndColor(arr) {
    var color = randomColor({luminosity: 'dark'});
    while (arr.some(row => row.color === color)) { color = randomColor({luminosity: 'bright'}) }
    return color;
}

isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};

app.use("/",express.static("./html"));
app.use(bodyParser.json());

app.get("/tags", (req, res) => {
    var response = [];
    var tagData = JSON.parse(fs.readFileSync('./data/tags.json', 'utf8'));

    for(var tag in tagData.tags){
        response.push({text: tagData.tags[tag], color: rndColor(response)} );
    }
    res.send(response);
});

app.get("/text", (req, res) => {
    var response = fs.readFileSync('./data/text.txt', 'utf8');
    res.send(response);
});
app.get("/spacy", (req, res) => {
    var response = fs.readFileSync('./data/spacy.txt', 'utf8');
    res.send(response);
});

app.post("/save", (req, res) => {
    // Set the filename, contents and our variable that will hold the final content to persist
    var documentFile = './data/'+ req.body.filename;
    var saveContents = req.body.content;
    var persist;
    //exists because we want to stringify objects from bodyparser for persisting to a file, otherwise it saves the [object Object] as the value
    if (isObject(saveContents)) {
        persist = JSON.stringify(saveContents);
    }
    else {
        persist=saveContents;
    }
    fs.writeFile(documentFile, persist, function() {
        res.end();
    });
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "html/index.html"));
});

app.listen(5000, () => console.log("Server running on port :5000"));