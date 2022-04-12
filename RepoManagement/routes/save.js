const express = require('express'),
      router = express.Router(),
      fs = require('fs'),
      path = require('path'),
      formidable = require('formidable');

//Save Form
router.post("/", function(req, res){
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
      if(Array.isArray(fields.filepond) && fields.filepond.length > 1) {
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
        let fileObj = JSON.parse(fields.filepond).filepond,
            fileData = fs.readFileSync(fileObj.filepath),
            filename = fileObj.originalFilename;
        fs.writeFile('./tmp/sc/'+filename,fileData, function (err) {
          if (err) throw err;
        });
      }

      //After getting everything necessary moved to the /tmp location, move to proper location
      //Delete and re-make directory for depictions screenshots
      if (fs.existsSync('../depictions/screenshots/'+fields.package)){
          fs.rmSync('../depictions/screenshots/'+fields.package, { recursive: true });
      }

      fs.mkdirSync('../depictions/screenshots/'+fields.package, { recursive: true });
      //take all files from sc folder and move to depictions screenshot dir
      fs.readdir('./tmp/sc/', (err, files) => {
        files.forEach(file => {
           if   (path.extname(file).toLowerCase() === '.png'||
                path.extname(file).toLowerCase() === '.jpg' ||
                path.extname(file).toLowerCase() === '.gif' ||
                path.extname(file).toLowerCase() === '.jpeg') {
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

module.exports = router;
