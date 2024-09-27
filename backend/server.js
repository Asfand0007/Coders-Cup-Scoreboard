require('dotenv').config()
const {getRanking}= require('./controllers.js')
const express = require('express')
const app = express()

app.get('/api/ranking', getRanking);
// app.get('/api/houseRanking', getHouseRanking)


app.get('/', (req, res)=>{
    res.send('Scoreboard');
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
})