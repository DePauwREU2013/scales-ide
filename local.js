// Globals
var active_file, 
    debugData,
	tree,
	lstor,
	workspace;

init_local_storage();

// jQuery
$(document).ready(function() {
	
	init_ace();
	
	init_canvas();	
	
	init_jquery_ui();

	init_parser();

   	load_file_tree();

 	init_toolbar();

});

function init_local_storage() {

	lstor = window.localStorage;

	if (!lstor.getItem("scales_workspace")) {
		lstor.setItem("scales_workspace","[{\"title\":\"Hello World\",\"key\":\"1\",\"folder\":true,\"children\":[{\"title\":\"main.scala\",\"key\":\"2\",\"contents\":\"this is the contents of the file\",\"language\":\"scala\"},{\"title\":\"libscales.scala\",\"key\":\"3\",\"contents\":\"itscales!\",\"language\":\"scala\"}]},{\"title\":\"Goodbye Cruel World\",\"key\":\"4\",\"folder\":true,\"children\":[{\"title\":\"main.scala\",\"key\":\"5\",\"contents\":\"thisisthecontentsofthefile\",\"language\":\"scala\"},{\"title\":\"libscales.scala\",\"key\":\"6\",\"contents\":\"itscales!\",\"language\":\"scala\"}]}]");
	}

	workspace_object = JSON.parse(lstor.getItem("scales_workspace"));
}

/** load_file_tree
 * Initializes fancy tree element using the urrent workspace object
 * as its JSON source.
 */
function load_file_tree() {

	// Create the fancytree object.
	$('#tree').fancytree({  		
		source: workspace_object,

		// When a node is activated (clicked/keyboard):
		activate: function(event, data){
			var node = data.node;		

			// If the node is a file, load its contents to editor:
			if (!node.folder) {
				editor.setValue(node.data.contents);
			}

		}, 
		extensions: ["themeroller"]
	  });
	tree  = $("#tree").fancytree("getTree");
}

/** init_toolbar
 * Creates event listeners for the icons in the toolbar
 */
function init_toolbar() {
	
	// New Project button
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

	// New File button
	$('.icon-file').click( function() {
		// New file
		console.log(this);
	});

	// Save Changes button
	$('.icon-circle-check').click( function() {
		// Save Changes
		console.log(this);
	});

	// Revert Changes button
	$('.icon-trash').click( function() {
		// Revert Changes
		console.log(this);
	});
}

/** Project
 * Constructor for Project objects.
 * @param projectName string representing the title of the project.
 * @return a newly constructed Project object.
 */
function Project(projectName) {
	this.title = projectName;
	this.key = tree.count() + 1;
	this.folder = true;
	this.children = [];
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
	render();
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
	$('#header').resize( function() {
		$('#panels').css('top', parseInt($(this).css('height')) + 9 + "px");
		$('#autodiv').css("left", $("#resizable").css("width"));
	    $('#autodiv').css("right", "0");
		$('#context-list').css('top', 
			parseInt($(this).css('height')) + 9 + "px");
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
	    $('#panels').css('left', 
	    	parseInt($('#context-list').css('width'))-10 + 'px');
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
}

/** init_parser
 * Initializes parser module. Parses code on change, either passing or
 * encountering an exception. If an exception is thrown, it is caught in
 * this function and its details are applied to the editor as annotations.
 */
function init_parser() {
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

