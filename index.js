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

function removeBlankSpacyLines(data) { // remove blank spacy lines
    var regex = /^\("", \[ \]\),.*$/gm
    return data.replace(regex, "").replace(/^\s*$(?:\r\n?|\n)/gm,'');
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
        var data;
        var dataType;
        if (fs.existsSync(env.dataPath + '/' + req.body.filename + '.spacy') ) {
            data =  fs.readFileSync(env.dataPath + '/' + req.body.filename + '.spacy', 'utf8');
            dataType = 'spacy';
        }
        else {
            data = fs.readFileSync(env.dataPath + '/' + req.body.filename, 'utf8');
            dataType = 'text';
        }
        res.send({ type: dataType, content: data});
    } else {
        console.log (req.body);
        res.status(404).json({ error: "Data File Not Found"});
    }
    
});

app.get("/merged-spacy", (req, res) => {
    var files = fs.readdirSync(env.dataPath, { withFileTypes: true });
    var data;
    var spacyData = "train_data = [\n";
    files.forEach(function (file) {
        if (file.isFile() && (/(.*)\.spacy/g).test(file.name)) {
            data = fs.readFileSync(env.dataPath + '/' + file.name, 'utf8').toString().split("\n");
            for (let i = 1; i < data.length-1; i++) {
                spacyData += data[i] + "\n";
            }
        }
    });
    spacyData += "]\n";
    res.send(removeBlankSpacyLines(spacyData));
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