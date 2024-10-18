const database = require('../data/database');
const req = require("express/lib/request");

const passport = require("passport");
var LocalStrategy = require("passport-local");
const crypto = require("crypto");
const express = require("express");

passport.use(new LocalStrategy( async function verify(username, password, cb) {
    const data = await database.select('select * from users where username = "' + [username] + '"');
    if (data[0].length === 0) { return cb(null, false, { message: 'Incorrect username or password.'}); }

    crypto.pbkdf2(password, data[0][0].salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        const buf = Buffer.from(data[0][0].password, "utf-8");
        var buf2 = hashedPassword.toString();
        buf2 = Buffer.from(buf2);
        if (err) {return cb(err); }
        try {
            if (!crypto.timingSafeEqual(buf, buf2)) {
                return cb(null, false, { message: 'Incorrect username or password.'});
            }
        }
        catch(err) {
            return cb(null, false, {message: 'Incorrect username or password.'});
        }
        return cb(null, data[0][0]);
    });
}));

passport.serializeUser(function (username, cb) {
    process.nextTick(function () {
        if (username.id)
        {
            cb(null, { id: username.id, username: username.username, admin: username.admin});
        }
        else
        {
            cb(null, { id: username.personID, username: username.username, admin: username.admin});
        }

    });
});
passport.deserializeUser(function (username, cb) {
    process.nextTick(function () {
        return cb(null, username);
    });
});

module.exports = app => {
    app.get("/login", (req, res) => {
        res.render("login");
    });
    app.post('/login/password', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    }));
    app.get('/logout', function(req, res, next) {
        req.logout(function(err){
            if (err) { return next(err); }
            res.redirect('/');
        });
    })
    app.get('/signup', (req, res) => {
        res.render('signup');
    })

    app.post('/signup', (req, res) => {
        const salt = crypto.randomBytes(16).toString('utf-8');
        const id = crypto.randomInt(0, 10000);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) {return next(err); }
            const admin = req.body.admin === 'on' ? 1 : 0;
            const sql = `INSERT INTO users (personID, username, password, salt, admin) VALUES ( `+id+`,'`+[req.body.username]+`','`+[hashedPassword.toString()]+`','`+[salt]+`',`+[admin]+`)`
            database.select(sql);

            const user = {
                username: req.body.username,
                id: id,
                admin: admin
            };
            req.login(user, function (err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        });

    });
}

