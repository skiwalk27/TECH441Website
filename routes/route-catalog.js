const database = require('../data/database');
const crypto = require('crypto');

module.exports = app => {
    app.get('/', async (req, res) => {
        const data = await database.select(`select * from location`);
        if (data[0].length === 0) return res.sendStatus(404);
        var admin = 0;
        var user = "";
        if (req.user) {
            admin = req.user.admin;
            user = req.user.username;
        }
        res.render('catalog', {
            data: data[0],
            values: data[0][0],
            loggedIn: req.user,
            admin: admin,
            user: user,
            layout: 'index',
        });
    });

   app.get('/bookings', async (req, res) => {
        var data = 0;
        var data2;

        if (req.user) {
            var admin = req.user.admin;
            if (admin) {
                data = await database.select(`select * from packtocustomer`);
            }
            else{
                data = await database.select(`select * from packtocustomer where personID = '${req.user.id}'`);
            }
        }

        data2 =  await database.select('select * from location');
        data2[0].unshift('garbage');  //used to properly index Data2 in comparison to Data

        res.render('bookings', {
            data: data[0],
            values: data2[0],
            loggedIn: req.user,
            admin: admin,
            user: req.user.username,
            layout: 'index'
        });
    });

    app.get('/:id', async (req, res) => {
        var data2;

        const packId = req.params.id;
        const data = await database.select(`select * from location where packId = '${packId}'`);

        if (req.user) {
            data2 = await database.select(`select orderID from packtocustomer where packID = '${packId}' and personID = '${req.user.id}'`);
            data2 = data2[0].length === 0 ? 0 : 1;
        }

        if (data[0].length === 0) return res.sendStatus(404);
        var admin = 0;
        var user = "";
        if (req.user) {
            admin = req.user.admin;
            user = req.user.username;
        }
        res.render('packView', {
            data: data[0][0],
            reserved: data2,
            loggedIn: req.user,
            admin: admin,
            user: user,
            layout: 'index'
        });
    });

    app.post('/:id/add', async (req, res) => {
        const userID = req.user.id;
        const id = crypto.randomInt(0, 10000);
        database.select('insert into packtocustomer (orderID, personID, packID) values (' + id + ', ' + userID + ', ' + req.params.id + ')')
        res.redirect('/' + req.params.id);
    })

    app.post('/:id/remove', async (req, res) => {
        const userID = req.user.id;
        database.select('delete from packtocustomer where packID = ' + req.params.id + ' and personID = ' + userID);
        res.redirect('/' + req.params.id);
    })


}