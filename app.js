// Import necessary modules
const express = require('express');
const http = require('http');
const url = require('url');
const request = require('request');
const passport = require('passport');
require('dotenv').config();

// Create Express app
const app = express();

// Initalise Passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user)
});
passport.deserializeUser(function(user, done) {
    done(null, user)
});

// Set viewing engine to Jade
app.set("view engine", "jade");

// Allow serving of static files from the 'public' directory
app.use(express.static('public'));

// Serve Hello World as project root
app.get('/', (req, res) => res.render('index'));

// Serve logged-in dash page
app.get('/dash', function(req, res) {
	request('https://restcountries.eu/rest/v2/alpha/col', function(error, response, body) {
		res.render('dashboard', {
			name: {
				first: 'Zeshan',
				last: 'Amjad'
			},
			balance: JSON.parse(body)['area']
		});
	});
});

// Configure Monzo Authentication
let MonzoStrategy = require('passport-monzo').Strategy;
passport.use(new MonzoStrategy({
		clientID: process.env.MONZO_CLIENT_ID,
		clientSecret: process.env.MONZO_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/auth/monzo/callback'
	},
	function (accessToken, refreshToken, profile, done) {
		let user = {
			accessToken: accessToken,
			refreshToken: refreshToken,
			profile: profile
		};
		return done(null, user);
    }
));

// Endpoint for Monzo authentication
app.get('/auth/monzo', passport.authenticate('monzo'));

// Called after succesful authentication
app.get('/auth/monzo/callback',
	passport.authenticate('monzo', {session: true, failureRedirect: '/login_fail'}),
	function(req, res) {
		console.log("AUTH SUCCESSFUL");
		console.log(req.user);
		res.redirect('/dash');
	}
);

// Listen on Port 3000
app.listen(3000, () => console.log('Listening on Port 3000!'));

// Websocket
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send(1000);
});