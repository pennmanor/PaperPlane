var username = "";
var room = "";
var socket = io.connect();

$("#changeRoom").modal({
	keyboard: false,
	backdrop: "static"	
});
$("#changeRoom").modal("show");
$("#urlAlert").hide();
$("#changeRoomFormAlert").hide();

$("#changeRoomButton").click(function()
{
	location.reload();
});

$("#joinRoomButton").click(function()
{
	tmpUsername = $("#usernameField").val();
	tmpRoom = parseInt($("#roomNumberField").val());
	if ( tmpUsername != "" && tmpRoom )
	{
		$("#chatBody").html("");
		username = tmpUsername
		room = tmpRoom;
		$("#roomNumber").html(room);
		$("#changeRoom").modal("hide");
		$("#changeRoomFormAlert").hide();
		socket.emit("resync");
	}
	else
	{
		if ( !tmpRoom )
			$("#changeRoomFormAlert").html("Please enter a number in the room field.");
		if ( tmpUsername == "" )
			$("#changeRoomFormAlert").html("Please fill out the name field.");
		$("#changeRoomFormAlert").show();
	}
});

$("#urlSubmitButton").click(function()
{
	url = $("#urlInputField").val();
	prefix = url.split(":")[0];
	if ( prefix != "http" && prefix != "https" )
	{
		$("#urlAlert").show();
		return;
	}
		
	socket.emit("link", {room:room, username:username, linkTitle:url, url:url});
	$("#urlInputField").val("");
	$("#urlAlert").hide();
});


function appendLink(user, urlName, url)
{
	chatBody = $("#chatBody").html();
	chatBody = "<strong>"+user+"</strong> posted a link to <a href=\""+url+"\">"+urlName+"</a><br><br>"+chatBody;
	$("#chatBody").html(chatBody);
}

socket.on("link", function(data)
{
	if ( data.room == room )
		appendLink(data.username, data.linkTitle, data.url);
});