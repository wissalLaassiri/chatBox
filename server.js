// server.js

// set up ======================================================================
// get all the tools we need
require('./config/env-config');
require('./config/passport');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passport = require('passport');
const flash = require('connect-flash');
const chat = require('./models/chatbox.model');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.use(express.static(path.join(__dirname, 'views')));
app.engine('html', require('ejs').renderFile);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(bodyParser.json());

// required for passport
app.use(
	session({
		secret: secret,
		resave: true,
		saveUninitialized: true
	})
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
http.listen(port, () => {
	console.log('Server is running on port ' + port);
});
let users = [];
let id_dis,
	statut,
	statut_discussion = 'en cours',
	count = 0,
	que = chat.que_discussion;

//create new discussion
function CreateDiscussion(que) {
	connection.query(que, function (error, result) {
		if (error) console.log(error);
		else {
			connection.query(chat.que_current_discussion, function (error, rows) {
				if (error) console.log(error);
				if (rows.length > 0) {
					id_dis = rows[0].id_discussion;
					console.log('done');
				}
			});
		}
	});
}
CreateDiscussion(que);

io.on('connection', (socket) => {
	count++;
	console.log('=========================');

	// ifa new client connect we create a new discussion
	if (count > 2) {
		statut = 'en attente';
	} else {
		connection.query(chat.que_update_discussion, [statut_discussion, id_dis], function (error, result) {
			if (error) console.log(error);
		});
	}

	let name = '',
		name2 = '',
		historique = [],
		last;

	users.push(socket.id);

	socket.broadcast.emit('chat message');

	socket.on('set nickname', (msg) => {
		if (msg) name = msg;
	});
	socket.on('set nickname2', (msg) => {
		if (msg) {
			name2 = msg;
			console.log('names ', name, name2);
		}
	});

	socket.on('inputbox', function (msg) {
		if (msg) {
			// get id user
			id = user.id_user;
			console.log('users :   ' + users);
		}
	});
	//show if someone is typing
	socket.on('typing', (data) => {
		alert = 'is typing ....';
		if (data.typing == true) {
			io.sockets.emit('display', data);
			console.log('typiiiinggggg ');
		} else io.sockets.emit('display', data);
	});

	if (statut != 'en attente') {

		socket.on('close conversation', () => {
			statut_discussion = 'TERMINE';
			//insert message at the final of the conversation
			connection.query(chat.que_update_discussion, [statut_discussion, id_dis], function (error, result) {
				if (error) console.log(error);
				else {
					connection.query(que, function (error, result) {
						if (error) console.log(error);
						else {
							connection.query(chat.que_current_discussion, function (error, rows) {
								if (error) console.log(error);
								if (rows.length > 0) {
									id_dis = rows[0].id_discussion;
									console.log('done');
								}
							});
						}
					});
				}
			});
		});
		socket.on('chat message', (data) => {
			console.log('id_discussion ======== ', id_dis);
			historique.push(data.msg);
			last = historique[historique.length - 1];
			console.log(last);
			let class_msg = 'sent-msg';
			let class_msg2 = 'sent-msg';
			let flag = 'N';

			if (name == 'user') {
				class_msg = 'first-msg';
			}
			if (name2 == 'customer') {
				class_msg2 = 'first-msg';
				flag = 'O';
			}

			io.sockets.emit('chat message', {
				msg: data.msg,
				classe: class_msg,
				classe2: class_msg2,
				lastMsg: last
			});

			let msg = data.msg,
				alert;
			//insert msg in the database
			connection.query(chat.que_insertMsg, [user.id_user, msg, flag, id_dis], function (error, result) {
				if (error) console.log(error);
				else {
					connection.query(chat.que_selectMsg, [msg], function (error, result) {
						//
						if (error) console.log(error);
						else {
							console.log(result);
						}
					});
				}
			});
		});
	} else {
		socket.emit('stop client', {
			msg: 'many clients'
		});
		socket.on('close connection', () => {
			console.log('closed !!!!!!!!!');
			socket.disconnect(0);
		});
	}

	socket.on('disconnect', () => {
		statut_discussion = 'TERMINE';
		socket.broadcast.emit('chat message');
		//insert message at the final of the conversation
		connection.query(chat.que_update_discussion, [statut_discussion, id_dis], function (error, result) {
			//
			if (error) console.log(error);
			else {
				connection.query(chat.que_cloture, [id_dis], function (error, result) {
					//
					if (error) console.log(error);
				});
			}
		});
	});

});