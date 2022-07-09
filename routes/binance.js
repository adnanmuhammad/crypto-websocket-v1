var express = require('express');
var router = express.Router();

const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: 'KfPBJlI9juNDLvOV8Ie8CcQ5Ab0v55kK5sOS1AZeWMRzt8zOWK9kyAwLfwwdx6Jv',
    APISECRET: 'FvSgxTsge5KWxiFjlMYS7hHEi3Idt8c1ul0CpspazUkkQ5DeUWnvwsFHyfbrmI2q'
});

router.get('/balance', function (req, res, next)
{
    var balance;
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'balance';
        }

        res.render('balance', data);
    } else {
        res.redirect('/login');
    }
});


router.post('/get_balances', function (req, res, next) {
    var response = new Object();

    binance.balance((error, balances) => {
        if ( error ) return console.error(error);
        //console.log("balances()", balances);
        //console.log("ETH balance: ", balances.ETH.available);

        response.balances = balances;

        //console.log(balances);

        response.success = true;

        if(response) {
            res.end(JSON.stringify(response));
        }
    });
});


router.get('/order_history', function (req, res, next)
{
    var balance;
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'order_history';
        }

        res.render('order_history', data);
    } else {
        res.redirect('/login');
    }
});


router.post('/get_order_history', function (req, res, next) {
    var response = new Object();
    var mybal = [];

    binance.balance((error, balances) => {
        if ( error ) return console.error(error);
    //console.log("balances()", balances);
    //console.log("ETH balance: ", balances.ETH.available);

    balances_result = JSON.stringify(balances);
    result = JSON.parse(balances_result);

    Object.entries(result).forEach((entry) => {
        const [key, value] = entry;
        if (value.available > 0 || value.onOrder > 0) {
            var symbol = key + 'USDT';
            binance.trades(symbol, (error, trades, symbol) => {
                //console.info(symbol+" trade history", trades);
                //console.info(trades);

                // ==============================
                trade_data = JSON.stringify(trades);
                trade_result = JSON.parse(trade_data);

                Object.entries(trade_result).forEach((entry) => {
                    const [key, value] = entry;
                    //console.log(key +'========value=========='+value);
                    //console.log(key +'========value=========='+value.symbol+'______'+value.orderId+'______'+value.price+'______'+value.qty+'______'+value.quoteQty+'______'+value.commission+'______'+value.commissionAsset+'______'+value.time);

                    response.success = true;
                    if(value) {
                        //response.mybal = value;
                        value.time = unixtime_to_datetime(value.time);
                        mybal.push(value);
                    }

                });

                //  =============================


            });

        }
    });

    setTimeout(function(){
        if(mybal.length > 0) {
            response.mybal = mybal;
            res.end(JSON.stringify(response));
        }
    }, 2000);

    //console.log('============ mybal ============' + mybal);

    //response.mybal = mybal;

    /*
    response.balances = balances;
    //console.log(balances);
    response.success = true;
    if(response) {
        res.end(JSON.stringify(response));
    }
    */

});
});

function unixtime_to_datetime(timestamp) {
    var datetime;
    date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    datetime = day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    return datetime;
}

module.exports = router;
