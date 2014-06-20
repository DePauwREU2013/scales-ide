function reqListener () {
  console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.onload = reqListener;
oReq.open(post, https://api.github.com/gists, true);
oReq.send('{ description: the description for this gist, public: true, files: { file69.ben: { content: Please fucking work! } } }');
