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
    var tagData = JSON.parse(fs.readFileSync('./tags/tags.json', 'utf8'));

    for(var tag in tagData.tags){
        response.push({text: tagData.tags[tag], color: rndColor(response)} );
    }
    res.send(response);
});

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "html/index.html"));
});

app.listen(5000, () => console.log("Server running on port :5000"));