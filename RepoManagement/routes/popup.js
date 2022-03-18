const express = require('express'),
      router = express.Router(),
      fs = require('fs');
//Load the correct information in the popup
router.post('/:id', function(req, res){
  //req.body.obj holds all the data retrieved from db
  let packageText = fs.readFileSync("./public/assets/templates/packagePopup.html","utf-8"),
      versionText = fs.readFileSync("./public/assets/templates/versionsPopup.html","utf-8"),
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
module.exports = router;
