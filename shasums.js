const crypto = require('crypto');
const fs = require('fs');
const myArgs = process.argv.slice(2);
/*args structure:
  filename
  version
*/
let filename = myArgs[0],
    version = myArgs[1];

if(!version) version = "1.0";

fs.readFile('../working/FinalFolders/'+filename+"/DEBIAN/control", "utf8", function (err, data) {
  if (err) throw err;
  let package = getInfo(data, "Package"),
      name = getInfo(data, "Name"),
      description = getInfo(data, "Description"),
      author = getInfo(data, "Author"),
      maintainer = getInfo(data, "Maintainer"),
      section = getInfo(data, "Section"),
      depends = getInfo(data, "Depends"),
      icon = getInfo(data, "Icon");
  printData(package, name, description, author, maintainer, section, depends, icon);
});

let stats = fs.statSync('debs/'+filename+'.deb');
let size = stats.size;

const fileBuffer = fs.readFileSync('debs/'+filename+'.deb');
const md5 = crypto.createHash('md5');
const sha1 = crypto.createHash('sha1');
const sha256 = crypto.createHash('sha256');
md5.update(fileBuffer);
sha1.update(fileBuffer);
sha256.update(fileBuffer);

const md5Res = md5.digest('hex');
const sha1Res = sha1.digest('hex');
const sha256Res = sha256.digest('hex');
function getInfo(data, type) {
  let arr = data.split("\n");
  let types = ["Package", "Name", "", "", "Description", "Author", "Maintainer", "Section", "Depends", "Icon"];
  let idx = types.indexOf(type);
  let infoLine = arr[idx];
  return infoLine.replace(type + ": ",'');

}

function printData(package, name, description, author, maintainer, section, depends, icon) {
  let dependsLine = (filename === "eghxstRepoIcons") ? "" : "Depends: "+depends+"\n";
  let response = "Package: "+package+"\n"
  +"Name: "+name+"\n"
  +"Version: "+version+"\n"
  +"Architecture: iphone-os-arm\n"
  +"Description: "+description+"\n"
  +"Maintainer: "+maintainer+"\n"
  +"Author: "+author+"\n"
  +"Section: "+section+"\n"
  +dependsLine
  +"Filename: debs/"+filename+".deb\n"
  +"Size: " + size + "\n"
  +"MD5sum: " + md5Res + "\n"
  +"SHA1: " + sha1Res + "\n"
  +"SHA256: "+ sha256Res + "\n"
  +"Icon: " + icon;
  console.log(response);
}
