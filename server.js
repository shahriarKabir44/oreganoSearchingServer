const express = require('express')
require('dotenv').config()
const graphqlHTTP = require('express-graphql');
const cors = require('cors')
require('dotenv').config()
const cluster = require('cluster');
const mongoose = require('mongoose');
const AvailableItem = require('./schemas/availableItem');
mongoose.connect(process.env.mongodb_local,
    { useNewUrlParser: true, useUnifiedTopology: true })
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        cluster.fork();
    });

} else {
    startExpress();
}


function startExpress() {

    let app = express()
    app.use(express.json())
    app.use(cors())
    app.set('view engine', 'ejs')
    app.use(express.static('static'))

    app.get('/getLocalAvailableItems/:userId/:region', (req, res) => {
        AvailableItem.find({
            $and: [
                { day: { $gte: Math.floor(((new Date()) * 1) / (24 * 3600 * 1000)) } },
                { region: req.params.region },
                { userId: { $ne: req.params.userId } }
            ]
        }).distinct('tag').then(data => {
            res.send({ data: data })
        })
    })

    app.use('/graphql', graphqlHTTP.graphqlHTTP(req => (
        {
            schema: require('./graphql/graphql.search.schema'),
            graphiql: true
        }
    )));


    app.listen(process.env.PORT || 4000)
}
