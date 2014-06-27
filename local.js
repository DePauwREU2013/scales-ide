var active_file;
var file_tracker = {
    inleft: "",
    inright: ""
};
var debugData;
var lstor = window.localStorage;
var context_pinned = false;
// jQuery
$(document).ready(function() {

	
	// Turn the left editor div (#editor) into an Ace editor:
	  editor = ace.edit('editor');
	  editor.setTheme('ace/theme/monokai');
	  editor.getSession().setMode('ace/mode/scala');
	
	  editor.setOption("wrap", "free");
	  var valstr = "val myVal: Int = 3";
	  for (var i = 0; i < 100; i++) {
	    valstr.concat(" \n");
	  }
	  editor.setValue(valstr);
	
	// Turn the right editor div (#editor2) into an Ace editor:
	  editor2 = ace.edit('editor2');
	  editor2.setTheme('ace/theme/chrome');
	  editor2.getSession().setMode('ace/mode/text');
	
	  editor2.setValue("Over in the left editor, try out some simple variable declarations.\
	\n\nThen try some no-no's. Make it a var, or try one of a few recognized reserved words for your identifier. How about a val, but don't assign anything. What if you tried to assign something, but forgot the integer at the end? Better yet, what if got that part, but forgot the friggin' equals sign?\
	\n\nBy the way, the recognized type names: Int, Float, String, Unit...but we're only assigning integers at the moment. . . and I'm not allowed to build a type system.");
	
	
	  editor2.setOption("wrap", "free");
	
	// Set up toolbar button events
	
	// Create new file
	  $('#create').click( function() {
	    var filename = prompt("Please enter the name of your project:");
	
	    while (projectArray().indexOf(filename) >= 0) {
	      filename = prompt("Project name already in use, please try another name:");
	    }
	
	    if (!editor.getValue()) {
	      alert("Cannot create project with empty file.");
	      return;
	    }
	
	// If they didn't hit cancel:
	    if (filename) {
	      var projectList;
	
	// If this is not the user's first project:
	      if (lstor.scales_projects) {
	
	// Append this project name to their list of projects
	        projectList = lstor.getItem('scales_projects');
	        projectList += ("," + filename);
	      } else {
	
	// Otherwise, this project comprises their entire list.
	        projectList = filename;
	      }
	
	// Save their project list in localStorage
	      lstor.setItem("scales_projects", projectList);
	
	// Create a gist with the new project name.
	      create_gist(filename);
	      display_project_list();
	    }
	  });
	
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
	
	
	// Make context-list resizable:
	  $('#context-list').resizable( {
	    handles: "e"
	  });
	
	// Automatically resize the panels to the right:
	  $('#context-list').on("resize", function() {
	    $('#panels').css('left', parseInt($('#context-list').css('width'))-10 + 'px');
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
	
	// Notify Ace to update its size:
	    editor2.resize();
	  }); 
	
	// $("#resizable").resize
	
	
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
	  display_project_list();
	
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
	  
	  $('#tree').fancytree({
	  	extensions: ["themeroller"]
	  });
 
}); // $(document).ready

function projectArray() {
// If there are projects listed in local storage:
  if (lstor.getItem("scales_projects")) {

// Parse the list into an array:
    return $.csv.toArray(lstor.getItem('scales_projects'));
  } else {
// Otherwise, make projectArray a new, empty Array:
    return new Array();
  }

}
// Displays the list of user's projects in the context window:
function display_project_list() {
  var pArray = projectArray();

  $('#project-list').empty();
// List all the projects in the context-list:
  for (var project in pArray) {
    $('#project-list').append('<li id="' + pArray[project] + '"">' + pArray[project] + '</li>');
  }
}

// Load file content into editor
function load_file(parent_id) {
  if (parent_id == "resizable") {

// If it's open in the other editor, close it there first:
    if (file_tracker.inright == active_file) {
      file_tracker.inright = null;
      editor2.setValue("");
    }

// Keep track of where the file is loaded
    file_tracker.inleft = active_file;

// Load content into editor
    editor.setValue(global_gist_data.data.files[active_file].content);

// Synchronize the global_gist_data object with the editor
// content.
    editor.on('change', function() {

// Verify that a file is still being edited here
      if (file_tracker.inleft) {
        global_gist_data.data.files[file_tracker.inleft].content =
          editor.getValue();
      }
    });
  } else if (parent_id == "autodiv") {

// If it's open in the other editor, close it there first:
    if (file_tracker.inleft == active_file) {
      file_tracker.inleft = null;
      editor.setValue("");
    }


    file_tracker.inright = active_file;
    editor2.setValue(global_gist_data.data.files[active_file].content);
    editor2.on('change', function() {

      if (file_tracker.inright) {
        global_gist_data.data.files[file_tracker.inright].content =
          editor2.getValue();
      }
    });
  }
}


// Create a new Gist with the supplied file name (using a POST
// request--non-functional in jQuery):
function create_gist(filename) {

// Process server's response:
  function reqListener () {
    lstor.setItem(filename, JSON.parse(this.responseText).id);
  }

// Make POST request:
  var oReq = new XMLHttpRequest();
  oReq.onload = reqListener;


  oReq.open("post", "https://api.github.com/gists", true);
var sendJSON = {description: "a file"
                , public:
                true, files:
  {
fname:
    {
content:
      editor.getValue()
    }
  }
                 };
  oReq.send(JSON.stringify(sendJSON));
} // create_gist

// Open a Gist with the provided Gist ID (using a GET request)
function open_gist(gistid) {
  console.log(gistid);
  ace.edit("editor").setValue("");

  $.ajax( {
url: 'https://api.github.com/gists/' + gistid,
type: 'GET',
dataType: 'jsonp'
  }).success( function(gistdata) {
    $('#project-name').html(gistid.toString() + ":");
    $('#file-list').html('');
    for (file in gistdata.data.files) {
      $('#file-list').append('<li id="' + file + '" class="draggable">' + file + '</li>');
    }
    global_gist_data = gistdata;
    $('.draggable').draggable( {
helper: 'clone',
      zIndex: 100,
revert: "invalid",
start: function() {
        active_file = $(this).html();
      }
    });
  }); // $.ajax

}

// Lookup the gist ID for a project name, and pass it to open_gist(gistid):
function open_project(projectName) {
  if (projectArray().indexOf(projectName) >= 0 ) {
    open_gist(lstor.getItem(projectName));
  } else {
    alert("Cannot find project named, " + projectName + ".");

  }
}
