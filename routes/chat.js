var express = require('express');
const fs = require('fs');
var mongoose = require('mongoose');
var User = mongoose.model('User');

router=express.Router();

router.get("/", (req, res) => {
    fs.readFile("./chat.html", (error, data) => {
        if (error) return res.status(500).json(error);
        res.writeHead(200, { "Content-Type": "text/html" });
        console.log(data.name)
        res.end(data);
    });
});

module.exports = router;