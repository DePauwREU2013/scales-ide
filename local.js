// Globals
var active_file,
	current_buffer, 
	debugData,
	tree,
	lstor,
	workspace,
	worker,
	HOST,
	SOURCE;

init_local_storage();

/** document.ready
 *
 */
$(document).ready(function() {
	
	init_ace();
	
	init_canvas();	
	
	init_jquery_ui();

	init_editor_events();

 	load_file_tree();

 	init_toolbar();

});

/** init_local_storage
 * Sets up localStorage (lstor), creating default workspace if none
 * already exists in lstor. Initilizes workspace buffer object from lstor.
 */
function init_local_storage() {

	// abbreviation for window.localStorage
	lstor = window.localStorage;

	// If no workspace is represented in the lstor, create a default:
	if (!lstor.getItem("scales_workspace")) {
		lstor.setItem("scales_workspace", "[{\"title\":\"default.scala\",\"key\":\"1\",\"contents\":\"this is the contents of the file\",\"language\":\"scala\",\"dirty\":false},{\"title\":\"resource.scala\",\"key\":\"2\",\"contents\":\"/*This is an example of a second file in your project.*/\",\"language\":\"scala\",\"dirty\":false}]");
	}

	// Populate the workspace buffer from the lstor:
	workspace = JSON.parse(lstor.getItem("scales_workspace"));
}

/** load_file_tree
 * Initializes fancy tree element using the urrent workspace object
 * as its JSON source.
 */
function load_file_tree() {

	// Create the fancytree object:
	$('#tree').fancytree({  		
		source: workspace,
		debugLevel: 0,
		// When a node is activated (clicked/keyboard):
		activate: function(event, data){
			var node = data.node;

			// Enable the ACE editor:		


			// If this is the first file activated this session:
			if (editor.getReadOnly()) {
				editor.setReadOnly(false);

			// Else, the user has just switched from another file	
			} else {

			}
	
	        // Set active_file to the newly activated file:
			active_file = node;	

			// Load document contents into editor:
			editor.setValue(workspace[get_index()].contents);
		}, 
		// Apply jQueryUI theme:
		extensions: ["themeroller"]
	  });

	// Initialize global variable tree to the fancyTree object:
	tree  = $("#tree").fancytree("getTree");
}

/** init_toolbar
 * Creates event listeners for the icons in the toolbar
 */
function init_toolbar() {
	
	// New File button
	$('#new-file-button').click( function() {
		// New file
		file_name = prompt("Enter a name for the file:");
		if (file_name) {
  		workspace.push({
  		  "title": file_name,
  		  "language": "scala",
  		  "key": tree.count() +1,
  		  "contents": "",
  		  "dirty": false
		  });
		}
  
		// Save the workspace to local storage
		$('#save-changes-button').trigger("click");
	
	}); 

	// Save Changes button
	$('#save-changes-button').click( function() {
		lstor.setItem("scales_workspace", JSON.stringify(workspace));
		console.log("clicked.");
		tree.reload();
	});
	// Zoom out button
	$('#zoom-out-button').click( function() {
		editor.setOption('fontSize', editor.getOption('fontSize') - 2);
	});
	// Zoom In button
	$('#zoom-in-button').click( function() {
		editor.setOption('fontSize', editor.getOption('fontSize') + 2);
	});

	// Build & Run button
	$('#build-run-button').click( function() {
		HOST = null;
		HOST = prompt("Enter the url for the compile server:","test.php");
		if (HOST) {

			// Save the workspace to local storage
			$('save-changes-button').click();

			// Send the source code to the compiler and execute the result:
			var build_request = $.ajax({
  				type: "POST",
 				url: HOST,
 				data: JSON.stringify(workspace,undefined,2),
 				dataType: "text",
 				contentType: "text/plain",

 				// If it compiles, get the scripts it produced:
 				success: function (data) {

 					// TODO: remove hard-coded file names
 					
 					// Get the scala-js object code:
 					$.getScript('example-fastopt.js').success( function(data) {
 						// After it's loaded, get the launcher:
 						$.get('example-launcher.js').success( function(data) {
 							// After the launcher is loaded, execute it:
 							eval(data);
 						});
 					});
				}
 			});
		}
	});
}

/** init_ace
 * Initializes the ACE editor.
 */
