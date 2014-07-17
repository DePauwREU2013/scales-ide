// Globals

var active_file;
var debugData;
var tree;

// Local Storage
var lstor = window.localStorage;

if (!lstor.getItem("scales_workspace")) {
	init_workspace();
}

var workspace_object = JSON.parse(lstor.getItem("scales_workspace"));

// jQuery
$(document).ready(function() {
{	// Turn the left editor div (#editor) into an Ace editor:
	  editor = ace.edit('editor');
	  editor.setTheme('ace/theme/monokai');
	  editor.getSession().setMode('ace/mode/scala');
	
	  editor.setOption("wrap", "free");
	  var valstr = "val myVal: Int = 3";
	  for (var i = 0; i < 100; i++) {
	    valstr.concat(" \n");
	  }
	  editor.setValue(valstr);
}
	
	// Set the canvas' html attributes 'width' and 'height' to be the same as 
	// its parent container's css attributes for 'width' and 'height'.
	//
	// Changing the canvas' css attributes directly seems to stretch the image.
	$('canvas').attr('width', $('#autodiv').css('width'));
	$('canvas').attr('height', $('#autodiv').css('height'));
	render();
	
	  $('#open-gist').click( function() {
	    var projectName;
	    projectName = prompt("Please enter the project name or Gist ID:");
	
	// If they didn't hit cancel:
	    if (projectName) {
	
	// Try to evaluate the entry as a Gist ID:
	      try {
	// eval(projectName);
	        eval(projectName);
	        open_gist(projectName);
	
	// If the input isn't decimal or hexidecimal, it's a project name:
	      } catch(e) {
	        open_project(projectName);
	      };
	    }
	  });
	
	
	  function readFile(e) {
	
	// If the browser can handle the FileReader API:
	    if (window.File && window.FileReader) {
	
	// The first in the list of opened files is f
	      var f = e.target.files[0];
	
	// If f actually points to a file...
	      if (f) {
	
	// ...then this is its name:
	        fname = f.name; //Global
	
	// the FileReader will read the contents.
	        var r = new FileReader();
	
	// When the file is finished loading:
	        r.onload = function(e) {
	          var contents = e.target.result;
	          $('#file-list').append('<li id="' + fname + '" class="draggable">' + fname + '</li>');
	          global_gist_data = JSON.parse('{\
	"meta": "",\
	"data": {\
	    "description":"",\
	    "files": {}\
	}\
	}');
	
	global_gist_data.data.files[fname] = {"content": contents};
	          $('.draggable').draggable( {
	            helper: 'clone',
	            zIndex: 100,
	            revert: "invalid",
	            start: function() {
	              active_file = $(this).html();
	            }
	          });
	        }
	
	// r is reading the file, f, as text, to be
	// captured in the triggered event, through the
	// r.onload anonymous function
	        r.readAsText(f);
	      }
	
	    } else {
	      console.log("api's not available.");
	    }
	
	  }
	
	// document.getElementById('openLocalFile').addEventListener('change', readFile, false);
	
{ 	// jQuery UI (resizable, droppable, etc.)
	$('#header').resizable({
		handles: "s",
	});

	$('#header').resize( function() {
		$('#panels').css('top', parseInt($(this).css('height')) + 9 + "px");
		$('#autodiv').css("left", $("#resizable").css("width"));
	    $('#autodiv').css("right", "0");
		$('#context-list').css('top', parseInt($(this).css('height')) + 9 + "px");
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		render();
	});
	
	// Make context-list resizable:
	  $('#context-list').resizable( {
	    handles: "e"
	  });
	
	// Automatically resize the panels to the right:
	  $('#context-list').on("resize", function() {
	    $('#panels').css('left', parseInt($('#context-list').css('width'))-10 + 'px');
	    $('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
	  	render();
	  });
	
	// Set resizable container for left Ace editor:
	  $( "#resizable" ).resizable( {
	    // Handle can be selected as $('.ui-resizable-e').
	    handles: "e"
	  });
	
	// Triggered when panel is resized:
	  $("#resizable").resize( function() {
	
	// Notify Ace to update its size:
	    editor.resize();
	
	// Automatically resize right panel to fill the
	// remainder of div#panels:
	    $('#autodiv').css("left", $("#resizable").css("width"));
	    $('#autodiv').css("right", "0");
		$('#current-file').css('right',$('#resizable').css('right'));
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		render();
    	
	  }); 
	
	
	// Make the panels received drag & dropped items:
	  $('.droppable').droppable( {
	    accept: '.draggable',
	    over: function() {
	      $('.editor').addClass('highlight');
	    },
	    out: function() {
	      $('.editor').removeClass('highlight');
	    },
	    drop: function() {
	      load_file($(this).attr('id'));
	      console.log(this);
	    }
	  })
}	
	  // Syntax checking/error reporting
	  editor.on("change", function(e) {
	    try {
	      editor.getSession().clearAnnotations();
	      parser.parse(editor.getValue());
	    } catch(exn) {
	      if (!editor.getSession().$annotations) {
	        editor.getSession().$annotations = new Array();
	      }
	
	      var myAnno = {
	        "column": exn['column'],
	        "row": exn['line'] - 1,
	        "type": "error",
	        "raw": exn['message'],
	        "text": exn['message']
	      };
	      
	      editor.getSession().$annotations.push(myAnno);
	      editor.getSession().setAnnotations(editor.getSession().$annotations);
	    }
	  });

	  load_file_tree();

	  
	  
 	$('#current-file').css('right', $('#resizable').css('right'));


 	/*Toolbar events * * * * * * * * * * * * * * * * * * * * 
 	 *                                                     *
 	 * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	$('.icon-folder').click( function() {
		var project_name =  prompt ("Choose a name for this project:")
		workspace_object.push(new Project(project_name) );	
		tree.reload();
		workspace_object[workspace_object.length-1].children.push({
			"title": "main.scala",
			"key": tree.count() + 1,
			"language": "scala",
			"content": ""
		});
		tree.reload();
	});

	$('.icon-file').click( function() {
		// New file
		console.log(this);
	});

	$('.icon-circle-check').click( function() {
		// Save Changes
		console.log(this);
	});

	$('.icon-trash').click( function() {
		// Revert Changes
		console.log(this);
	});

}); // $(document).ready

function load_file_tree() {
	$('#tree').fancytree({  		
		source: workspace_object,
		// [{"title":"Project1","key":"1","folder":true,"children":[{"title":"main.scala","key":"2","contents":"this is the contents of the file","language":"scala"},{"title":"libscales.scala","key":"3","contents":"itscales!","language":"scala"}]},{"title":"Project2","key":"4","folder":true,"children":[{"title":"main.scala","key":"5","contents":"thisisthecontentsofthefile","language":"scala"},{"title":"libscales.scala","key":"6","contents":"itscales!","language":"scala"}]}],
		activate: function(event, data){
			// A node was activated: display its title:
			
			var node = data.node;
		
			editor.setValue(node.data.contents);
			console.dir(node);
		}, 
		extensions: ["themeroller"]
	  });
	tree  = $("#tree").fancytree("getTree");
}

// Project constructor:
function Project(projectName) {
	this.title = projectName;
	this.key = tree.count() + 1;
	this.folder = true;
	this.children = [];
}

function render() {
	var c = document.querySelector('canvas');
	var ctx = c.getContext("2d");
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,50,50);
}

function init_workspace() {
	lstor.setItem("scales_workspace","[{\"title\":\"Hello World\",\"key\":\"1\",\"folder\":true,\"children\":[{\"title\":\"main.scala\",\"key\":\"2\",\"contents\":\"this is the contents of the file\",\"language\":\"scala\"},{\"title\":\"libscales.scala\",\"key\":\"3\",\"contents\":\"itscales!\",\"language\":\"scala\"}]},{\"title\":\"Goodbye Cruel World\",\"key\":\"4\",\"folder\":true,\"children\":[{\"title\":\"main.scala\",\"key\":\"5\",\"contents\":\"thisisthecontentsofthefile\",\"language\":\"scala\"},{\"title\":\"libscales.scala\",\"key\":\"6\",\"contents\":\"itscales!\",\"language\":\"scala\"}]}]");
}