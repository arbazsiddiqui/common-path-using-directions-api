var express = require('express');
var router = express.Router()

var secretKey = require('../config/key');
router.post('/commonpath', function (req, res, next) {

    var map = require('google_directions'); //a library to use google maps directions api

    //define parameters for path A
    var paramsA = {
        origin: req.body.originA,
        destination: req.body.destA,
        key: secretKey.key
    };

    // parameters for path B
    var paramsB = {
        origin: req.body.originB,
        destination: req.body.destB,
        key: secretKey.key
    };

    //call the getDirections function for path A
    map.getDirections(paramsA, function (err, dataA) {
        if (err) {
            console.log(err);
            return 1;
        }

        //in the dataA response we will have all the information of path
        //including a coded string "overview_polyline" that contains all the coordinates of the path

        var polyline = require('polyline'); //library to decode polyline string
        //decode the polyline and store all the coordinates of path in an array
        var coordinatesA = polyline.decode(dataA.routes[0].overview_polyline.points);

        //call the getDirections function for path B
        map.getDirections(paramsB, function (err, dataB) {
            if (err) {
                console.log(err);
                return 1;
            }
            var commonCoordinates = {}; //json to be returned
            var polyline = require('polyline');
            //decode the polyline and store all the coordinates of path in an array
            var coordinatesB = polyline.decode(dataB.routes[0].overview_polyline.points);

            //get the first common coordinates from both the array
            //this will be the starting coordinate of common path
            var flag = 0;
            for (var i = 0; i < coordinatesA.length; i++) {
                for (var j = 0; j < coordinatesB.length; j++) {
                    if (coordinatesA[i][0] == coordinatesB[j][0] && coordinatesA[i][1] == coordinatesB[j][1]) {
                        commonCoordinates['start'] = coordinatesA[i];
                        flag = 1;
                        break;
                    }
                }
                if (flag) {
                    break;
                }
            }

            //get the last common coordinates from both the array
            //this will be the ending coordinate of common path
            flag = 0;
            for (i = coordinatesA.length - 1; i >= 0; i--) {
                for (j = coordinatesB.length - 1; j >= 0; j--) {
                    if (coordinatesA[i][0] == coordinatesB[j][0] && coordinatesA[i][1] == coordinatesB[j][1]) {
                        commonCoordinates['end'] = coordinatesA[i];
                        flag = 1;
                        break;
                    }
                }
                if (flag) {
                    break;
                }
            }
            //return the coordinates
            return res.json(commonCoordinates);
        });
    });


});

module.exports = router;
