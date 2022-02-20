const fs = require('fs');
let files = fs.readdirSync('debs/');
let allFiles = files.map(e => e.replace('.deb',''));
fs.writeFile('depictions/data.txt', getData(), error => {
  if (error) {
    console.error(error);
    return;
  } else {
    console.log("Success");
    return;
  }
});

function getData() {
  let jsonObj = [];
  for(var i = 0; i < allFiles.length; i++) {
    let filename = allFiles[i];

    let data = fs.readFileSync('../working/FinalFolders/'+filename+"/DEBIAN/control", "utf8");
    let package = getInfo(data, "Package"),
        name = getInfo(data, "Name"),
        description = getInfo(data, "Description");
    let screenshotFiles = fs.readdirSync('depictions/screenshots/'+package);
    jsonObj.push({"name": name, "package": package, "description": description, "screenshots": screenshotFiles.join(' ')})
  }
  return JSON.stringify(jsonObj);
}
function getInfo(data, type) {
  let arr = data.split("\n");
  let types = ["Package", "Name", "", "", "Description"];
  let idx = types.indexOf(type);
  let infoLine = arr[idx].replace('\r','');
  return infoLine.replace(type + ": ",'');
}
