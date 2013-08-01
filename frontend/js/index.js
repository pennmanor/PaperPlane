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
	$("#urlInfoButton").html("Set Title");
	$("#fileInfoButton").html("Set Title");
	title = '';
	$("#urlInputField").val("");
	$("#urlAlert").hide();
	barResize();
});

$("#urlInfoButton").click(function()
{
	$("#changeTitle").modal("show");
});

$("#fileInfoButton").click(function()
{
	$("#changeTitle").modal("show");
});

$("#setTitleButton").click(function()
{
	title = $.trim($("#urlTitleField").val());
	$("#urlTitleField").val("");
	$("#fileTitleField").val("");
	
	if ( title == "" ){
		$("#urlInfoButton").html("Set Title");
		$("#fileInfoButton").html("Set Title");
	}
	else{
		$("#urlInfoButton").html(title);
		$("#fileInfoButton").html(title);
	}	
	$("#changeTitle").modal("hide");
	barResize();
});

$("#changeTitleBackButton").click(function()
{
	$("#changeTitle").modal("hide");
});

$('#usernameField').keypress(function(e)
{
    if(e.which == 13) {
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
		
    }
});

$('#roomNumberField').keypress(function(e)
{
    if(e.which == 13) {
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
		
    }
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
		$("#urlInfoButton").html("Set Title");
		$("#fileInfoButton").html("Set Title");
		title = '';
		socket.emit("link", {room:room, username:username, linkTitle:url, url:url, customTitle:title});
		$("#urlInputField").val("");
		$("#urlAlert").hide();
    }
});

function appendLink(user, urlName, url, customTitle)
{	
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
		insertElementAt(createText(" posted a link: " + customTitle + " - "), data);
		insertElementAt(createElement('a', {'href':url}, urlName), data);
		$("#chatBody").prepend(data)
	}
}

function barResize(){
	var barSize = $('#chatBody').outerWidth();
	var setUrlButtonSize = $('#urlInfoButton').outerWidth();
	var sendUrlButtonSize = $('#urlSubmitButton').outerWidth();
	var setFileButtonSize = $('#fileInfoButton').outerWidth();
	var sendFileButtonSize = $('#fileSubmitButton').outerWidth();
	
	$('#urlInputField').outerWidth(barSize-setUrlButtonSize-sendUrlButtonSize);
	if(document.getElementById("fileInput").files.length == 0)
		$('#fileInputField').outerWidth(barSize-setFileButtonSize-sendFileButtonSize - $('#fileUploadButton').innerWidth());
	else
		$('#fileInputField').innerWidth(barSize-setFileButtonSize-sendFileButtonSize - $('#fileUploadButton').innerWidth() - $('#fileRemoveButton').innerWidth());
	
}
$(document).ready(function() {
  barResize();
});

$(window).resize(barResize);

$('a[data-toggle="tab"]').on('shown', function (e) {
	barResize();
});

$('#fileInput').change(function (evt){
	barResize();
});

$("#fileSubmitButton").click(function()
{
	var fileObj = document.getElementById("fileInput");
	if ( fileObj.files.length == 0 )
		return;
	
	var f = new FormData();
	f.append("file", fileObj.files[0]);
	f.append("room", room);
	f.append("username", username);
	f.append("title", title);
	
	$("#urlInfoButton").html("Set Title");
	$("#fileInfoButton").html("Set Title");
	title = '';
	$("#loading").modal("show");
	$.ajax({
		"url": "/uploadHandler",
		data: f,
		contentType: false,
		processData: false,
		type: "POST",
		success: function ()
		{
			$('.fileupload').fileupload('reset');
			barResize();
			$("#loading").modal("hide");
		}
	});
	
});

socket.on("link", function(data)
{
	if ( data.room == room )
		appendLink(data.username, data.linkTitle, data.url, data.customTitle);
});

socket.on("file", function(data)
{
	if ( data.room == room )
	{	
		ele = createElement('p');
		insertElementAt(createElement('strong', null, data.username), ele);
		insertElementAt(createText(' posted a file: '), ele);
		insertElementAt(createElement('a', {'href':"uploads/"+data.fsFileName}, data.title), ele);
		$("#chatBody").prepend(ele);
	}
});