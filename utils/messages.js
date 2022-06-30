const moment = require('moment');
const db_connection = require('./../connections');

function formatMessage(username, message) {
    return {
        username,
        message,
        time: moment().format('h:mm a')
    };
}

function formatMessageRoom(room_name, username, message, phone_no) {
    return {
        room_name,
        username,
        message,
        phone_no,
        time: moment().format('h:mm a')
    };
}

function formatMessageObject(data) {
    return {
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
        phone_no: data.phone_no,
        time: moment().format('h:mm a')
    };
}

function save_message_db(data) {
    var msq_datetime = moment().format('YYYY-MM-DD H:mm:s');

    if(data.message_type == 0) {    // INDIVIDUAL MESSAGE
        var sql = "INSERT INTO messages (message_type, message_from, message_to, message, message_datetime) values ('" + data.message_type + "' , '" + data.sender_id + "', '" + data.receiver_id + "', '" + data.message + "', '"+ msq_datetime +"' )";
    } else if(data.message_type == 1) {    // GROUP MESSAGE
        var sql = "INSERT INTO messages (message_type, message_from, message_to, group_id, message, message_datetime) values ('" + data.message_type + "' , '" + data.sender_id + "', '" + data.receiver_id + "', '" + data.receiver_id + "', '" + data.message + "', '"+ msq_datetime +"' )";
    }

    db_connection.query(sql, function (err, rows) {
        if (err){
            console.log("Error Selecting : %s ", err);
        }else{
            console.log("Message saved successfully");
        }
    });
}

function get_gain_chart_data() {
    /*db_connection.query("SELECT symbol, MIN(open) AS open, MAX(close) AS close, ceil((((MAX(close) - MIN(open)) / MIN(open)) * 100)) AS percent_increase, 10 AS time_interval FROM crypto_feed WHERE start_date >= '2022-06-14 01:11:00' AND end_date <= '2022-06-14 01:21:00' GROUP BY symbol", function (err, result, fields) {
        if (err) throw err;
        //console.log(result);

        return result;
    });
    */
    var ret_data = null;
    db_connection.query("SELECT symbol, MIN(open) AS open, MAX(close) AS close, ceil((((MAX(close) - MIN(open)) / MIN(open)) * 100)) AS percent_increase, 10 AS time_interval FROM crypto_feed WHERE start_date >= '2022-06-14 01:11:00' AND end_date <= '2022-06-14 01:21:00' GROUP BY symbol", function (err, rows) {
        if (rows.length) {
            //console.log('here comes the db users');
            //console.log(JSON.stringify(rows));

            // response will be in JSON
            ret_data = JSON.stringify(rows);
        }

        //console.log(ret_data);

        return ret_data;
    });

}


module.exports = {
    formatMessage,
    formatMessageObject,
    formatMessageRoom,
    save_message_db,
    get_gain_chart_data,
};