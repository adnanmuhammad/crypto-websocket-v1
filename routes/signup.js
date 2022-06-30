var express = require('express');
var router = express.Router();


router.post('/signupuser', function (req, res, next) {
    var response = new Object();

    var user_name = req.body.user_name;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;

    var user_password = req.body.user_password;
    var user_email    = req.body.user_email;
    var phone_no      = req.body.phone_no;

    var err_msg = '';
    if(user_name.trim() === '') {
        err_msg += 'User name is requred. <br>';
    }

    if(first_name.trim() === '') {
        err_msg += 'First name is requred. <br>';
    }

    if(last_name.trim() === '') {
        err_msg += 'Last name is requred. <br>';
    }

    if(user_password.trim() === '') {
        err_msg += 'Password is requred. <br>';
    }

    if(user_email.trim() === '') {
        err_msg += 'Email is requred. <br>';
    }

    if(phone_no.trim() === '') {
        err_msg += 'Phone number is requred. <br>';
    }

    if(err_msg !== '') {
        response.error = true;
        response.message = err_msg;
        res.end(JSON.stringify(response));
        return false;
    }

    //console.log(user_name +' ________ '+first_name +'________'+last_name);
    req.getConnection(function (err, connection) {
        var query = "INSERT into user (user_name, first_name, last_name, user_password, user_email, phone_no, user_createdon) values ('" + req.body.user_name + "' , '" + req.body.first_name + "', '" + req.body.last_name + "', '" + req.body.user_password + "', '" + req.body.user_email + "' , '" + req.body.phone_no + "', NOW() )";
        connection.query(query, function (err, rows) {
            if (err){
                //console.log("Error Selecting : %s ", err);
                response.error = true;
                response.message = 'User not registered.';
                res.end(JSON.stringify(response));
            }else{
                //console.log("New User added successfully");
                response.success = true;
                response.message = 'User Regsitered Successfully.';
                res.end(JSON.stringify(response));
            }
            //res.render('customers', {page_title: "Customers - Node.js", data: rows});
        });

    });

    //res.send(response);
    //res.end(JSON.stringify(rows));
});


/* GET users listing page */
router.get('/users', function (req, res, next)
{
    if(req.session && req.session.username) {
        var data = new Object();
        if(req.session.username) {
            data.username = req.session.username;
            data.userid = req.session.userid;
            data.phone_no = req.session.phone_no;
            data.route_name = 'users';
        }
        res.render('users', data);
    } else {
        res.redirect('/login');
    }

});

module.exports = router;
