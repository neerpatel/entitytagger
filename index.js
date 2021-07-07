const express = require("express");
const path = require('path');
const randomColor = require('randomcolor');
const fs = require('fs');
const app = express();

function rndColor(arr) {
    var color = randomColor({luminosity: 'dark'});
    while (arr.some(row => row.color === color)) { color = randomColor({luminosity: 'bright'}) }
    return color;
}

app.use("/",express.static("./html"));
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

app.post("/savetags", (req, res) => {
    var body = '';
    //prepping for additional files to save
    taglistfile = './data/taglist.txt';
    //this is the file that will load the tag list into the editor
    tagjsonfile = './data/tags.json';
    // get the data and append it to the body variable.
    req.on('data', function(data) {
        body += data;
    });
    //When the stream is done, overwrite the old file
    req.on('end', function (){
        fs.writeFile(tagjsonfile, body, function() {
            res.end();
        });
    });
});


app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "html/index.html"));
});

app.listen(5000, () => console.log("Server running on port :5000"));