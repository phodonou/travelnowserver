
const express = require("express");
const Amadeus = require('amadeus');
const bodyParser = require('body-parser');

const amadeus = new Amadeus({
    clientId: 'PbF84xvmAkGEGJbYOHoBj4lHAQzjeU5K',
    clientSecret: 'ZWRmCAivSVUGwgH4'
});

// Set up the express app
const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/inspirationSearch', (req, res) => {
    const origin = req.body.origin; //true
    amadeus.referenceData.locations.get({
        keyword : origin,
        subType : Amadeus.location.city
    }).then(function (response) {
        console.log(response.data);
        res.status(200).send(response.data)
    }).catch(function (responseError) {
        console.log(responseError);
        res.status(400).send(responseError)
    });
});

app.post('/book', async (req, res) => {
    try {
        let airports = await amadeus.referenceData.locations.airports.get({
            longitude : parseFloat(req.body.longitude),
            latitude  : parseFloat(req.body.latitude)
        })

        let hotels = await amadeus.shopping.hotelOffers.get({
            cityCode : 'CHI' //"req.originCityCode"
        })
        
        hotels.result.data.filter(h => {return (h.hotel.rating > req.body.minStars) && (h.offers[0].price.total<req.body.budget)}).sort((a,b)=> {
            if(a.hotel.hotelDistance > b.hotel.hotelDistance) return 1; if (b.hotel.hotelDistance > a.hotel.hotelDistance) return -1; return 0;
        });

        res.status(200).send(hotels.result.data)
    } catch(responseError) {
        console.log(responseError);
        res.status(400).send(responseError)
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});
