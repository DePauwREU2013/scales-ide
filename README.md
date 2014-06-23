scales-ide
==========

A simple web-based IDE for media computation with Scala and the Scales library.

## To-do:
###Implement "New File" so that users can add files to their current project.
* Create UI element (button, link, etc.)
* Prompt for new file name
* Create a new file object in the `global_gist_data.data.files[] object`
* Add file name to draggable file list.

###Give each panel a context indicator.
* It should be apparent which file is open in each editor (especially if there are blank files).

###Implement Save.
* Insert appropriate fields from the `global_gist_data` object into a `PATCH` request to Gist API.
* Give user feedback on success/failure.

###Add a context for output.
* List it in the draggable context/file list UI.
* Handle it differently than a file.

