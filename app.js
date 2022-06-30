var express = require('express');
var socket = require('socket.io');

const { formatMessage, formatMessageObject, formatMessageRoom, save_message_db, get_gain_chart_data } = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');
const botName = 'Crypto Exchnage WebSocket';

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var signup = require('./routes/signup');
var messenger = require('./routes/messenger');
const db_connection = require('./connections');

var app = express();

var connection = require('express-myconnection');
var mysql = require('mysql');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: '1234567890QWERTY',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(
    connection(mysql, {
        host: 'crypto-exchange.cvcoxaxglrwq.us-east-1.rds.amazonaws.com',
        user: 'admin',
        password: 'sVEH0VWtkOgb7LjGc4A2',
        port: 3306, //port mysql
        database: 'cryptowebsocket'
    }, 'request')
);

// uncomment after placing your favicon in /assets
//app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// app.use('/', index);

// Move to login page when the application starts
app.use('/', login);

app.use('/login', login);
app.post('/login', login);
app.get('/users', signup);
app.post('/signupuser', signup);
app.get('/logout', logout);
app.get('/home', messenger);
app.get('/messenger', messenger);
app.get('/dashboard', messenger);

app.get('/gain_chart', messenger);
app.post('/get_detail_charts_data', messenger);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// app.listen(1337, function(){
//     console.log('Ready on port 1337');
// });

var server = app.listen(1337, function(){
    console.log('Ready on port 1337 For Crypto-Exchange With WebSockets');
});


var users = [];
var users_room = [];

//******** Get all users **********

//******** Get all users **********

// Socket setup & pass server
var io = socket(server);

