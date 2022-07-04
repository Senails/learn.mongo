import mongodb, { ObjectId } from 'mongodb';
import bodyParser from 'body-parser';
import express from 'express';
import expressHandlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import flash from 'connect-flash';


let secret = 'qwerty';
let app = express();
const handlebars = expressHandlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: {
        rand: function() {
            return '' + Math.random();
        }
    }
});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.use(cookieParser(secret));
app.use(expressSession({
    secret: secret,
    resave: true,
    saveUninitialized: true
}));
app.use(flash())
app.use(bodyParser.urlencoded({ extended: true }));
let mongoClient = new mongodb.MongoClient('mongodb://localhost:27017/', {
    useUnifiedTopology: true
});








mongoClient.connect(async function(error, mongo) {
    if (!error) {
        let db = mongo.db('test');
        let coll = db.collection('prods');

        app.get('/prods/:name', async function(req, res) {
            let prod = await coll.find({ name: req.params.name }).project({ _id: 0 }).toArray();
            if (prod.length == 0) {
                res.render('404')
            } else {
                res.render('page', {
                    prod: prod[0]
                })
            }
        });




        app.get('/prods', async function(req, res) {
            let prods = await coll.find().toArray();

            res.render('prods', {
                prods: prods,
                mes: req.flash('mess')
            });
        });

        app.get('/prods/edit/:name', async function(req, res) {

            let prod = (await coll.find({ name: req.params.name }).project({ _id: 0 }).toArray())[0];

            res.render('edit', {
                name: prod.name,
                cost: prod.cost,
                rest: prod.rest
            });
        })

        app.post('/prods/edit/:name', async function(req, res) {
            let body = req.body

            coll.updateOne({ name: req.params.name }, { $set: { cost: body.cost, rest: body.rest } })

            req.flash('mess', (req.params.name) + ' был изменен')

            res.redirect('/prods');
        });






        app.post('/prods/add/', async function(req, res) {
            let name1 = req.body.name;
            let cost1 = req.body.cost;
            let rest1 = req.body.rest;
            if (name1 != '' & cost1 != '' & rest1 != '') {
                let prod = {
                    name: name1,
                    cost: cost1,
                    rest: rest1
                }
                await coll.insertOne(prod)
                req.flash('mess', (name1) + ' был добавлен')
            }
            res.redirect('/prods');
        });
        app.get('/prods/delete/:name/:rand', async function(req, res) {
            await coll.deleteOne({ name: req.params.name })

            req.flash('mess', (req.params.name + ' был удален'))

            res.redirect(301, '/prods');
        });

    } else {
        console.error(err);
    }
});


























































































app.listen(3000, function() {
    console.log('running');
});
//11