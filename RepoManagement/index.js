const express = require('express'),
      sqlite3 = require('sqlite3'),
      fs = require('fs'),
      path = require('path'),
      crypto = require('crypto'),
      childProcess = require('child_process'),
      StreamZip = require('node-stream-zip'),
      FilePond = require('filepond'),
      FilePondPluginImagePreview = require('filepond-plugin-image-preview'),
      formidable = require('formidable');
//Filepond: https://github.com/pqina/filepond

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Needed for style.css
app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
  );
})

//Retrieve filepond data using formidable
app.post("/upload", function(req, res){
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    //send filepond data to body, to be retrieved in /save
    res.json(files);
  });
})

//Handle zip upload using formidable and filepond
app.post("/zip", function(req, res){
  // Remove /tmp folder if it hasn't been removed already, to start
  //    from scratch
  if (fs.existsSync('./tmp'))
    fs.rmSync('./tmp', { recursive: true });

  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    // Take the uploaded zip file and prepare for extraction using StreamZip
    const zip = new StreamZip({ file: files.filepond.filepath });
    zip.on('ready', () => {

      let baseDir;
      for (const entry of Object.values(zip.entries())) {
        //first extracted entry will always be top directory
        baseDir = entry.name;
        break;
      }

      zip.extract(null, './tmp', (err, count) => {

          //By using this zip extraction method, there are sometimes extra folders
          //  extracted. Remove all parent dirs except for 'sc' and the package folder
          fs.readdir('./tmp/', (err, dirs) => {
            dirs.forEach(dir => {
              if(dir !== baseDir.replace('/', ''))
                 fs.rmSync('./tmp/'+dir, { recursive: true });
             })
          })
          //done extracting
          zip.close();

          //now to create deb file from extracted folder
          var createDebs = childProcess.exec('./scripts/createdebs.bash');
          res.end();
      });
    });
  });
});

//Handler for deleting an uploaded file
app.delete("/zip", function(req, res) { res.end(); })


//Save Form
app.post("/save", function(req, res){
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    //screenshot files were uploaded in form
    if(fields.filepond || files.length) {

      //make tmp directory if not exists
      if (!fs.existsSync('./tmp'))
          fs.mkdirSync('./tmp');

      //make sc directory if not exists
      if (!fs.existsSync('./tmp/sc'))
          fs.mkdirSync('./tmp/sc');
      //more than one screenshot was uploaded
      if(fields.filepond.length > 1) {
        fields.filepond.forEach(file => {
          let fileObj = JSON.parse(file).filepond,
              fileData = fs.readFileSync(fileObj.filepath),
              filename = fileObj.originalFilename;
          fs.writeFile('./tmp/sc/'+filename,fileData, function (err) {
            if (err) throw err;
          });
        })
      }
      //only one screenshot was uploaded
      else if(fields.filepond){
        let fileObj = JSON.parse(fields.filepond).filepond;
        let fileData = fs.readFileSync(fileObj.filepath),
            filename = fileObj.originalFilename;
        fs.writeFile('./tmp/sc/'+filename,fileData, function (err) {
          if (err) throw err;
        });
      }

      //After getting everything necessary moved to the /tmp location, move to proper location
      //make directory for depictions screenshots
      if (!fs.existsSync('../depictions/screenshots/'+fields.package)){
          fs.mkdirSync('../depictions/screenshots/'+rfields.package, { recursive: true });
      }

      //take all files from sc folder and move to depictions screenshot dir
      fs.readdir('./tmp/sc/', (err, files) => {
        files.forEach(file => {
           if   (path.extname(file) === '.png'||
                path.extname(file) === '.jpg' ||
                path.extname(file) === '.gif' ||
                path.extname(file) === '.jpeg') {
                 fs.rename('./tmp/sc/'+file, '../depictions/screenshots/'+fields.package+'/'+file, err => {
                     if (err) throw err;
                 });
           }
         })
        //delete tmp folder, as we're done with it
        fs.rmSync('./tmp', { recursive: true });
      })

    }

    //After moving necessary images, return JSON data with form data
    res.json({ fields, files });
  });
})

