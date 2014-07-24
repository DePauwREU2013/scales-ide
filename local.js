// Globals
var active_file,
	  current_buffer, 
    debugData,
	  tree,
	  lstor,
	  workspace,
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

			// If the node is a file, load its contents to editor:
			if (node) {
			  
			  // If there's already a file open, copy the editor contents into the 
			  // file's workspace object:
			  console.log("active_file: "  + active_file);
        if (active_file && active_file.data.dirty) {
          get_related(active_file).contents = editor.getValue();
        }
        if (tree) {
          tree.reload();
        }
        // Set active_file to the newly activated file:
				active_file = node;
				
				// Update web page title:
				document.title = get_related(active_file).title
				
				// Load document contents into editor:
				editor.setValue(active_file.data.contents);
			}
		}, 
		// beforeActivate: function(event, data){},
		
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
  
	  $('#save-changes-button').trigger("click");
	}); 
	  
		console.log(this);


	// Save Changes button
	$('#save-changes-button').click( function() {
	  // Saves all changes:
	  get_related(active_file).contents = editor.getValue();
		lstor.setItem("scales_workspace", JSON.stringify(workspace));
		for (var f in workspace) {
			workspace[f].dirty = false;
		}
		document.title = get_related(active_file).title;
		tree.reload();
	});

	// Revert Changes button
	$('.icon-trash').click( function() {
		// Revert Changes
		console.log(this);
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
	var valstr = "// Welcome to the Scales IDE.";
	editor.setValue(valstr);
	editor.setOption("wrap", "free");
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

function get_related(active) {
	for (var f in workspace) {
		if (workspace[f].key === active.key) {
			return workspace[f];
		}
	}
}

/** update_buffer
 *
 */
function update_buffer() {
	var buffer_version = get_related(active_file);
	
	buffer_version.dirty = (buffer_version.contents != editor.getValue());
	if (buffer_version.dirty) {
	  document.title = get_related(active_file).title + '*';  
	} else {
	  document.title = get_related(active_file).title;
	}

	console.log(buffer_version.dirty);
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
	var ctx = c.getContext("2d");
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,50,50);
}

/** window.onbeforeunload
 * If the user has made changes to the buffered workspace, but not saved them
 * to local storage, they will be bugged by a confirm pop-up if they try to 
 * navigate away from (or reload) the IDE.
 */
window.onbeforeunload = function() {
	// If workspace and lstor["scales_workspace"] have diffrent values
	if (lstor.getItem("scales_workspace") !== JSON.stringify(workspace)) {
		return "This page is asking you to confirm that you want to leave - data you have entered may not be saved.";
	} else {
		return;
	}
};


function post_str(str, server) {
  $.ajax({
    type: "POST",
    url: server,
    data: str,
    success: function( data) {
      cosole.log(data);
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