const express = require('express'),
      router = express.Router(),
      fs = require('fs'),
      crypto = require('crypto'),
      childProcess = require('child_process');
// Update packages.bzip
router.get('/', function(req, res){

  childProcess.exec("find ../../ -name '*.DS_Store' -type f -delete");

  //array of all files in /debs
  let debfiles = fs.readdirSync('../debs/'),
      fileText = "";

  //First, get the control data for all deb files
  //  This is needed to fill fields in Packages file
  childProcess.exec('./scripts/debinfo.bash',
    (error, stdout, stderr) => {
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
        //Stdout contains value of control file for each deb file in /debs
        let debArr = stdout.split("\n");

        //All fields in the control files
        let types = ["Package", "Name", "Version", "Architecture",
                    "Description", "Author", "Maintainer", "Section",
                    "Icon", "Depiction", "Depends"];
        //Loop through each control file text
        debArr.forEach((item, index) => {
          var thisDeb = {};
          types.forEach(type => {
            //item is a string containing data from control file. There are no
            //  newlines to split on, so we need to split by the type
            //  Regex is the current type to split on, and nextRegex is the
            //  next type that will be at the end of the current value in the string

            // Example: item will be a string similar to:
            //      Package: packagename Description: package description goes here Etc: etc...
            //      For type Description, thisItem is ['Package: packagename', ' package description goes here Etc: etc...']
            //        Take the second element in array, being [1] which will be
            //         'package description goes here Etc: etc...'
            //      nextRegex will provide an array from this string being
            //          ['package description goes here', 'Etc: etc...']
            //      The description value will be the first elem in array, being [0]
            //          which will give 'package description goes here'
            var regex = new RegExp(type + ": "),
                nextRegex = new RegExp(" " + types[types.indexOf(type)+1] + ": "),
                thisItem = item.split(regex)[1];
            if(thisItem) {
              var thisValue = thisItem.split(nextRegex)[0];
              thisDeb[type] = thisValue;
            }
          })
          //Only move forward if the package field has been entered
          if(thisDeb.Package) {
            //get filename to get file information
              let filename = debfiles[index];
              let stats = fs.statSync('../debs/'+filename);
              let size = stats.size;

              const fileBuffer = fs.readFileSync('../debs/'+filename);
              const md5 = crypto.createHash('md5');
              const sha1 = crypto.createHash('sha1');
              const sha256 = crypto.createHash('sha256');
              md5.update(fileBuffer);
              sha1.update(fileBuffer);
              sha256.update(fileBuffer);

              const md5Res = md5.digest('hex');
              const sha1Res = sha1.digest('hex');
              const sha256Res = sha256.digest('hex');

              fileText += packageData(filename, thisDeb.Version, md5Res, sha1Res,
                                      sha256Res, size, thisDeb.Package, thisDeb.Name,
                                      thisDeb.Description, thisDeb.Author,
                                      thisDeb.Maintainer, thisDeb.Section,
                                      thisDeb.Depends, thisDeb.Icon,
                                      thisDeb.Depiction) + "\n";
          }
        })
        //Now, fileText contains the exact data that should be put in Packages file
        fs.writeFile('../Packages', fileText, error => {
          if (error) {
            console.error(error);
          } return;
        });

        //Packages has been successfully updated. Now, delete old Packages.bz2
        //  and re-compress
        var zippkg = childProcess.exec('./scripts/zippkg.bash',
          (error, stdout, stderr) => {
              console.log(stderr);
              if (error !== null) {
                  console.log(`exec error: ${error}`);
              }
          });
        res.end();
    });
});

function packageData(filename, version, md5Res, sha1Res, sha256Res,
                    size, package, name, description, author, maintainer,
                    section, depends, icon, depiction) {
  let dependsLine = (!depends) ? "" : "Depends: "+depends+"\n";
  let response = "Package: "+package+"\n"
  +"Name: "+name+"\n"
  +"Version: "+version+"\n"
  +"Architecture: iphone-os-arm\n"
  +"Description: "+description+"\n"
  +"Maintainer: "+maintainer+"\n"
  +"Author: "+author+"\n"
  +"Section: "+section+"\n"
  +dependsLine
  +"Filename: debs/"+filename+"\n"
  +"Size: " + size + "\n"
  +"MD5sum: " + md5Res + "\n"
  +"SHA1: " + sha1Res + "\n"
  +"SHA256: "+ sha256Res + "\n"
  +"Icon: " + icon + "\n"
  +"Depiction: "+depiction + "\n";
  return response;
}

module.exports = router;