io.on('connection', function(socket) {
    console.log('Made connection', socket.id);

    socket.on('update_gain_chart_data', function(data){
        //socket.broadcast.emit('update_gain_chart_data', data);
        setInterval(intervalFunc, 2000);
    });

    socket.on('update_gain_chart_data2', function(data){
        // Old code, commented
        //intervalFunc2(data);
    });

    function intervalFunc2(data) {
        param_data = JSON.stringify(data);
        json_data = JSON.parse(param_data);

        //console.log('_____data in interval function 2______'+json_data[0].time_interval);
        var time_interval = json_data[0].time_interval;
        var percent_value = json_data[0].percent_value;
        var percent_value_max = (percent_value + 1);
        //console.log('time_interval: '+time_interval + ', percent_value: '+percent_value +'<br>');

        var sql = " SELECT " +
            " cry_fd.symbol, " +
            " substring_index(group_concat(cry_fd.open order by id ASC), ',', 1) AS open, " +
            " substring_index(group_concat(cry_fd.close order by id DESC), ',', 1) AS close, " +
            " round((((substring_index(group_concat(cry_fd.close order by id DESC), ',', 1) - substring_index(group_concat(cry_fd.open order by id ASC), ',', 1)) / substring_index(group_concat(cry_fd.open order by id ASC), ',', 1)) * 100),6) AS percent_increase, " +
            " "+ time_interval +" AS time_interval," +
            " ( " +
            " SELECT round((((substring_index(group_concat(crf1.close order by id DESC), ',', 1) - substring_index(group_concat(crf1.open order by id ASC), ',', 1)) / substring_index(group_concat(crf1.open order by id ASC), ',', 1)) * 100),6) " +
            " FROM crypto_feed crf1 " +
            " WHERE crf1.start_date >= NOW() - INTERVAL 60 MINUTE " +
            " AND crf1.end_date <= NOW() " +
            " AND crf1.symbol = cry_fd.symbol " +
            " ) AS one_hr_gain, " +
            " ( " +
            " SELECT round((((substring_index(group_concat(crf2.close order by id DESC), ',', 1) - substring_index(group_concat(crf2.open order by id ASC), ',', 1)) / substring_index(group_concat(crf2.open order by id ASC), ',', 1)) * 100),6) " +
            " FROM crypto_feed crf2 " +
            " WHERE crf2.start_date >= NOW() - INTERVAL 30 MINUTE " +
            " AND crf2.end_date <= NOW() " +
            " AND crf2.symbol = cry_fd.symbol " +
            " ) AS thirty_min_gain, " +
            " ( " +
            " SELECT round((((substring_index(group_concat(crf3.close order by id DESC), ',', 1) - substring_index(group_concat(crf3.open order by id ASC), ',', 1)) / substring_index(group_concat(crf3.open order by id ASC), ',', 1)) * 100),6) " +
            " FROM crypto_feed crf3 " +
            " WHERE crf3.start_date >= NOW() - INTERVAL 10 MINUTE " +
            " AND crf3.end_date <= NOW() " +
            " AND crf3.symbol = cry_fd.symbol " +
            " ) AS ten_min_gain, " +
            " ( " +
            " SELECT round((((substring_index(group_concat(crf4.close order by id DESC), ',', 1) - substring_index(group_concat(crf4.open order by id ASC), ',', 1)) / substring_index(group_concat(crf4.open order by id ASC), ',', 1)) * 100),6) " +
            " FROM crypto_feed crf4 " +
            " WHERE crf4.start_date >= NOW() - INTERVAL 5 MINUTE " +
            " AND crf4.end_date <= NOW() " +
            " AND crf4.symbol = cry_fd.symbol " +
            " ) AS five_min_gain, " +
            " ( " +
            " SELECT round((((substring_index(group_concat(crf5.close order by id DESC), ',', 1) - substring_index(group_concat(crf5.open order by id ASC), ',', 1)) / substring_index(group_concat(crf5.open order by id ASC), ',', 1)) * 100),6) " +
            " FROM crypto_feed crf5 " +
            " WHERE crf5.start_date >= NOW() - INTERVAL 2 MINUTE " +
            " AND crf5.end_date <= NOW() " +
            " AND crf5.symbol = cry_fd.symbol " +
            " ) AS two_min_gain, " +
            " ( " +
            " SELECT round((((substring_index(group_concat(crf6.close order by id DESC), ',', 1) - substring_index(group_concat(crf6.open order by id ASC), ',', 1)) / substring_index(group_concat(crf6.open order by id ASC), ',', 1)) * 100),6) " +
            " FROM crypto_feed crf6 " +
            " WHERE crf6.start_date >= NOW() - INTERVAL 1 MINUTE " +
            " AND crf6.end_date <= NOW() " +
            " AND crf6.symbol = cry_fd.symbol " +
            " ) AS one_min_gain " +
            " FROM crypto_feed cry_fd " +
            " WHERE cry_fd.start_date >= NOW() - INTERVAL "+ time_interval +" MINUTE " +
            " AND cry_fd.end_date <= NOW() " +
            " GROUP BY cry_fd.symbol " +
            " HAVING percent_increase >= "+ percent_value +" AND percent_increase < "+ percent_value_max +" ";


        //console.log(sql +' _________________ ');
        db_connection.query(sql, function (err, rows) {
            if (rows.length) {
                json_data = JSON.stringify(rows);
                //json_data = JSON.parse(json_data);
                //console.log(json_data+' <br><br>');

                io.emit('fetch_second_gain_chart_data', json_data);
            }
        });
    }

    function intervalFunc() {
        //console.log('Cant stop me now!');
        var data = {first_name:'Muhammad', last_name:'Adnan', address:'Lahore'};
        //console.log(data);
        //socket.broadcast.emit('fetch_gain_chart_data', data);

        //=============== fetch data from database query
        //console.log(get_gain_chart_data());
        //var ret_data = null;
        //ret_data = get_gain_chart_data();
        //console.log(' ______________ ' + ret_data);

        var json_data;
        var json_resp_data;

        var sql = "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 1 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 1 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +
            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 3 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 3 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +
            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 5 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 5 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +
            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 7 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 7 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +
            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 10 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 10 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +

            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 15 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 15 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +
            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 30 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 30 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +
            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 45 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 45 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol " +
            " " +

            "UNION ALL " +
            " " +
            "SELECT symbol, substring_index(group_concat(open order by id ASC), ',', 1) AS open, substring_index(group_concat(close order by id DESC), ',', 1) AS close, round((((substring_index(group_concat(close order by id DESC), ',', 1) - substring_index(group_concat(open order by id ASC), ',', 1)) / substring_index(group_concat(open order by id ASC), ',', 1)) * 100),6) AS percent_increase, 60 AS time_interval " +
            "FROM crypto_feed " +
            "WHERE start_date >= NOW() - INTERVAL 60 MINUTE " +
            "AND end_date <= NOW() " +
            "GROUP BY symbol";

        //console.log(sql+ '___________');

        db_connection.query(sql, function (err, rows) {
            if (rows.length) {
                //console.log('here comes the db users');
                //console.log(JSON.stringify(rows));

                // response will be in JSON
                json_data = JSON.stringify(rows);
                json_data = JSON.parse(json_data);

                //console.log(json_data);
                /*var tbl_data = new Array();
                tbl_data[0][0]['counter'] = 0;
                console.log(tbl_data);*/

                // =========== To be replaced in future =====================

                var counter1_1  = 0;
                var counter1_2  = 0;
                var counter1_3  = 0;
                var counter1_4  = 0;
                var counter1_5  = 0;
                var counter1_6  = 0;
                var counter1_7  = 0;
                var counter1_8  = 0;
                var counter1_9  = 0;
                var counter1_10 = 0;
                var counter1_11 = 0;
                var counter1_12 = 0;
                var counter1_13 = 0;
                var counter1_14 = 0;
                var counter1_15 = 0;
                var counter1_16 = 0;
                var counter1_17 = 0;
                var counter1_18 = 0;
                var counter1_19 = 0;
                var counter1_20 = 0;

                var counter3_1  = 0;
                var counter3_2  = 0;
                var counter3_3  = 0;
                var counter3_4  = 0;
                var counter3_5  = 0;
                var counter3_6  = 0;
                var counter3_7  = 0;
                var counter3_8  = 0;
                var counter3_9  = 0;
                var counter3_10 = 0;
                var counter3_11 = 0;
                var counter3_12 = 0;
                var counter3_13 = 0;
                var counter3_14 = 0;
                var counter3_15 = 0;
                var counter3_16 = 0;
                var counter3_17 = 0;
                var counter3_18 = 0;
                var counter3_19 = 0;
                var counter3_20 = 0;

                var counter5_1  = 0;
                var counter5_2  = 0;
                var counter5_3  = 0;
                var counter5_4  = 0;
                var counter5_5  = 0;
                var counter5_6  = 0;
                var counter5_7  = 0;
                var counter5_8  = 0;
                var counter5_9  = 0;
                var counter5_10 = 0;
                var counter5_11 = 0;
                var counter5_12 = 0;
                var counter5_13 = 0;
                var counter5_14 = 0;
                var counter5_15 = 0;
                var counter5_16 = 0;
                var counter5_17 = 0;
                var counter5_18 = 0;
                var counter5_19 = 0;
                var counter5_20 = 0;

                var counter7_1  = 0;
                var counter7_2  = 0;
                var counter7_3  = 0;
                var counter7_4  = 0;
                var counter7_5  = 0;
                var counter7_6  = 0;
                var counter7_7  = 0;
                var counter7_8  = 0;
                var counter7_9  = 0;
                var counter7_10 = 0;
                var counter7_11 = 0;
                var counter7_12 = 0;
                var counter7_13 = 0;
                var counter7_14 = 0;
                var counter7_15 = 0;
                var counter7_16 = 0;
                var counter7_17 = 0;
                var counter7_18 = 0;
                var counter7_19 = 0;
                var counter7_20 = 0;

                var counter10_1  = 0;
                var counter10_2  = 0;
                var counter10_3  = 0;
                var counter10_4  = 0;
                var counter10_5  = 0;
                var counter10_6  = 0;
                var counter10_7  = 0;
                var counter10_8  = 0;
                var counter10_9  = 0;
                var counter10_10 = 0;
                var counter10_11 = 0;
                var counter10_12 = 0;
                var counter10_13 = 0;
                var counter10_14 = 0;
                var counter10_15 = 0;
                var counter10_16 = 0;
                var counter10_17 = 0;
                var counter10_18 = 0;
                var counter10_19 = 0;
                var counter10_20 = 0;

                var counter60_1  = 0;
                var counter60_2  = 0;
                var counter60_3  = 0;
                var counter60_4  = 0;
                var counter60_5  = 0;
                var counter60_6  = 0;
                var counter60_7  = 0;
                var counter60_8  = 0;
                var counter60_9  = 0;
                var counter60_10 = 0;
                var counter60_11 = 0;
                var counter60_12 = 0;
                var counter60_13 = 0;
                var counter60_14 = 0;
                var counter60_15 = 0;
                var counter60_16 = 0;
                var counter60_17 = 0;
                var counter60_18 = 0;
                var counter60_19 = 0;
                var counter60_20 = 0;

                var counter15_1  = 0;
                var counter15_2  = 0;
                var counter15_3  = 0;
                var counter15_4  = 0;
                var counter15_5  = 0;
                var counter15_6  = 0;
                var counter15_7  = 0;
                var counter15_8  = 0;
                var counter15_9  = 0;
                var counter15_10 = 0;
                var counter15_11 = 0;
                var counter15_12 = 0;
                var counter15_13 = 0;
                var counter15_14 = 0;
                var counter15_15 = 0;
                var counter15_16 = 0;
                var counter15_17 = 0;
                var counter15_18 = 0;
                var counter15_19 = 0;
                var counter15_20 = 0;

                var counter30_1  = 0;
                var counter30_2  = 0;
                var counter30_3  = 0;
                var counter30_4  = 0;
                var counter30_5  = 0;
                var counter30_6  = 0;
                var counter30_7  = 0;
                var counter30_8  = 0;
                var counter30_9  = 0;
                var counter30_10 = 0;
                var counter30_11 = 0;
                var counter30_12 = 0;
                var counter30_13 = 0;
                var counter30_14 = 0;
                var counter30_15 = 0;
                var counter30_16 = 0;
                var counter30_17 = 0;
                var counter30_18 = 0;
                var counter30_19 = 0;
                var counter30_20 = 0;

                var counter45_1  = 0;
                var counter45_2  = 0;
                var counter45_3  = 0;
                var counter45_4  = 0;
                var counter45_5  = 0;
                var counter45_6  = 0;
                var counter45_7  = 0;
                var counter45_8  = 0;
                var counter45_9  = 0;
                var counter45_10 = 0;
                var counter45_11 = 0;
                var counter45_12 = 0;
                var counter45_13 = 0;
                var counter45_14 = 0;
                var counter45_15 = 0;
                var counter45_16 = 0;
                var counter45_17 = 0;
                var counter45_18 = 0;
                var counter45_19 = 0;
                var counter45_20 = 0;
                // =========== To be replaced in future =====================

                for (var i = 0; i < json_data.length; i++){
                    var obj = json_data[i];
                    //console.log("<br> - " + obj['symbol'] + " - " + obj['percent_increase'] + " - " + obj['time_interval']);
                    //tbl_data[obj['time_interval']][obj['percent_increase']]['counter']++;

                    /*for (var key in obj){
                        var value = obj[key];
                        console.log("<br> - " + key + ": " + value);
                    }*/
                    //tbl_data['counter']++;

                    // =========== To be replaced in future =====================

                    if(obj['time_interval'] == 1) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter1_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter1_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter1_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter1_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter1_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter1_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter1_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter1_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter1_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter1_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter1_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter1_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter1_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter1_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter1_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter1_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter1_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter1_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter1_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter1_20++;
                        }
                    } else if(obj['time_interval'] == 3) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter3_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter3_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter3_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter3_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter3_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter3_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter3_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter3_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter3_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter3_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter3_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter3_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter3_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter3_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter3_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter3_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter3_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter3_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter3_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter3_20++;
                        }
                    } else if(obj['time_interval'] == 5) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter5_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter5_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter5_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter5_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter5_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter5_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter5_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter5_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter5_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter5_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter5_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter5_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter5_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter5_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter5_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter5_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter5_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter5_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter5_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter5_20++;
                        }
                    } else if(obj['time_interval'] == 7) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter7_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter7_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter7_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter7_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter7_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter7_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter7_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter7_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter7_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter7_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter7_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter7_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter7_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter7_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter7_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter7_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter7_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter7_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter7_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter7_20++;
                        }
                    } else if(obj['time_interval'] == 10) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter10_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter10_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter10_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter10_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter10_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter10_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter10_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter10_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter10_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter10_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter10_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter10_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter10_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter10_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter10_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter10_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter10_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter10_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter10_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter10_20++;
                        }
                    } else if(obj['time_interval'] == 60) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter60_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter60_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter60_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter60_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter60_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter60_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter60_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter60_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter60_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter60_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter60_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter60_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter60_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter60_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter60_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter60_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter60_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter60_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter60_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter60_20++;
                        }
                    } else if(obj['time_interval'] == 15) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter15_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter15_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter15_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter15_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter15_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter15_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter15_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter15_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter15_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter15_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter15_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter15_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter15_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter15_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter15_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter15_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter15_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter15_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter15_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter15_20++;
                        }
                    } else if(obj['time_interval'] == 30) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter30_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter30_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter30_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter30_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter30_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter30_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter30_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter30_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter30_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter30_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter30_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter30_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter30_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter30_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter30_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter30_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter30_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter30_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter30_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter30_20++;
                        }
                    } else if(obj['time_interval'] == 45) {
                        if(obj['percent_increase'] >= 1 && obj['percent_increase'] < 2) {
                            counter45_1++;
                        } else if(obj['percent_increase'] >= 2 && obj['percent_increase'] < 3) {
                            counter45_2++;
                        } else if(obj['percent_increase'] >= 3 && obj['percent_increase'] < 4) {
                            counter45_3++;
                        } else if(obj['percent_increase'] >= 4 && obj['percent_increase'] < 5) {
                            counter45_4++;
                        } else if(obj['percent_increase'] >= 5 && obj['percent_increase'] < 6) {
                            counter45_5++;
                        } else if(obj['percent_increase'] >= 6 && obj['percent_increase'] < 7) {
                            counter45_6++;
                        } else if(obj['percent_increase'] >= 7 && obj['percent_increase'] < 8) {
                            counter45_7++;
                        } else if(obj['percent_increase'] >= 8 && obj['percent_increase'] < 9) {
                            counter45_8++;
                        } else if(obj['percent_increase'] >= 9 && obj['percent_increase'] < 10) {
                            counter45_9++;
                        } else if(obj['percent_increase'] >= 10 && obj['percent_increase'] < 11) {
                            counter45_10++;
                        } else if(obj['percent_increase'] >= 11 && obj['percent_increase'] < 12) {
                            counter45_11++;
                        } else if(obj['percent_increase'] >= 12 && obj['percent_increase'] < 13) {
                            counter45_12++;
                        } else if(obj['percent_increase'] >= 13 && obj['percent_increase'] < 14) {
                            counter45_13++;
                        } else if(obj['percent_increase'] >= 14 && obj['percent_increase'] < 15) {
                            counter45_14++;
                        } else if(obj['percent_increase'] >= 15 && obj['percent_increase'] < 16) {
                            counter45_15++;
                        } else if(obj['percent_increase'] >= 16 && obj['percent_increase'] < 17) {
                            counter45_16++;
                        } else if(obj['percent_increase'] >= 17 && obj['percent_increase'] < 18) {
                            counter45_17++;
                        } else if(obj['percent_increase'] >= 18 && obj['percent_increase'] < 19) {
                            counter45_18++;
                        } else if(obj['percent_increase'] >= 19 && obj['percent_increase'] < 20) {
                            counter45_19++;
                        } else if(obj['percent_increase'] >= 20 && obj['percent_increase'] < 21) {
                            counter45_20++;
                        }
                    }



                    // =========== To be replaced in future =====================
                }

                json_resp_data = [
                    {'time_interval':1, 'counter1_1':counter1_1, 'counter1_2':counter1_2, 'counter1_3':counter1_3, counter1_4:counter1_4, counter1_5:counter1_5, counter1_6:counter1_6, counter1_7:counter1_7, counter1_8:counter1_8, counter1_9:counter1_9, counter1_10:counter1_10, counter1_11:counter1_11, counter1_12:counter1_12, counter1_13:counter1_13, counter1_14:counter1_14, counter1_15:counter1_15, counter1_16:counter1_16, counter1_17:counter1_17, counter1_18:counter1_18, counter1_19:counter1_19, counter1_20:counter1_20},
                    {'time_interval':3, 'counter3_1':counter3_1, 'counter3_2':counter3_2, 'counter3_3':counter3_3, counter3_4:counter3_4, counter3_5:counter3_5, counter3_6:counter3_6, counter3_7:counter3_7, counter3_8:counter3_8, counter3_9:counter3_9, counter3_10:counter3_10, counter3_11:counter3_11, counter3_12:counter3_12, counter3_13:counter3_13, counter3_14:counter3_14, counter3_15:counter3_15, counter3_16:counter3_16, counter3_17:counter3_17, counter3_18:counter3_18, counter3_19:counter3_19, counter3_20:counter3_20},
                    {'time_interval':5, 'counter5_1':counter5_1, 'counter5_2':counter5_2, 'counter5_3':counter5_3, counter5_4:counter5_4, counter5_5:counter5_5, counter5_6:counter5_6, counter5_7:counter5_7, counter5_8:counter5_8, counter5_9:counter5_9, counter5_10:counter5_10, counter5_11:counter5_11, counter5_12:counter5_12, counter5_13:counter5_13, counter5_14:counter5_14, counter5_15:counter5_15, counter5_16:counter5_16, counter5_17:counter5_17, counter5_18:counter5_18, counter5_19:counter5_19, counter5_20:counter5_20},
                    {'time_interval':7, 'counter7_1':counter7_1, 'counter7_2':counter7_2, 'counter7_3':counter7_3, counter7_4:counter7_4, counter7_5:counter7_5, counter7_6:counter7_6, counter7_7:counter7_7, counter7_8:counter7_8, counter7_9:counter7_9, counter7_10:counter7_10, counter7_11:counter7_11, counter7_12:counter7_12, counter7_13:counter7_13, counter7_14:counter7_14, counter7_15:counter7_15, counter7_16:counter7_16, counter7_17:counter7_17, counter7_18:counter7_18, counter7_19:counter7_19, counter7_20:counter7_20},
                    {'time_interval':10, 'counter10_1':counter10_1, 'counter10_2':counter10_2, 'counter10_3':counter10_3, counter10_4:counter10_4, counter10_5:counter10_5, counter10_6:counter10_6, counter10_7:counter10_7, counter10_8:counter10_8, counter10_9:counter10_9, counter10_10:counter10_10, counter10_11:counter10_11, counter10_12:counter10_12, counter10_13:counter10_13, counter10_14:counter10_14, counter10_15:counter10_15, counter10_16:counter10_16, counter10_17:counter10_17, counter10_18:counter10_18, counter10_19:counter10_19, counter10_20:counter10_20},
                    {'time_interval':15, 'counter15_1':counter15_1, 'counter15_2':counter15_2, 'counter15_3':counter15_3, counter15_4:counter15_4, counter15_5:counter15_5, counter15_6:counter15_6, counter15_7:counter15_7, counter15_8:counter15_8, counter15_9:counter15_9, counter15_10:counter15_10, counter15_11:counter15_11, counter15_12:counter15_12, counter15_13:counter15_13, counter15_14:counter15_14, counter15_15:counter15_15, counter15_16:counter15_16, counter15_17:counter15_17, counter15_18:counter15_18, counter15_19:counter15_19, counter15_20:counter15_20},
                    {'time_interval':30, 'counter30_1':counter30_1, 'counter30_2':counter30_2, 'counter30_3':counter30_3, counter30_4:counter30_4, counter30_5:counter30_5, counter30_6:counter30_6, counter30_7:counter30_7, counter30_8:counter30_8, counter30_9:counter30_9, counter30_10:counter30_10, counter30_11:counter30_11, counter30_12:counter30_12, counter30_13:counter30_13, counter30_14:counter30_14, counter30_15:counter30_15, counter30_16:counter30_16, counter30_17:counter30_17, counter30_18:counter30_18, counter30_19:counter30_19, counter30_20:counter30_20},
                    {'time_interval':45, 'counter45_1':counter45_1, 'counter45_2':counter45_2, 'counter45_3':counter45_3, counter45_4:counter45_4, counter45_5:counter45_5, counter45_6:counter45_6, counter45_7:counter45_7, counter45_8:counter45_8, counter45_9:counter45_9, counter45_10:counter45_10, counter45_11:counter45_11, counter45_12:counter45_12, counter45_13:counter45_13, counter45_14:counter45_14, counter45_15:counter45_15, counter45_16:counter45_16, counter45_17:counter45_17, counter45_18:counter45_18, counter45_19:counter45_19, counter45_20:counter45_20},
                    {'time_interval':60, 'counter60_1':counter60_1, 'counter60_2':counter60_2, 'counter60_3':counter60_3, counter60_4:counter60_4, counter60_5:counter60_5, counter60_6:counter60_6, counter60_7:counter60_7, counter60_8:counter60_8, counter60_9:counter60_9, counter60_10:counter60_10, counter60_11:counter60_11, counter60_12:counter60_12, counter60_13:counter60_13, counter60_14:counter60_14, counter60_15:counter60_15, counter60_16:counter60_16, counter60_17:counter60_17, counter60_18:counter60_18, counter60_19:counter60_19, counter60_20:counter60_20}
                ];
                //console.log(json_resp_data);

                //io.emit('fetch_gain_chart_data', data);
                io.emit('fetch_gain_chart_data', json_resp_data);

            }
        });
        //=============== fetch data from database query
        //io.emit('fetch_gain_chart_data', data);
    }

});

module.exports = app;
