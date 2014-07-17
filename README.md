scales-ide
==========

A simple web-based IDE for media computation with Scala and the Scales library.

## Setup:

In order to demonstrate the project explorer, you must have some project data in your browser's local storage...
To add the necessary data, open the scales-ide in your browser, then open your browser's JavaScript (Developer) Console. Copy the following command and paste it into the console:

`lstor.setItem("workspace", JSON.stringify([{"title":"Project1","key":"1","folder":true,"children":[{"title":"main.scala","key":"2","contents":"this is the contents of the file","language":"scala"},{"title":"libscales.scala","key":"3","contents":"itscales!","language":"scala"}]},{"title":"Project2","key":"4","folder":true,"children":[{"title":"main.scala","key":"5","contents":"thisisthecontentsofthefile","language":"scala"},{"title":"libscales.scala","key":"6","contents":"itscales!","language":"scala"}]}]))`

## To-do:
###Implement "New File" so that users can add files to their current project.
* Create UI element (button, link, etc.)
* Prompt for new file name
* Create a new file object in the `global_gist_data.data.files[] object`
* Add file name to draggable file list.

###~~Implement Save.~~
* ~~Insert appropriate fields from the `global_gist_data` object into a `PATCH` request to Gist API.~~
* ~~Give user feedback on success/failure.~~
