var scheduler = require("node-schedule"),
	urlParser = require("url"),
	cheerio = require("cheerio"),
	express = require("express"),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

app.use(express.static("frontend"));

var getURLTitle = true;
var log = new Array();

var rule = new scheduler.RecurrenceRule();
rule.hour = 23;
rule.minute = 0;

var resetJob = scheduler.scheduleJob(rule, function()
{
	log = new Array();
	console.log("Reset links");
});

function saveAndPushLink(link)
{
	log.push(link);
	io.sockets.emit("link", link);
}

io.on("connection", function(socket)
{
	socket.on("resync", function(data)
	{
		for( var i = 0; i < log.length; i++ )
		{
			socket.emit("link", log[i]);
		}
	});
	
	socket.on("link", function(data)
	{
		data.linkTitle = data.url;
		if ( getURLTitle && data.url.split(":")[0] == "http" )
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
					$ = cheerio.load(html);
					title = $("title").html();
					if ( title )
						data.linkTitle = title;
					saveAndPushLink(data);
				});
			}).on('error', function(e) {
				saveAndPushLink(data);
			});
		}
		else
			saveAndPushLink(data);
	});	
});


server.listen(80);
