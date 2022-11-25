// require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

const baseUrl = "https://coinranking.com/"

let arrayTitles = [

    "name",
    "price",
    "marketCap",
    "24hr"
]

const coinPrices = []
const priceData = async() => {

    try {
        const { data } = await axios.get(baseUrl)
        const $ = cheerio.load(data)
        const selected = $('#__layout > div > div.coins > div:nth-child(3) > table > tbody')
        selected.children().each((iTr, eleTr) => {
            let arrayIndex = 0
            const coinObject = {}
            if (iTr < 50) {
                const text = $(eleTr).children().each((i, ele) => {
                    let info = $(ele).children('div').text().replace(/\s\s+/g, "")
                        // if (arrayIndex === 0) {
                        //     info = $('.profile__rank', $(ele).html()).text().trim()
                        // }
                        //
                    if (arrayIndex === 0) {
                        info = $('.profile__link', $(ele).html()).text().trim()
                    }
                    if (info) {
                        coinObject[arrayTitles[arrayIndex]] = info
                        arrayIndex++
                    }

                })
                coinPrices.push(coinObject)
                console.log(coinPrices)
            }
        })

    } catch (error) {
        console.log(error.message)
    }
}


app.get("/", (req, res) => {
    res.send(`<h1>Coin-Prices API</h1>`)
})





app.get("/api/coins-prices", async(req, res) => {
    try {
        const prices = await priceData()
        res.status(200).json({ result: coinPrices })

    } catch (error) {
        console.log(error.message)
    }
})

app.get("/api/coins-prices/:coinId", async(req, res) => {
    const coinId = req.params.coinId
    try {
        const { data } = await axios.get("https://coinpricesapi.herokuapp.com/api/coins-prices")
        const wanted = data.result
        const coin = wanted.filter((ele) => ele.name === coinId)
        res.status(200).json({ count: coin.length, coin })

    } catch (error) {
        console.log(error.message)
    }
})


const run = async() => {
    try {
        app.listen(port, () => {
            console.log(`server is listening on port: ${port}...`)
        })

    } catch (error) {
        console.log(error.message)
    }
}
run()