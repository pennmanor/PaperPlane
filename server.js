/*
  Copyright 2013 Penn Manor School District, Andrew Lobos, and Benjamin Thomas

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var fs = require("fs"),
	scheduler = require("node-schedule"),
	urlParser = require("url"),
	cheerio = require("cheerio"),
	express = require("express"),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

io.set('log level', 1); // Stop socket.io debug output

process.chdir(__dirname); // Change working directory to server.js's directory

config = JSON.parse(fs.readFileSync("config.json")); // Load config.json

var log = new Array();

// Configure node-schedule to reset links and files
var rule = new scheduler.RecurrenceRule();
rule.hour = 23;
rule.minute = 0;

var resetJob = scheduler.scheduleJob(rule, function()
{
	log = new Array();

	fs.readdir("uploads", function (err, files)
	{
		if ( err )
		{
			console.log("Failed to remove uploads: "+err);
			return;
		}

		for ( var i = 0; i < files.length; i++ )
		{
			if ( files[i] != "index.html")
			{
				fs.unlink("uploads/"+files[i], function(err)
				{
					if ( err )
						console.log("Removing upload \"uploads/"+files[i]+"\" failed: "+err);
				});
			}
		}
	});

	console.log("Files and links reset");
});

// Configure express
app.use(express.static("frontend"));
app.use(express.bodyParser());

app.use("/uploads", express.static("uploads"));

// Handler used by file uploads
app.post("/uploadHandler", function(req,res)
{
	if ( !req.param("room") || !req.param("username") )
	{
		res.send("NO");
		return;
	}

	uploadedFile = req.files.file;
	if ( !uploadedFile )
	{
		res.send("You didn't send a file!");
		return;
	}

	if ( uploadedFile.type != "application/pdf" )
	{
		res.send("Bad file type");
		return;
	}

	if ( uploadedFile.size > 4194304 )
	{
		res.send("Invalid Size");
		return;
	}

	fs.readFile(uploadedFile.path, function(err, data)
	{
		var fsName = (Math.floor(new Date().getTime()/1000))+uploadedFile.name;
		var fTitle = req.param("title");
		if ( !fTitle )
			fTitle = uploadedFile.name;
		fs.writeFile("uploads/"+fsName, data, function(err)
		{
			f = {type:"file", username: req.param("username"), fileName: uploadedFile.name, fsFileName: fsName, title: fTitle, room: req.param("room")};
			log.push(f);
			console.log(req.connection.remoteAddress+"("+req.param("username")+") uploaded "+uploadedFile.name+ " to "+req.param("room"));
			io.sockets.emit("file", f);
		});
	});
	
	res.send("OK");
});

io.on("connection", function(socket)
{
	// Event for "resyncing" a client with the room's history
	socket.on("resync", function(data)
	{
		for( var i = 0; i < log.length; i++ )
		{
			if ( data.room == log[i].room )
				socket.emit(log[i].type, log[i]);
		}
	});
	
	// Event for submitting a link
	socket.on("link", function(data)
	{
		if ( !data.room || !data.username )
			return;

		data.type = "link";
		data.linkTitle = data.url;
		console.log(socket.handshake.address.address+"("+data.username+") posted "+data.url+" in "+data.room);
		
		// If the URL is http ( not SSL ), attempt to connect and pull the data from the page's <title>
		if ( config.autoTitle && data.url.split(":")[0] == "http" )
		{
			url = urlParser.parse(data.url);
			var options = {
				host: url.hostname,
				path: url.pathname,
				port: 80,
				method: "GET",
				headers: {
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36"
				}
			};
			
			http.get(options, function(res) {
				var html = "";
				res.on("data", function(chunk)
				{
					html += chunk;
				});	
	
				res.on("end", function()
				{	
					contentType = res.getHeader("content-type");
					if ( contentType == "text/html" )
					{
						try
						{		
							$ = cheerio.load(html);
							title = $("title").html();
						} catch(e) {} 
					}
					if ( title )
						data.linkTitle = title;
					log.push(data);
					io.sockets.emit("link", data);
					
				});
			}).on('error', function(e) {
				log.push(data);
				io.sockets.emit("link", data);
			});
		}
		else // Otherwise, send it out with the URL as the title
		{
			log.push(data);
			io.sockets.emit("link", data);
		}
	});	
});

// Bind HTTP server, and switch to unprivileged user
server.listen(config.HTTPport);
if ( config.changeUser )
{
	process.setgid(config.group);
	process.setuid(config.user);
}
