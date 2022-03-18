const crypto = require('crypto');
const fs = require('fs');
let fileText = "";
const childProcess = require('child_process');

let files = fs.readdirSync('debs/');
  let allFiles = files.map(e => e.replace('.deb',''));

  for(var i = 0; i < allFiles.length; i++) {
    let filename = allFiles[i];
    let version = "1.0";
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

    let data = fs.readFileSync('../working/FinalFolders/'+filename+"/DEBIAN/control", "utf8");
      let package = getInfo(data, "Package"),
          name = getInfo(data, "Name"),
          description = getInfo(data, "Description"),
          author = getInfo(data, "Author"),
          maintainer = getInfo(data, "Maintainer"),
          section = getInfo(data, "Section"),
          depends = getInfo(data, "Depends"),
          icon = getInfo(data, "Icon"),
          depiction = getInfo(data, "Depiction");
      fileText += printData(filename, version, md5Res, sha1Res, sha256Res, size, package, name, description, author, maintainer, section, depends, icon, depiction) + "\n";
  }
var removeds = childProcess.exec('./removeds.bash',
  (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      console.log("Removing .DS_Store Files...");
      if (error !== null) {
          console.log(`exec error: ${error}`);
      } else {
        console.log(`=== Successfully removed .DS_Store ===\n`);
        runScript('./depictions.js', function (err) {
            if (err) throw err;
        });
        writePkgs();
        zipPkgs();
      }
  });
function writePkgs() {
  fs.writeFile('Packages', fileText, error => {
    console.log("Rewriting packages...");
    if (error) {
      console.error(error);
      return;
    } else {
      console.log("=== Success Writing to Packages File ===");
      return;
    }
  });
}
function zipPkgs() {
  var zippkg = childProcess.exec('./zippkg.bash',
    (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        console.log("Zipping packages...");
        if (error !== null) {
            console.log(`exec error: ${error}`);
        } else {
          console.log(`=== Successfully rezipped Packages File ===\n`);
        }
    });
}

function runScript(scriptPath, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}


function getInfo(data, type) {
  let arr = data.split("\n");
  let types = ["Package", "Name", "Version", "Architecture", "Description", "Author", "Maintainer", "Section", "Icon", "Depiction", "Depends"];
  let idx = types.indexOf(type);
  let infoLine = arr[idx];
  return infoLine.replace(type + ": ",'');
}


function printData(filename, version, md5Res, sha1Res, sha256Res, size, package, name, description, author, maintainer, section, depends, icon, depiction) {
  let dependsLine = (depends == "") ? "" : "Depends: "+depends+"\n";
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
  +"Icon: " + icon + "\n"
  +"Depiction: "+depiction + "\n";
  return response;
}
