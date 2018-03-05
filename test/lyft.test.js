'use strict';

var expect = require( 'chai' ).expect;
var LambdaTester = require( 'lambda-tester' );
var lyftApi = require( '../lyft' ).getRate;

describe('lyftapi', function() {
    it( 'test success', function() {
		return LambdaTester( lyftApi )
			.event({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075"
			}})
			.expectResult((result ) => {
				console.log(result.body )
				expect(result.body.indexOf("errorDescription")).to.equal(-1);
                expect( result.body.length).to.be.above(0);

            });
	});

	it ('test failure', function() {
		return LambdaTester( lyftApi )
			.event({"queryStringParameters": {
				"start_latitude":"",
				"start_longitude":"",
				"end_latitude":"",
				"end_longitude":""
			}})
			.expectResult((result ) => {
				console.log ("Result" + result.body)
				expect(result.body.indexOf("errorDescription")).to.not.equal(-1);
                expect( result.body.length).to.be.above(0);

            });		
	})

	it ('test filterByLyft', function () {
		return LambdaTester ( lyftApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "STANDARD"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.parse(result.body));
				expect(result.body.indexOf("Lyft")).to.not.equal(-1);
				expect(result.body.indexOf("Lyft Plus")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})

	it ('test filterByLyftPlus', function () {
		return LambdaTester ( lyftApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "INTERMEDIATE"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("Lyft Plus")).to.not.equal(-1);
				expect(result.body.indexOf("Lyft Premier")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})	

	it ('test filterByCarPool', function () {
		return LambdaTester ( lyftApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "CAR_POOL"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("Lyft Line")).to.not.equal(-1);
				expect(result.body.indexOf("Lyft Plus")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})
	
	it ('test filterByLuxury', function () {
		return LambdaTester ( lyftApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "LUXURY"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("Lyft Lux SUV")).to.not.equal(-1);
				expect(result.body.indexOf("Lyft Line")).to.equal(-1);
				expect(result.body.indexOf("Lyft Plus")).to.equal(-1);
				expect(result.body.indexOf("Lyft Premier")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})

	it( 'test invalid scenario', function() {
		return LambdaTester( lyftApi )
			.event({"queryStringParameters": {
				"start_latitude":"34.2302115",
				"start_longitude":"-118.5535753",
				"end_latitude":"27.9834776",
				"end_longitude":"-82.5370781"
			}})
			.expectResult((result ) => {
				console.log(result.body )
				expect(result.body.indexOf("errorDescription")).to.not.equal(-1); 
				expect( result.body.length).to.be.above(0);
            });
	});	
})

