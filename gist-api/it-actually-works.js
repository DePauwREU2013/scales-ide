function reqListener () {
  console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.onload = reqListener;
oReq.open("post", "https://api.github.com/gists", true);
oReq.send('{"description": "New Scales Project", "public": "true","files": {"filename.name": {"content": "please please"}}}');