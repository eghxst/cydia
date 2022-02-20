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
function extraDesc(package) {
  switch(package) {
    case "com.ghxstdev.hsborderpack":
      return "<br>Includes All color schemes for the HS Border XenHTML Widget.<br><br>Included in this pack is the following:<ul><li>HS Border GrayScale Color Scheme</li><li>HS Border Maroon Color Scheme</li><li>HS Border Sunflower Color Scheme</li><li>HS Border Peach Color Scheme</li><li>HS Border Aqua Color Scheme</li><li>HS Border Lavendar Color Scheme</li><li>HS Border Pastel Color Scheme</li><li>HS Border Forest Color Scheme</li><li>HS Border Forest Color Scheme</li><li>HS Border Kiddie Color Scheme</li><li>HS Border Bubblegum Color Scheme</li><li>HS Border Midnight Color Scheme</li><li>HS Border Neon Color Scheme</li><li>HS Border Vaporwave Color Scheme</li></ul>";
      break;
    case "com.ghxstdev.hsdiagonalpack":
      return "<br>Includes All color schemes for the HS Diagonal XenHTML Widget.<br><br>Included in this pack is the following:<ul><li>HS Diagonal GrayScale Color Scheme</li><li>HS Diagonal Maroon Color Scheme</li><li>HS Diagonal Sunflower Color Scheme</li><li>HS Diagonal Peach Color Scheme</li><li>HS Diagonal Aqua Color Scheme</li><li>HS Diagonal Lavendar Color Scheme</li><li>HS Diagonal Pastel Color Scheme</li><li>HS Diagonal Forest Color Scheme</li><li>HS Border Diagonal Color Scheme</li><li>HS Diagonal Kiddie Color Scheme</li><li>HS Diagonal Bubblegum Color Scheme</li><li>HS Diagonal Midnight Color Scheme</li><li>HS Diagonal Neon Color Scheme</li><li>HS Diagonal Vaporwave Color Scheme</li></ul>";
      break;
    default:
      return "";
  }
}
function getData() {
  let jsonObj = [];
  for(var i = 0; i < allFiles.length; i++) {
    let filename = allFiles[i];

    let data = fs.readFileSync('../working/FinalFolders/'+filename+"/DEBIAN/control", "utf8");
    let package = getInfo(data, "Package"),
        name = getInfo(data, "Name"),
        description = getInfo(data, "Description");
    description += extraDesc(package)
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
