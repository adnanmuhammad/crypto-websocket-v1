var express = require('express');
var router = express.Router();

const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: '',
    APISECRET: ''
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

// ================ Trade ==================
router.get('/market_order', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username) {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'market_order';
        }
        res.render('market_order', data);
    } else {
        res.redirect('/login');
    }
});


router.post('/send_market_order', function (req, res, next) {
    var response_return = new Object();

    var market      = req.body.market;
    var currency    = req.body.currency;
    var quantity    = req.body.quantity;

    var err_msg = '';
    if(market.trim() === '') {
        err_msg += 'Market field is requred. <br>';
    }

    if(currency.trim() === '') {
        err_msg += 'Currency field is requred. <br>';
    }

    if(quantity.trim() === '') {
        err_msg += 'Quantity field is requred. <br>';
    }

    if(err_msg !== '') {
        response_return.error = true;
        response_return.message = err_msg;
        res.end(JSON.stringify(response_return));
        return false;
    }
    //console.log(market+'______'+currency+'______'+quantity);


    var symbol = currency+''+market;

    binance.prices(symbol, (error, ticker) => {
        //console.info("Price of " + symbol + ":", ticker.BONDUSDT);
        var price = ticker[symbol];
        //console.info("Price of " + symbol + ":", price );
     });

    binance.exchangeInfo((error, response) => {
        if ( error ) console.error(error);

        //console.log(response);
        //console.log(response.symbols);
        //var baseAssetPrecision = response['symbols'][symbol]['baseAssetPrecision'];
        //console.log('________ baseAssetPrecision ___________'+baseAssetPrecision);

        for ( var obj of response.symbols ) {
            if(obj.symbol == symbol) {
                var baseAssetPrecision = obj.baseAssetPrecision;
                //console.log(symbol + '________ baseAssetPrecision ___________'+baseAssetPrecision);

                for (var filter of obj.filters ) {
                    if ( filter.filterType == "LOT_SIZE" ) {
                        var stepSize = filter.stepSize;
                        //console.log('______stepSize________:'+stepSize);
                        //console.log('______minQty________:'+filter.minQty);
                        //console.log('______maxQty________:'+filter.maxQty);
                    }
                }

                setTimeout(function(){
                    if (typeof stepSize !== 'undefined') {
                        // Round to stepSize
                        amount = binance.roundStep(quantity, stepSize);
                        //console.log('_____ AMOUNT________ ' + amount);

                        // ========== BUY ==============
                        binance.marketBuy(symbol, amount, (error, response) => {

                            if(error) {
                                //console.log('_____ERROR______' + error.body);
                                response_return.error = true;
                                //response_return.message = 'Market order unsuccessfull';
                                response_return.message = error.body;
                                res.end(JSON.stringify(response_return));
                            }

                            //console.info("Market Buy response", response);
                            //console.info("order id: " + response.orderId);
                            // Now you can limit sell with a stop loss, etc.


                            //=========== Insert in DB ================
                            req.getConnection(function (err, connection) {
                                var query = "INSERT INTO bin_orders (bo_symbol, bo_orderId, bo_clientOrderId, bo_transactTime, bo_price, bo_origQty, bo_executedQty, bo_status, bo_type, bo_side) VALUES ('" + response.symbol + "' , '" + response.orderId + "' , '" + response.clientOrderId + "', '" + response.transactTime + "', '" + response.price + "', '" + response.origQty + "' , '" + response.executedQty + "', '" + response.status + "', '" + response.type + "', '" + response.side + "' )";
                                connection.query(query, function (err, rows) {
                                    if (err){
                                        //console.log("Error Selecting : %s ", err);
                                        response_return.error = true;
                                        response_return.message = 'Market order unsuccessfull';
                                        res.end(JSON.stringify(response_return));
                                    }else{
                                        //console.log("New User added successfully");
                                        response_return.success = true;
                                        response_return.message = 'Market Order Placed Successfully.';
                                        res.end(JSON.stringify(response_return));
                                    }
                                    //res.render('customers', {page_title: "Customers - Node.js", data: rows});
                                });
                            });
                            //=========== Insert in DB ================

                        });
                        // ========== BUY ==============


                    }
                }, 500);

            }

            //filters.baseAssetPrecision = obj.baseAssetPrecision;
            //filters.quoteAssetPrecision = obj.quoteAssetPrecision;
        }


    });

    /*binance.prices(symbol, (error, ticker) => {
        //console.info("Price of " + symbol + ":", ticker.BONDUSDT);

        var price = ticker[symbol];
        console.info("Price of " + symbol + ":", price );

    });*/


});

// ================ Trade ==================


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
