var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
/* GET home page. */
router.get('/', function (req, res, next)
{
    var data = new Object();
    console.log(req.session.username);
    if(req.session.username)
    {
        data.username = req.session.username;
    }
    res.render('index', data );

});




module.exports = router;
