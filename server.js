var fs = require("fs"),
	scheduler = require("node-schedule"),
	urlParser = require("url"),
	cheerio = require("cheerio"),
	express = require("express"),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

app.use(express.static("frontend"));
app.use(express.bodyParser());

app.use("/uploads", express.static("uploads"));

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


app.post("/uploadHandler", function(req,res)
{
	uploadedFile = req.files.file;
	console.log(req.files);
	if ( !uploadedFile )
		res.send("You didn't send a file!");
		
	fs.readFile(uploadedFile.path, function(err, data)
	{
		var fsName = (new Date().getTime())+uploadedFile.name;
		var fTitle = req.param("title");
		if ( !fTitle )
			fTitle = uploadedFile.name;
		fs.writeFile("uploads/"+fsName, data.toString(), function(err)
		{
			f = {type:"file", username: req.param("username"), fileName: uploadedFile.name, fsFileName: fsName, title: fTitle, room: req.param("room")};
			log.push(f);
			io.sockets.emit("file", f);
		});
	});
	
	res.send("OK");
});

io.on("connection", function(socket)
{
	socket.on("resync", function(data)
	{
		for( var i = 0; i < log.length; i++ )
		{
			socket.emit(log[i].type, log[i]);
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
