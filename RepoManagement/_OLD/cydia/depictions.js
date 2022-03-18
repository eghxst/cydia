const fs = require('fs');
let files = fs.readdirSync('debs/');
let allFiles = files.map(e => e.replace('.deb',''));
console.log("Updating Depictions...");
fs.writeFile('depictions/data.txt', getData(), error => {
  if (error) {
    console.error(error);
    return;
  } else {
    console.log("=== Success updating Depictions Data ===\n\n");
    return;
  }
});
function extraDesc(name) {
  let desc = "";
  desc =  "\n<br>Includes All color schemes for the "+name+" XenHTML Widget.<br><br>Included in this pack is the following:<ul>";
  const schemes = ["Dark", "GrayScale", "Maroon", "Sunflower", "Peach", "Aqua", "Lavendar", "Pastel", "Forest", "Kiddie", "Bubblegum", "Midnight", "Neon", "Vaporwave"];
  for(let i = 0; i < schemes.length; i++) {
    desc += "\n<li>"+name.replace("Color Pack", "")+schemes[i]+" Color Scheme</li>";
  }
  desc += "</ul>\n<br>The default scheme is Dark. Edit the config settings through the widget when placing in XenHTML to select any of these additional color schemes.";
  return desc;
}
function getData() {
  let jsonObj = [];
  let str = fs.readFileSync('depictions/data.txt', "utf8");
  let dataJson = JSON.parse(str);
  for(var i = 0; i < allFiles.length; i++) {
    let filename = allFiles[i];

    let data = fs.readFileSync('../working/FinalFolders/'+filename+"/DEBIAN/control", "utf8");
    let package = getInfo(data, "Package"),
        name = getInfo(data, "Name"),
        description = getInfo(data, "Description"),
        depends = getInfo(data, "Depends");
    if(package.includes("pack")) description += extraDesc(name);
    let screenshotFiles;
    if (fs.existsSync('depictions/screenshots/'+package)){
        screenshotFiles = fs.readdirSync('depictions/screenshots/'+package);
    }
    if(screenshotFiles) screenshotFiles = screenshotFiles.join(' ');
    else screenshotFiles = "";

    let packageData = dataJson.filter(obj => { return obj.package === package })[0]
    let dateFormat;
    if(packageData.name !== name || packageData.screenshots !== screenshotFiles || packageData.depends !== depends) {
      let date = new Date();
      dateFormat = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
    } else dateFormat = packageData.updated;



    jsonObj.push({"name": name, "package": package, "screenshots": screenshotFiles, "depends": depends, "updated": dateFormat})

    //we also want to create any versions/descriptions files if needed
    fs.writeFile('depictions/versions/'+package.replace('com.ghxstdev.', '')+'.txt', "1.0 - Initial Release", { flag: 'wx' }, function (err) {
        if (!err) console.log("Versions file created for " + name);
    });

    //we also want to create any versions/descriptions files if needed
    fs.writeFile('depictions/descriptions/'+package.replace('com.ghxstdev.', '')+'.txt', description, { flag: 'wx' }, function (err) {
        if (!err) console.log("Descriptions file created for " + name);
    });
  }
  return JSON.stringify(jsonObj);
}
function getInfo(data, type) {
  let arr = data.split("\n");
  let types = ["Package", "Name", "Version", "Architecture", "Description", "Author", "Maintainer", "Section", "Icon", "Depiction", "Depends"];
  let idx = types.indexOf(type);
  let infoLine = arr[idx].replace('\r','');
  return infoLine.replace(type + ": ",'');
}
