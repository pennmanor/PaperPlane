var username = "";
var room = "";
var socket = io.connect();
var title = "";

$("#changeRoom").modal({
	keyboard: false,
	backdrop: "static"	
});

$("#changeTitle").modal({
	keyboard: false,
	backdrop: "static"	
});
$("#changeTitle").modal("hide");

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
	socket.emit("link", {room:room, username:username, linkTitle:url, url:url, customTitle:title});
	$("#urlInputField").val("");
	$("#urlAlert").hide();
});

$("#urlInfoButton").click(function()
{
	$("#changeTitle").modal("show");
});

$("#setTitleButton").click(function()
{
	title = $.trim($("#urlTitleField").val());
	$("#urlTitleField").val("");
	
	if ( title == "" )
		$("#urlInfoButton").html("Set Title");
	else
		$("#urlInfoButton").html(title);
	$("#changeTitle").modal("hide");
	barResize();
});

$("#changeTitleBackButton").click(function()
{
	$("#changeTitle").modal("hide");
});

$('#urlInputField').keypress(function(e)
{
    if(e.which == 13) {
		url = $("#urlInputField").val();
		prefix = url.split(":")[0];
		if ( prefix != "http" && prefix != "https" )
		{
			$("#urlAlert").show();
			return;
		}
		socket.emit("link", {room:room, username:username, linkTitle:url, url:url, customTitle:title});
		$("#urlInputField").val("");
		$("#urlAlert").hide();
    }
});

function appendLink(user, urlName, url, customTitle)
{
	$("#urlInfoButton").html("Set Title");
	title = '';
	barResize();
	
	if ( customTitle == "" ){
		data = createElement('p');
		insertElementAt(createElement('strong', null, user), data);
		insertElementAt(createText(' posted a link to '), data);
		insertElementAt(createElement('a', {'href':url}, urlName), data);
		$("#chatBody").prepend(data)
	}
	else{
		data = createElement('p');
		insertElementAt(createElement('strong', null, user), data);
		insertElementAt(createText(" posted a link for " + customTitle + " - "), data);
		insertElementAt(createElement('a', {'href':url}, urlName), data);
		$("#chatBody").prepend(data)
	}
}

function barResize(){
	var barSize = $('#chatBody').outerWidth();
	var setButtonSize = $('#urlInfoButton').outerWidth();
	var sendButtonSize = $('#urlSubmitButton').outerWidth();
	
	$('#urlInputField').outerWidth(barSize-setButtonSize-sendButtonSize);
	
}
$(document).ready(function() {
  barResize();
});
$(window).resize(barResize);

socket.on("link", function(data)
{
	if ( data.room == room )
		appendLink(data.username, data.linkTitle, data.url, data.customTitle);
});