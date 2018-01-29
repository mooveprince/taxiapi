'use strict';

var expect = require( 'chai' ).expect;
var LambdaTester = require( 'lambda-tester' );
var uberApi = require( '../uber' ).getRate;

describe('uberapi', function() {
   it( 'test success', function() {
		return LambdaTester( uberApi )
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
		return LambdaTester( uberApi )
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

	it ('test filterByUberX', function () {
		return LambdaTester ( uberApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "STANDARD"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("uberX")).to.not.equal(-1);
				expect(result.body.indexOf("uberXL")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})

	it ('test filterByUberXL', function () {
		return LambdaTester ( uberApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "INTERMEDIATE"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("uberXL")).to.not.equal(-1);
				expect(result.body.indexOf("POOL")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})	

	it ('test filterByCarPool', function () {
		return LambdaTester ( uberApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "CAR_POOL"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("POOL")).to.not.equal(-1);
				expect(result.body.indexOf("uberX")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})
	
	it ('test filterByLuxury', function () {
		return LambdaTester ( uberApi )
			.event ({"queryStringParameters": {
				"start_latitude":"37.7752315",
				"start_longitude":"-122.418075",
				"end_latitude":"37.7752415",
				"end_longitude":"-122.518075",
				"filter_by" : "LUXURY"
			}})
			.expectResult ((result) => {
				console.log ("Result " + JSON.stringify(result.body));
				expect(result.body.indexOf("SUV")).to.not.equal(-1);
				expect(result.body.indexOf("uberX")).to.equal(-1);
				expect(result.body.indexOf("POOL")).to.equal(-1);
				expect(result.body.indexOf("BLACK")).to.equal(-1);
				expect(result.body.indexOf("SELECT")).to.equal(-1);
                expect( result.body.length).to.be.above(0);
			})
	})
})