//Called when new package is being uploaded
//Return data from control file
app.get('/readControl', function(req, res){
  res.set("Content-type", "application/json");
  //collect data from control file
  let dirname = fs.readdirSync('./tmp/');
  let data = fs.readFileSync('./tmp/'+dirname[0]+'/DEBIAN/control', "utf8");
  res.json({data: data});
});

//Called when form is being populated with package info
//Return current screenshot list
app.get('/currentScreenshots', function(req, res){
  res.set("Content-type", "application/json");

  //make tmp directory if not exists
  if (!fs.existsSync('./tmp'))
      fs.mkdirSync('./tmp');

  //make sc directory if not exists
  if (!fs.existsSync('./tmp/sc'))
      fs.mkdirSync('./tmp/sc');

  fs.readdir('../depictions/screenshots/'+req.body.package, (err, files) => {
    //move all images from depictions screenshots to tmp sc folder
    files.forEach(file => {
         fs.rename('../depictions/screenshots/'+req.body.package+'/'+file, './tmp/sc/'+file, err => {
             if (err) throw err;
         });
      })
    res.send(files);
  })
});


//Load the correct information in the popup
app.post('/popup/:id', function(req, res){
  //req.body.obj holds all the data retrieved from db
  let packageText = fs.readFileSync("./packagePopup.html","utf-8"),
      versionText = fs.readFileSync("./versionsPopup.html","utf-8"),
      replaceTxt = "",
      type;

  //Replace template with proper information
  switch(req.params.id) {
      case 'newPkg':
        type = "package";
        replaceTxt = packageText.replace("${TITLE}", "Create New Package");
        break;
      case 'newVersion':
        type = "version";
        replaceTxt = versionText.replace("${TITLE}", "Create New Version for ${PACKAGE}");
        break;
      case 'updatePkg':
        type = "package";
        replaceTxt = packageText.replace("${TITLE}", "Update Package ${PACKAGE}");
        break;
      case 'updateVersion':
        type = "version";
        replaceTxt = versionText.replace("${TITLE}", "Update Version for ${PACKAGE}");
        break;
      case 'deletePkg':
        type = "package";
        replaceTxt = packageText.replace("${TITLE}", "Delete Package ${PACKAGE}");
        break;
      case 'deleteVersion':
        type = "version";
        replaceTxt = versionText.replace("${TITLE}", "Delete Version for ${PACKAGE}");
        break;
      case 'deleteAllPkg':
        type = "package";
        replaceTxt = packageText.replace("${TITLE}", "Delete All Packages");
        break;
      case 'deleteAllVersion':
        type = "version";
        replaceTxt = versionText.replace("${TITLE}", "Delete All Versions of ${PACKAGE}");
        break;
  }

  if(type === 'package') {
    replaceTxt = replaceTxt.replaceAll("${PACKAGE}", req.body.obj.Package)
                .replace("${NAME}", req.body.obj.Name)
                .replace("${AUTHOR}", req.body.obj.Author)
                .replace("${MAINTAINER}", req.body.obj.Maintainer)
                .replace("${DESCRIPTION}", req.body.obj.Description)
                .replace("${SECTION}", req.body.obj.Section)
                .replace("${DEPENDS}", req.body.obj.Depends);
  } else if(type === 'version') {
    replaceTxt = replaceTxt.replaceAll("${PACKAGE}", req.body.obj.Package)
                .replace("${MOSTRECENT}", req.body.obj.MostRecent)
                .replace("${OPTIONS}", req.body.obj.Options)
                .replace("${DESCRIPTION}", req.body.obj.Description);
  }
  res.send(replaceTxt);
});

// Update packages.bzip
app.get('/packages', function(req, res){

  //array of all files in /debs
  childProcess.exec("find ../ -name '*.DS_Store' -type f -delete");
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
                                      sha256Res, size, thisDeb.Package, ßthisDeb.Name,
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

app.listen(port);
