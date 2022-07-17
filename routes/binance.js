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
                                return false;
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

router.post('/get_market_order_data', function (req, res, next) {
    req.getConnection(function (err, connection) {
        // console.log(req.body.time_interval);

        var response = new Object();
        var query = " SELECT *, DATE_FORMAT(FROM_UNIXTIME(bo_transactTime), '%d-%m-%Y %H:%i:%s') AS date_time " +
                    " FROM bin_orders " +
                    " ORDER BY bo_id ASC ";
        connection.query(query, function (err, rows) {
            if (rows.length) {
                response.orders = rows;
                response.success = true;
                if(response) {
                    res.end(JSON.stringify(response));
                    return false;
                }
            } else {
                response.error = true;
                response.message = 'No Data found';
                if(response) {
                    res.end(JSON.stringify(response));
                    return false;
                }
            }
        });
    });
});

// ================ Trade ==================


// ================ OCO Orders ==================
router.get('/oco_orders', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username) {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'oco_orders';
        }
        res.render('oco_orders', data);
    } else {
        res.redirect('/login');
    }
});

router.post('/get_oco_current_free_balances', function (req, res, next) {
    var market      = req.body.market;
    var response = new Object();

    // testing
    /*
    let type = "STOP_LOSS";
    let quantity = 1;
    let price = 0.069;
    let stopPrice = 0.068;
    binance.sell("ETHBTC", quantity, price, {stopPrice: stopPrice, type: type});
    */
    // testing

    binance.balance((error, balances) => {
        if ( error ) return console.error(error);
        // console.log("balances()", balances);
        //console.log("ETH balance: ", balances.ETH.available);


        // to get the current price of currency
        Object.entries(balances).forEach((entry) => {
            const [key, value] = entry;
            if (value.available > 0) {
                var symbol = key+''+market;
                binance.prices(symbol, (error, ticker) => {
                    //console.info("Price of " + symbol + ":", ticker.BONDUSDT);
                    if(key !== 'USDT') {
                        //console.log(symbol +':__________'+ ticker[symbol]);
                        var price = ticker[symbol];
                        value.price = price;
                    } else {
                        value.price = '';
                    }

                });
            }
        });
        // console.log(balances);
        // to get the current price of currency


        setTimeout(function(){
            if (typeof balances !== 'undefined') {
                response.balances = balances;
                //console.log(balances);
                response.success = true;
                if(response) {
                    res.end(JSON.stringify(response));
                }
            }
        }, 1500);

    });
});

router.post('/get_specific_currency_balance', function (req, res, next) {
    var market      = req.body.market;
    var err_msg = '';
    var response = new Object();
    var response_return = new Object();

    var currency    = req.body.currency;
    if(currency.trim() === '') {
        err_msg += 'Currency is requred. <br>';
    }

    if(err_msg !== '') {
        response_return.error = true;
        response_return.message = err_msg;
        res.end(JSON.stringify(response_return));
        return false;
    }

    var symbol = currency+''+market;
    binance.prices(symbol, (error, ticker) => {
        var price = ticker[symbol];

        setTimeout(function(){
            if (typeof price !== 'undefined') {
                response.price = price;
                response.success = true;
                if(response) {
                    res.end(JSON.stringify(response));
                    return false;
                }
            } else {
                response.error = true;
                response.message = 'Something went wrong, Symbol price not found';
                if(response) {
                    res.end(JSON.stringify(response));
                    return false;
                }
            }
        }, 500);

    });
});