function init_ace() {
	// Turn the editor div (#editor) into an Ace editor:
	editor = ace.edit('editor');
	editor.setTheme('ace/theme/monokai');
	editor.getSession().setMode('ace/mode/scala');

	// Wrap text based on size of editor panel:
	var valstr = "/* Welcome to the Scales IDE.";
	valstr += "\nTo use this editor, either choose a file from the list on the left\n";
	valstr += "or create a New File using the button at the top.";
	editor.setValue(valstr);
	editor.setOption("wrap", "free");
	editor.setOption('fontSize', 14);
	editor.setReadOnly(true);
}

/** init_canvas
 * Sets the canvas' html attributes 'width' and 'height' to be the same as 
 * its parent container's css attributes for 'width' and 'height'.
 *
 * Changing the canvas' css attributes directly seems to stretch the image.
 */
function init_canvas() {
	$('canvas').attr('width', $('#autodiv').css('width'));
	$('canvas').attr('height', $('#autodiv').css('height'));
	render(); //Redraw canvas
}

/** init_jquery_ui
 * Initializes jQueryUI elements (resizable, draggable, etc.)
 */
function init_jquery_ui() {

	// Make header resizable with a handle on the bottom.
	$('#header').resizable({
		handles: "s",
	});

	// Triggered on header resize: resize other elements to fit:
	// (Magic numbers used to ensure accomodation for resize handles.)
	$('#header').resize( function() {
		$('#panels').css('top', parseInt($(this).css('height')) + 9 + "px");
		$('#autodiv').css("left", $("#resizable").css("width"));
	    $('#autodiv').css("right", "0");
		$('#context-list').css('top', 
			parseInt($(this).css('height')) + 9 + "px");
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		render(); // Redraw canvas
	});
	

	// Make context-list resizable with a handle on the right:
	$('#context-list').resizable( {
    	handles: "e"
  	});

	// Triggered on context-list (project explorer) resize...
	// Automatically resize the panels to the right:
	// (Magic numbers used to ensure accomodation for resize handles.)
	$('#context-list').on("resize", function() {
		$('#panels').css('left', 
			parseInt($('#context-list').css('width'))-10 + 'px');
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		render(); // Redraw canvas
  	});

	// Set resizable container for Ace editor with handle to right:
	$( "#resizable" ).resizable( {
    	handles: "e"
  	});
	
	// Triggered when Ace editor panel is resized:
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
		render(); // Redraw canvas
	  }); 
}


/** exec_parser
 *
 */
function exec_parser() {

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
    } // catch(exn)
}

function get_index() {
	return active_file.key - 1;
}

/** update_buffer
 *
 */
function update_buffer() {

	
	workspace[get_index()].contents = editor.getValue();
	// Find the approprate file in the workspace
}

/** init_parser
 * Initializes parser module. Parses code on change, either passing or
 * encountering an exception. If an exception is thrown, it is caught in
 * this function and its details are applied to the editor as annotations.
 */
function init_editor_events() {
  // Syntax checking/error reporting
  editor.on("change", function(e) {
  	exec_parser();
  	update_buffer();
  });

}

/** render()
 * renders the red square on the canvas.
 */
function render() {
	var c = document.querySelector('canvas');
	var ctx = c.getContext('2d');
	ctx.fillStyle = '#FF0000';
	ctx.fillRect(0,0,50,50);
}

/** window.onbeforeunload
 * If the user has made changes to the buffered workspace, but not saved them
 * to local storage, they will be bugged by a confirm pop-up if they try to 
 * navigate away from (or reload) the IDE.
 */
window.onbeforeunload = function() {
	document.querySelector('#save-changes-button').click();
};


function post_str(str, server) {
  $.ajax({
    type: "POST",
    url: server,
    data: str,
    success: function( data) {
      
    }
  });
}

function build() {
  post_str(SOURCE, HOST);
}

console.log('Type help for a list of commands.');

help = "The following commands are available:\
  post_str(<source>, <host>), wherein <source> is a stringified version of the JSON you want to send to the server and <host> is the server's URL.\
  \
  You can also set environment variables: SOURCE and HOST as follows:\
  One you have set the env variables, you can simlpy call build(), and the contents of SOURCE will be sent to, HOST.";

  function toggleFullScreen() {
  	if (document.querySelector('#output').mozRequestFullScreen)
  		document.querySelector('#output').mozRequestFullScreen();
  	else if (document.querySelector('#output').webkitRequestFullscreen)
  		document.querySelector('#output').webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
    document.addEventListener("keydown", function(e) {
    	if (e.keyCode == 13 && e.altKey) {
      		toggleFullScreen();
      	}

    });