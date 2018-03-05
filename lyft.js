var request = require('request');

const baseUrl = "https://api.lyft.com/v1/cost?"
const TOKEN_KEY = process.env.LYFT_TOKEN_KEY;

const lyftMap = {
  "STANDARD" : "lyft",
  "INTERMEDIATE" : "lyft_plus",
  "CAR_POOL" : "lyft_line",
  "LUXURY" : "LUXURY" //With Highest rate
}

var filterHandler = function (inputObject, filterBy, callback) {
    var parsedInput = JSON.parse(inputObject);
    var filteredPrice = [];
    if (filterBy != "LUXURY") {
      filteredPrice = parsedInput.cost_estimates.filter((eachRideType) => eachRideType.ride_type == lyftMap[filterBy])
    } else {
      console.log ("Looking for Luxury")
      var sortedPrices = parsedInput.cost_estimates.sort((a, b) => b.estimated_cost_cents_max > a.estimated_cost_cents_max)
      filteredPrice.push(sortedPrices[0]);
    }

    if (filteredPrice.length == 1) {
      var parsedLyftOutput = {}
      filteredPrice.map (requiredRide => {
        parsedLyftOutput.rideName = requiredRide.display_name
        parsedLyftOutput.distance = requiredRide.estimated_distance_miles;
        parsedLyftOutput.estimate = "$"+requiredRide.estimated_cost_cents_max/100;
      })
      callback (JSON.stringify(parsedLyftOutput))
    }
    
}

module.exports.getRate = (event, context, callback) => {

  var qp = event.queryStringParameters;
  console.log ("Inside get Lyft Rate for given Address " + JSON.stringify(qp));

  var response = { 
    statusCode: 200,
    body: "",
  };

  var lyftRequestObj = {
    url : "",
    headers : {
      "Authorization" : `bearer ${TOKEN_KEY}`
    }
  }

  if (qp.start_latitude.length == 0 || 
    qp.start_longitude.length == 0 ||
    qp.end_latitude.length == 0 ||
    qp.end_longitude.length == 0) {
    console.log ("one of the required param is not set to call Lyft API ");
    response.statusCode = 101;
    response.body = JSON.stringify({errorDescription: "Latitude and Longitiude are needed"});
    callback (null, response);
  }

  lyftRequestObj.url = `${baseUrl}start_lat=${qp.start_latitude}&start_lng=${qp.start_longitude}&end_lat=${qp.end_latitude}&end_lng=${qp.end_longitude}`

  console.log ("Final URL " + lyftRequestObj.url);

  request (lyftRequestObj, function (error, res, body) {
    if (error) {
      console.log ("error occurred while making the call to Lyft API " + error)
      response.statusCode = 200;
      response.body = JSON.stringify({errorDescription: error});
      callback (null, response);      
    } else if (res.statusCode == 200 ) {
      if (JSON.parse(body).cost_estimates.length == 0) {
        response.statusCode = 200;
        response.body = JSON.stringify({errorDescription: "No service offered here"});;
        callback (null, response);
      } else if (qp.filter_by) {
        filterHandler (body, qp.filter_by, function (filteredResponse) {
          response.body = filteredResponse;
          callback (null, response);
        });
      } else {
        response.body = body;
        callback (null, response);
      }
    } else {
      console.log ("Expected status code 200. Actual Status code " + res.statusCode );
      response.statusCode = res.statusCode;
      response.body = JSON.stringify({errorDescription: "Some error occurred"});     
      callback (null, response); 
    }
  })
 

};
