var request = require('request');

const baseUrl = "https://api.uber.com/v1.2/estimates/price?"
const TOKEN_KEY = process.env.UBER_TOKEN_KEY ;

const uberMap = {
  "STANDARD" : "uberX",
  "INTERMEDIATE" : "uberXL",
  "CAR_POOL" : "POOL",
  "LUXURY" : "LUXURY" //With Highest rate
}

var filterHandler = function (inputObject, filterBy, callback) {
    var parsedInput = JSON.parse(inputObject);
    var filteredPrice = [];
    if (filterBy != "LUXURY") {
      filteredPrice = parsedInput.prices.filter((eachRideType) => eachRideType.display_name == uberMap[filterBy])
    } else {
      console.log ("Looking for Luxury")
      var sortedPrices = parsedInput.prices.sort((a, b) => b.high_estimate > a.high_estimate)
      filteredPrice.push(sortedPrices[0]);
    }

    if (filteredPrice.length == 1) {
      var parsedUberOutput = {}
      filteredPrice.map (requiredRide => {
        parsedUberOutput.rideName = requiredRide.display_name
        parsedUberOutput.distance = requiredRide.distance
        parsedUberOutput.estimate = requiredRide.estimate
      })
      callback (JSON.stringify(parsedUberOutput))
    }
    
}

module.exports.getRate = (event, context, callback) => {

  var qp = event.queryStringParameters;
  console.log ("Inside get uber Rate for given Address " + JSON.stringify(qp));

  var response = { 
    statusCode: 200,
    body: "",
  };

  var uberRequestObj = {
    url : "",
    headers : {
      "Authorization" : `TOKEN ${TOKEN_KEY}`
    }
  }

  if (qp.start_latitude.length == 0 || 
  qp.start_longitude.length == 0 ||
  qp.end_latitude.length == 0 ||
  qp.end_longitude.length == 0) {
    console.log ("one of the required param is not set to call uber API ");
    response.statusCode = 101;
    response.body = JSON.stringify({errorDescription: "Latitude and Longitiude are needed"});
    callback (null, response);
  }

  uberRequestObj.url = `${baseUrl}start_latitude=${qp.start_latitude}&start_longitude=${qp.start_longitude}&end_latitude=${qp.end_latitude}&end_longitude=${qp.end_longitude}`

  console.log ("Final URL " + uberRequestObj.url);

  request (uberRequestObj, function (error, res, body) {
    if (error) {
      console.log ("error occurred while making the call to uber API " + error)
      response.statusCode = 102;
      response.body = JSON.stringify({errorDescription: error});
      callback (null, response);      
    } else if (res.statusCode == 200) {
      if (qp.filter_by) {
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
      console.log(JSON.stringify(res));
      if (JSON.parse(body).message) {
        response.body = JSON.stringify({errorDescription: JSON.parse(body).message});     
      } else {
        response.body = JSON.stringify({errorDescription: "Some error occurred"});     
      }
      callback (null, response); 
    }
  })
 

};
