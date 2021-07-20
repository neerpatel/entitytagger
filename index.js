const express = require("express");

const path = require('path');
const randomColor = require('randomcolor');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();

const env = require("./config/env");
const junk = require('junk');

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

app.get("/getfilelist", (req, res) => {
    var response = [];
    var files = fs.readdirSync(env.dataPath, { withFileTypes: true });
    files.forEach(function (file) {
        if (file.isFile() && (/(.*)\.txt/g).test(file.name)) {
            response.push({filename: file.name});
        }
    });
    res.send(response);
});


app.get("/tags", (req, res) => {
    var response = [];
    var tagData = JSON.parse(fs.readFileSync(env.tagsDocPath, 'utf8'));

    for(var tag in tagData.tags){
        response.push({text: tagData.tags[tag], color: rndColor(response)} );
    }
    res.send(response);
});

app.post("/loadfile", (req, res) => {
    if (req.body.filename != undefined && fs.existsSync(env.dataPath + '/' + req.body.filename) ) {
        var response = fs.readFileSync(env.dataPath + '/' + req.body.filename, 'utf8');
        res.send(response);
    } else {
        res.status(404).json({ error: "Data File Not Found"});
    }
    
});

app.get("/spacy", (req, res) => {
    var response = fs.readFileSync('./data/spacy.txt', 'utf8');
    res.send(response);
});

app.post("/save", (req, res) => {
    var documentFile;
    // Set the filename, contents and our variable that will hold the final content to persist
    if (req.body.filename == "tags.json") {
        documentFile = env.tagsDocPath;
    }
    else {
        documentFile = env.dataPath + '/' + req.body.filename;
    }
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