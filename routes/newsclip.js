/**
 * Created by eakporo on 8/16/17
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    console.log("clip: "+req.query);
    res.render('newsclip.html', {clip: req.query});
});

module.exports = router;
