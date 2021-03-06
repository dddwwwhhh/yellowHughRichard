var LocalStrategy = require('passport-local').Strategy;
var mysqlConnection = require(__dirname + '/database.js');
var bcrypt = require('bcryptjs');
var logger = require(__dirname + '/logger.js')
var flash = require('connect-flash');
var middleware = require(__dirname + '/middleware.js');

module.exports = function(passport) {

    function checkIsSame(string1, string2, done) {
        logger.info("string1: " + string1);
        logger.info("string2: " + string2);
        if (string1 === string2) {
            logger.info("correct password");
            done(null, { id: "username", password: string2 });
        } else {
            logger.warn("incorrect password");

            done(null, null);

        }
    }

    function signinCheck(req, username, password, callback, done) {
        // check if req has all required field

        //user prepared query
        var sql = 'select salt, hash from user where username = ?;';
        var inserts = [username];
        sql = mysqlConnection.format(sql, inserts);
        logger.info("signinCheck sql: " + sql);
        mysqlConnection.query(sql, function(err, rows, fields) {
            if (!err) {
                if (rows[0] != null && rows[0].hash != null) {
                    if (bcrypt.compareSync(password, rows[0].hash)) {
                        logger.info("correct password");
                        middleware.saveLoginHistory(req, username);
                        done(null, { id: username });
                    } else {
                        logger.info("incorrect password");
                        done(null, false, req.flash('signInMessage', 'Your username or password does not match what we have on file.'));
                    }
                } else {
                    logger.info("NO SUCH USER");
                    done(null, false, req.flash('signInMessage', 'Your username or password does not match what we have on file.'));
                }
            } else {
                logger.error("query error");
                done(null, null, req.flash('signInMessage', 'SERVER ERROR, PLEASE TRY AGAIN LATER'));
            }
        });
    };

    function signupCheck(req, username, password, addUser, user, done) {


        var sql = 'select username from user where username = ?;';
        var inserts = [username];
        sql = mysqlConnection.format(sql, inserts);
        // logger.info("signupCheck sql: " + sql);

        mysqlConnection.query(sql, function(err, rows, fields) {
            if (!err) {
                if (rows[0] != null) {
                    logger.info(JSON.stringify(rows[0]));
                    logger.info("user already exist");
                    return done(null, false, req.flash('signUpMessage', 'USER ALREADY EXIST'));

                } else {
                    if (typeof addUser === 'function') {
                        addUser(user, username, password, done);
                        return done(null, { id: username });

                    } else {
                        logger.error("callback is not a function");
                        return done(null, false, req.flash('signUpMessage', 'SERVER ERROR'));

                    }
                }
            } else {
                logger.error("query error");
                done(null, null, req.flash('signUpMessage', 'SERVER ERROR, PLEASE TRY AGAIN LATER'));
            }
        });
    }

    function addUser(user, username, password) {
        logger.info("user: " + JSON.stringify(user));

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        var first_name = user.first_name || "";
        logger.info("addUser firstname: " + first_name);
        var last_name = user.last_name || "";
        var phone_number = user.phone_number || "";
        var email = user.email || "";
        var gender = user.gender || "";
        var income = parseInt(user.income) || "";
        var date_of_birth = user.date_of_birth || "";
        var address = user.address || "";
        var sql = 'insert into user (username, salt, hash, first_name, last_name,phone_number,email, gender, income, date_of_birth, address)' +
            ' values (?,?,?,?,?,?,?,?,?,?,?)';
        var inserts = [username, salt, hash, first_name, last_name, phone_number, email, gender, income, date_of_birth, address];
        sql = mysqlConnection.format(sql, inserts);
        logger.info("addUser sql: " + sql);

        mysqlConnection.query(sql,
            function(err, rows, fields) {
                if (!err) {
                    logger.info("add user to database: " + username + "\t" + salt + "\t" + hash);
                } else {
                    logger.warn("qurey error");
                }
            });
    }

    function createUserObject(body) {
        var user = {
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number,
            email: body.email,
            gender: body.gender,
            income: parseInt(body.income),
            date_of_birth: body.date_of_birth,
            address: body.address
        };
        logger.info("firstname: " + user.first_name);

        return user;
    }

    function isValidSignUpParameters(body) {
        if (body.first_name && body.last_name &&
            body.phone_number && body.email &&
            body.gender && body.birthdate && body.income &&
            body.address &&
            body.username && body.password) {
            return true;
        }
        return false;
    }

    function isValidSignInParameters(body) {
        if (body.username && body.password) {
            return true;
        }
        return false;
    }

    passport.serializeUser(function(user, done) {
        // body...
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        done(null, { id: id });
    });
    passport.use('local-signin', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, username, password, done) {
            console.log("signin parameters：" + JSON.stringify(req.body));
            if (!isValidSignInParameters(req.body)) {
                console.log("invalide parameters");
                return done(null, false, req.flash('signInMessage', 'invalide request parameters'));
            } else {
                signinCheck(req, username, password, checkIsSame, done);
            }
        }));


    passport.use('local-signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, username, password, done) {
            logger.info("signup req.body is: " + JSON.stringify(req.body));
            // check if req has all required field
            if (!isValidSignUpParameters(req.body)) {
                console.log("invalide parameters");
                return done(null, false, req.flash('signUpMessage', 'invalide request parameters'));
            } else {
                var user = createUserObject(req.body);
                logger.info("usasdfaer is: " + JSON.stringify(user));
                signupCheck(req, username, password, addUser, user, done);
            }
        }));
};
