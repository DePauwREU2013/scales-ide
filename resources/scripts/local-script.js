
            // jQuery
            $(document).ready(function() {
                

                // Turn the left editor div (#editor) into an Ace editor:
                editor = ace.edit('editor');
                editor.setTheme('ace/theme/monokai');
                editor.getSession().setMode('ace/mode/scala');
                
                // debug
                editor.setValue("123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
                // end-debug

                editor.setOption("wrap","free");                

                // Turn the right editor div (#editor2) into an Ace editor:
                editor2 = ace.edit('editor2');
                editor2.setTheme('ace/theme/monokai');
                editor2.getSession().setMode('ace/mode/scala');
                
                // debug
                editor2.setValue("123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
                // end-debug

                editor2.setOption("wrap","free");                

                // Dialog prompt for new project name:
                $('#create-gist').click( function() {
				    $( "#new-dialog" ).dialog({
				        buttons: {
				            // Create an anonymous gist with language set to
                            // Scala and file name set to dialog input string:
                            "Create": function() {
							    create_gist($('#name').val());
                                $('title').html($('#name').val());
                                $(this).dialog("close");
				            },
                            Cancel: function() {
				                $(this).dialog("close");
                            }
                        } 
                    }); // $("#new-dialog").dialog
                }); // $('#create-gist').click
                
                // Make context-list resizable:
                $('#context-list').resizable({
                    handles: "e"
                });

                // Automatically resize the panels to the right:
                $('#context-list').resize( function(){
                    $('#panels').css('left', 
                        $('#context-list').css('width'));
                });

                // Set resizable container for left Ace editor:
                $( "#resizable" ).resizable({
                    // Handle can be selected as $('.ui-resizable-e').
                    handles: "e"
                });

                // Triggered when panel is resized:
                $("#resizable").resize( function() {
                    
                    // Notify Ace to update its size:
                    editor.resize();

                    // Automatically resize right panel to fill the 
                    // remainder of div#panels:
                    $('#autodiv').css("left",$("#resizable").css("width"));
                    $('#autodiv').css("right", "0");
                    
                    // Notify Ace to update its size:
                    editor2.resize();
                }); // $("#resizable").resize

                // Make items in the context-list draggable:
                $('.draggable').draggable({
                    helper: 'clone',
                    zIndex: 100,
                    revert: "invalid"
                });

                // Make the panels received drag & dropped items:
                $('.droppable').droppable({
                    accept: '.draggable',
                    over: function() {
                        $('.editor').addClass('highlight');
                    },
                    out: function() {
                        $('.editor').removeClass('highlight');
                    }
                })

            }); // $(document).ready

    

            // Create a new Gist with the supplied file name (using a POST
            // request--non-functional in jQuery):
            function create_gist(filename) {
                
                // Process server's response:
                function reqListener () {
                    console.log(this.responseText);
                }

                // Make POST request:
                var oReq = new XMLHttpRequest();
                oReq.onload = reqListener;
                oReq.open("post", "https://api.github.com/gists", true);
                oReq.send('{"description": "New Scales Project", "public": \
                            "true","files": {"'+filename+
                            '": {"content": "please please"}}}');
            }

