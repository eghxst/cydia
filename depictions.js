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
function extraDesc(name) {
  let desc = "";
  desc =  "<br>Includes All color schemes for the "+name+" XenHTML Widget.<br><br>Included in this pack is the following:<ul>";
  const schemes = ["GrayScale", "Maroon", "Sunflower", "Peach", "Aqua", "Lavendar", "Pastel", "Forest", "Kiddie", "Bubblegum", "Midnight", "Neon", "Vaporwave"];
  for(let i = 0; i < schemes.length; i++) {
    desc += "<li>"+name.replace("Color Pack", "")+" "+schemes[i]+" Color Scheme</li>";
  }
  desc += "</ul><br>The default theme is GrayScale. Edit the config settings through the widget when placing in XenHTML to enact any of these themes.";
  return desc;
}
function getData() {
  let jsonObj = [];
  for(var i = 0; i < allFiles.length; i++) {
    let filename = allFiles[i];

    let data = fs.readFileSync('../working/FinalFolders/'+filename+"/DEBIAN/control", "utf8");
    let package = getInfo(data, "Package"),
        name = getInfo(data, "Name"),
        description = getInfo(data, "Description");
    if(package.includes("pack")) description += extraDesc(name);
    let screenshotFiles;
    if (fs.existsSync('depictions/screenshots/'+package)){
        screenshotFiles = fs.readdirSync('depictions/screenshots/'+package);
    }
    if(screenshotFiles) screenshotFiles = screenshotFiles.join(' ');
    else screenshotFiles = "";

    jsonObj.push({"name": name, "package": package, "description": description, "screenshots": screenshotFiles})
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