router.post('/send_oco_order', function (req, res, next) {
    var response_return = new Object();

    var market      = req.body.market;
    var currency    = req.body.currency;
    var price       = req.body.price;
    var limit       = req.body.limit;
    var stop        = req.body.stop;
    var amount      = req.body.amount;
    var quantity    = 0;

    var err_msg = '';
    if(market.trim() === '') {
        err_msg += 'Market field is requred. <br>';
    }

    if(currency.trim() === '') {
        err_msg += 'Currency field is requred. <br>';
    }

    if(price.trim() === '') {
        err_msg += 'Price field is requred. <br>';
    }

    if(limit.trim() === '') {
        err_msg += 'Limit field is requred. <br>';
    }

    if(stop.trim() === '') {
        err_msg += 'Stop field is requred. <br>';
    }

    if(amount.trim() === '') {
        err_msg += 'Amount field is requred. <br>';
    }

    if(err_msg !== '') {
        response_return.error = true;
        response_return.message = err_msg;
        res.end(JSON.stringify(response_return));
        return false;
    }

    var symbol = currency+''+market;

    binance.prices(symbol, (error, ticker) => {
        var price = ticker[symbol];
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

                for (var filter of obj.filters ) {
                    if ( filter.filterType == "LOT_SIZE" ) {
                        var stepSize = filter.stepSize;
                        //console.log('______stepSize________:'+stepSize);
                        //console.log('______minQty________:'+filter.minQty);
                        //console.log('______maxQty________:'+filter.maxQty);
                    } else if ( filter.filterType == "PRICE_FILTER" ) {
                        var tickSize = filter.tickSize;
                    }
                }

                //console.log('______stepSize________:'+stepSize);
                //console.log('______tickSize________:'+tickSize);


                setTimeout(function(){
                    if (typeof stepSize !== 'undefined' && typeof tickSize !== 'undefined') {
                        // Round to stepSize
                        quantity = binance.roundStep(amount, stepSize);
                        price    = binance.roundStep(price, tickSize);

                        stop     = binance.roundStep(stop, tickSize);
                        limit    = binance.roundStep(limit, tickSize);


                        //console.log('_____ Quantity ________ ' + quantity);
                        //console.log('_____ stop ________ ' + stop);
                        //console.log('_____ limit ________ ' + limit);
                        //console.log('_____ price ________ ' + price);

                        // ========== OCO SELL ORDER ==============
                        var curr_timestamp = Date.now();
                        binance.sell(symbol, quantity, price, { type:'OCO' , stopPrice: stop , stopLimitPrice: limit, stopLimitTimeInForce: 'GTC', timestamp: curr_timestamp }, (error, response) => {
                            if(error) {
                                response_return.error = true;
                                response_return.message = error.body;
                                res.end(JSON.stringify(response_return));
                                return false;
                            } else {
                                response_return.success = true;
                                response_return.message = 'OCO SELL Order Placed Successfully.';
                                res.end(JSON.stringify(response_return));
                                return false;
                            }

                        });
                        // ========== OCO SELL ORDER ==============

                    } else {
                        response_return.error = true;
                        response_return.message = 'Something went wrong, order not placed';
                        res.end(JSON.stringify(response_return));
                        return false;
                    }
                }, 500);



            }
        }


    });

});

// ================ OCO Orders ==================



// ================ Market Plus OCO Order ==================
router.get('/market_plus_oco', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username) {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'market_plus_oco';
        }
        res.render('market_plus_oco', data);
    } else {
        res.redirect('/login');
    }
});

router.post('/get_market_available_balance', function (req, res, next) {
    var available_bal = 0;
    var market      = req.body.market;
    var response = new Object();

    binance.balance((error, balances) => {
        if ( error ) return console.error(error);
        //console.log("balances()", balances);
        Object.entries(balances).forEach((entry) => {
            const [key, value] = entry;
            if(key === market) {
                available_bal = value.available;
            }
        });
        // console.log(balances);
        // to get the current price of currency


        setTimeout(function(){
            if (typeof available_bal !== 'undefined') {
                response.available_bal = available_bal;
                //console.log(balances);
                response.success = true;
                if(response) {
                    res.end(JSON.stringify(response));
                }
                return false;
            } else {
                response.error = true;
                response.message = 'Something went wrong, Balance not fetched';
                res.end(JSON.stringify(response));
                return false;
            }
        }, 1000);

    });
});

