var express = require('express');
var router = express.Router();

router.post('/get_all_users', function (req, res, next) {
    req.getConnection(function (err, connection) {
        //var query = "SELECT * FROM user";

        var query = "SELECT user_id, user_name, first_name, last_name, phone_no, NULL AS group_id, NULL AS group_display_name, NULL AS group_name, 'individual' AS chat_type " +
                    "FROM user " +
                    "WHERE deleted_at IS NULL " +

                    " UNION ALL " +

                    "SELECT NULL AS user_id, NULL AS user_name, NULL AS first_name, NULL AS last_name, NULL AS phone_no, group_id, group_display_name, group_name, 'group_chat' AS chat_type " +
                    "FROM chat_groups " +
                    "WHERE deleted_at IS NULL " +
                    " AND group_id IN ( SELECT DISTINCT group_id FROM chat_group_users WHERE user_id = "+ req.session.userid +" AND deleted_at IS NULL ) ";

        connection.query(query, function (err, rows) {
            if (rows.length) {
                //console.log('here comes the db users');
                //console.log(rows);

                // response will be in JSON
                res.end(JSON.stringify(rows));
            }
        });
    });
});

router.post('/get_previous_chat', function (req, res, next) {
    req.getConnection(function (err, connection) {
        //var query = "SELECT * FROM user";

        console.log(req.body.sender_id +'___________'+ req.body.receiver_id);

        if(req.body.chat_type == 'individual') {
            var query = "SELECT m.id, ufr.user_name AS from_user_name, ufr.first_name AS from_first_name, ufr.last_name AS from_last_name, m.message, " +
                " uto.user_name AS to_user_name, uto.first_name AS to_first_name, uto.last_name AS to_last_name, " +
                " DATE_FORMAT(m.message_datetime,'%d-%m-%Y %h:%m %p') AS message_datetime, " +
                " DATE_FORMAT(m.message_datetime,'%h:%m %p') AS message_time, m.message_from, ufr.phone_no AS from_phone_no " +
                " FROM messages m " +
                " LEFT JOIN user ufr ON ufr.user_id = m.message_from " +
                " LEFT JOIN user uto ON uto.user_id = m.message_to " +
                " WHERE m.delete_state = 0 " +
                " AND (m.message_from = '"+ req.body.sender_id +"' OR m.message_to = '"+ req.body.sender_id +"' ) " +
                " AND (m.message_from = '"+ req.body.receiver_id +"' OR m.message_to = '"+ req.body.receiver_id +"') " +
                " AND m.message_type = 0 " +
                " ORDER BY m.message_datetime ASC ";
        } else if(req.body.chat_type == 'group_chat') {
            var query = "SELECT m.id, ufr.user_name AS from_user_name, ufr.first_name AS from_first_name, ufr.last_name AS from_last_name, m.message, " +
                " cgr.group_display_name, cgr.group_name, " +
                " DATE_FORMAT(m.message_datetime,'%d-%m-%Y %h:%m %p') AS message_datetime, " +
                " DATE_FORMAT(m.message_datetime,'%h:%m %p') AS message_time, m.message_from, ufr.phone_no AS from_phone_no " +
                " FROM messages m " +
                " LEFT JOIN user ufr ON ufr.user_id = m.message_from " +
                " LEFT JOIN chat_groups cgr ON cgr.group_id = m.group_id " +
                " WHERE m.delete_state = 0 " +
                " AND (m.group_id = '"+ req.body.receiver_id +"') " +
                " AND m.message_type = 1 " +
                " ORDER BY m.message_datetime ASC ";
        }

        connection.query(query, function (err, rows) {
            if (rows.length) {
                //console.log('here comes the previous chat');
                //console.log(rows);

                // response will be in JSON
                res.end(JSON.stringify(rows));
            }
        });
    });
});

/* GET home page. */
router.get('/home', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
        }

        res.render('home', data );
    } else {
        res.redirect('/login');
    }
});

router.get('/dashboard', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'dashboard';
        }

        res.render('dashboard', data );
    } else {
        res.redirect('/login');
    }
});

router.get('/gain_chart', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'gain_chart';
        }

        res.render('gain_chart', data );
    } else {
        res.redirect('/login');
    }
});

router.post('/get_detail_charts_data', function (req, res, next) {
    req.getConnection(function (err, connection) {
        // console.log(req.body.time_interval);

        var time_interval = req.body.time_interval;
        var percent_value = req.body.percent_value;
        var percent_value_max = parseInt(parseInt(percent_value) + 1);
        //console.log(time_interval +'___________'+ percent_value+'____________'+percent_value_max);

        var query = " SELECT " +
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
            " HAVING percent_increase >= "+ percent_value +" AND percent_increase < "+ percent_value_max +" ORDER BY percent_increase DESC ";

        connection.query(query, function (err, rows) {
            if (rows.length) {
                //console.log('here comes the previous chat');
                //console.log(rows);

                // response will be in JSON
                res.end(JSON.stringify(rows));
            }
        });
    });
});


router.get('/messenger', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        //console.log(req.session.username);
        if(req.session.username)
        {
            data.username = req.session.username;
        }
        res.render('messenger', data );
    } else {
        res.redirect('/login');
    }
});

router.get('/private_chat', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
        }
        res.render('private_chat', data);
    } else {
        res.redirect('/login');
    }
});

router.get('/group_chat', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
        }
        res.render('group_chat', data);
    } else {
        res.redirect('/login');
    }
});

router.get('/gain_table', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'gain_table';
        }

        res.render('gain_table', data );
    } else {
        res.redirect('/login');
    }
});

router.get('/gain_table_v2', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'gain_table_v2';
        }

        res.render('gain_table_v2', data );
    } else {
        res.redirect('/login');
    }
});

router.get('/gain_table_v3', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username)
        {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'gain_table_v3';
        }

        res.render('gain_table_v3', data );
    } else {
        res.redirect('/login');
    }
});


module.exports = router;