router.post('/send_market_plus_oco_order', function (req, res, next) {
    var response_return = new Object();

    var available_bal = 0;
    var curr_price    = 0;
    var price         = 0;
    var stop          = 0;
    var limit         = 0;

    var db_insert_status            = true;
    var market_order_success_status = true;
    var oco_order_success_status    = true;
    var market_error_msg            = '';
    var oco_error_msg               = '';


    var market      = req.body.market;
    var currency    = req.body.currency;
    var quantity    = req.body.quantity;

    var pricePer      = req.body.pricePer;
    var limitPer      = req.body.limitPer;
    var stopPer       = req.body.stopPer;


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

    if(pricePer.trim() === '') {
        err_msg += 'Price Percent field is requred. <br>';
    }

    if(limitPer.trim() === '') {
        err_msg += 'Limit Percent field is requred. <br>';
    }

    if(stopPer.trim() === '') {
        err_msg += 'Stop Percent field is requred. <br>';
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
        curr_price = ticker[symbol];
        //console.info("Price of " + symbol + ":", price );
    });

    binance.balance((error, balances) => {
        if ( error ) return console.error(error);

        Object.entries(balances).forEach((entry) => {
            const [key, value] = entry;
            if(key === currency) {
                available_bal = value.available;
            }
        });
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
                for (var filter of obj.filters ) {
                    if ( filter.filterType == "LOT_SIZE" ) {
                        var stepSize = filter.stepSize;
                    } else if ( filter.filterType == "PRICE_FILTER" ) {
                        var tickSize = filter.tickSize;
                    }
                }

                setTimeout(function(){
                    if (typeof stepSize !== 'undefined') {
                        // Round to stepSize
                        amount = binance.roundStep(quantity, stepSize);
                        // ========== BUY ==============
                        binance.marketBuy(symbol, amount, (error, response) => {
                            if(error) {
                                market_order_success_status = false;
                                market_error_msg += error.body;
                                /*response_return.error = true;
                                response_return.message = error.body;
                                res.end(JSON.stringify(response_return));
                                return false;*/
                            } else {
                                //=========== Insert in DB ================
                                req.getConnection(function (err, connection) {
                                    var query = "INSERT INTO bin_orders (bo_symbol, bo_orderId, bo_clientOrderId, bo_transactTime, bo_price, bo_origQty, bo_executedQty, bo_status, bo_type, bo_side) VALUES ('" + response.symbol + "' , '" + response.orderId + "' , '" + response.clientOrderId + "', '" + response.transactTime + "', '" + response.price + "', '" + response.origQty + "' , '" + response.executedQty + "', '" + response.status + "', '" + response.type + "', '" + response.side + "' )";
                                    connection.query(query, function (err, rows) {
                                        if (err){
                                            db_insert_status = false;
                                        }
                                    });
                                });
                                //=========== Insert in DB ================
                            }
                        });
                        // ========== BUY ==============
                    }


                    if (typeof stepSize !== 'undefined' && typeof tickSize !== 'undefined') {
                        // Round to stepSize
                        quantity = binance.roundStep(available_bal, stepSize);

                        price = curr_price + ((curr_price * pricePer) / (100));
                        stop  = curr_price - ((curr_price * stopPer) / (100));
                        limit = curr_price - ((curr_price * limitPer) / (100));


                        price    = binance.roundStep(price, tickSize);
                        stop     = binance.roundStep(stop, tickSize);
                        limit    = binance.roundStep(limit, tickSize);


                        //console.log('_____ Quantity ________ ' + quantity);
                        //console.log('_____ price ________ ' + price);
                        //console.log('_____ limit ________ ' + limit);
                        //console.log('_____ stop ________ ' + stop);

                        // ========== OCO SELL ORDER ==============
                        var curr_timestamp = Date.now();
                        binance.sell(symbol, quantity, price, { type:'OCO' , stopPrice: stop , stopLimitPrice: limit, stopLimitTimeInForce: 'GTC', timestamp: curr_timestamp }, (error, response) => {
                            if(error) {
                                oco_order_success_status = false;
                                oco_error_msg += error.body;

                                /*response_return.error = true;
                                response_return.message = error.body;
                                res.end(JSON.stringify(response_return));
                                return false;*/
                            }
                        });
                        // ========== OCO SELL ORDER ==============
                    }


                }, 500);


                // ============= OCO Part =============
                setTimeout(function(){
                    if(market_order_success_status === true && oco_order_success_status === true) {
                        response_return.success = true;
                        response_return.message = 'Market Plus OCO Order Placed Successfully.';
                        res.end(JSON.stringify(response_return));
                        return false;
                    } else if(market_order_success_status === false && oco_order_success_status === false) {
                        response_return.error = true;
                        response_return.message = 'BOTH Market Order and OCO Order Failed. ERROR: ' + market_error_msg + ', '+ oco_error_msg;
                        res.end(JSON.stringify(response_return));
                        return false;
                    } else if(market_order_success_status === true && oco_order_success_status === false) {
                        response_return.error = true;
                        response_return.message = 'Market Order Placed Successfully... But OCO Order Failed. ERROR: ' + market_error_msg + ', '+ oco_error_msg;
                        res.end(JSON.stringify(response_return));
                        return false;
                    } else if(market_order_success_status === false && oco_order_success_status === true) {
                        response_return.error = true;
                        response_return.message = 'OCO Order Placed Successfully... But Market Order Failed. ERROR: ' + market_error_msg + ', '+ oco_error_msg;
                        res.end(JSON.stringify(response_return));
                        return false;
                    }
                }, 1000);
                // ============= OCO Part =============

            }
        }
    });
});

// ================ Market Plus OCO Order ==================




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

function toFixedTrunc(x, n) {
    const v = (typeof x === 'string' ? x : x.toString()).split('.');
    if (n <= 0) return v[0];
    let f = v[1] || '';
    if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
    while (f.length < n) f += '0';
    return `${v[0]}.${f}`
}

module.exports = router;
