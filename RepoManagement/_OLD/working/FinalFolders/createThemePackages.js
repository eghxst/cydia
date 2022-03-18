//this file will take input of the base folder to look into and create
//individual theme packages for each available theme
// include node fs module
var fs = require('fs');
var copydir = require('copy-dir');
const replace = require('replace-in-file');

//remove all ds store files before continuing
const { exec } = require('child_process');
var removeds = exec('sh removeds.bash',
  (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
          console.log(`exec error: ${error}`);
      }
  });

let themeToCreate = process.argv.slice(2)[0];
const schemes = ["GrayScale", "Maroon", "Sunflower", "Peach", "Aqua", "Lavendar", "Pastel", "Forest", "Kiddie", "Bubblegum", "Midnight", "Neon", "Vaporwave"];

const srcStr = 'src="../'+themeToCreate+'/';
const hrefStr = 'href="../'+themeToCreate+'/';
//first, make sure there is a command line arg
if(themeToCreate) {
  schemes.forEach(scheme => {
    //scheme is the title of the color scheme theme to create
    var baseDir = themeToCreate + "-" + scheme;
    var debian = baseDir + '/DEBIAN';
    var inner = baseDir + '/var/mobile/Library/SBHTML/'+baseDir;
    //create directories
    if (!fs.existsSync(debian)){
        fs.mkdirSync(debian, { recursive: true });
    }
    if (!fs.existsSync(inner)){
        fs.mkdirSync(inner, { recursive: true });
    }

    //create files in directories

    //create control
    var controlText = fillControl(scheme);
    fs.writeFile(baseDir + '/DEBIAN/control', controlText, function (err) {
      if (err) throw err;
      console.log('File is created successfully.');
    });

    //copy most files from base theme
    copydir.sync(themeToCreate+'/var/mobile/Library/SBHTML/'+themeToCreate, inner, {
      utimes: true,  // keep add time and modify time
      mode: true,    // keep file mode
      cover: true    // cover file when exists, default is true
    });

    //copy remaining files directly from scheme
    copydir.sync(themeToCreate+'/var/mobile/Library/SBHTML/'+themeToCreate+"-"+scheme, inner, {
      utimes: true,  // keep add time and modify time
      mode: true,    // keep file mode
      cover: true    // cover file when exists, default is true
    });

    //edit Wallpaper to point to the right places
    const srcoptions = {

      //Single file
      files: baseDir+"/var/mobile/Library/SBHTML/"+baseDir+"/Wallpaper.html",

      //Replacement to make (string or regex)
      from: srcStr,
      to: 'src="',
    };
    const hrefoptions = {
      //Single file
      files: baseDir+"/var/mobile/Library/SBHTML/"+baseDir+"/Wallpaper.html",

      //Replacement to make (string or regex)
      from: hrefStr,
      to: 'href="',
    }
    try {
      //temp fix to make sure it replaces all src refs. this module only goes one at a time
      for(let i = 0; i < 6; i++) {
        replace.sync(srcoptions);
      }
      for(let i = 0; i < 6; i++) {
        replace.sync(hrefoptions);
      }
    }
    catch (error) {
      console.error('Error occurred:', error);
    }

  });
}
function fillControl(scheme) {
  var controlContent = "Package: _PACKAGE_\n"
  +"Name: _NAME_\n"
  +"Version: _VERSION_\n"
  +"Architecture: _ARCHITECTURE_\n"
  +"Description: _DESCRIPTION_\n"
  +"Author: _AUTHOR_\n"
  +"Maintainer: _MAINTAINER_\n"
  +"Section: _SECTION_\n"
  +"Depends: _DEPENDS_\n"
  +"Icon: _ICON_\n"
  +"Depiction: _DEPICTION_\n";
  let data = fs.readFileSync(themeToCreate+"/DEBIAN/control", "utf8");
    let package = getInfo(data, "Package"),
        version = getInfo(data, "Version"),
        architecture = getInfo(data, "Architecture"),
        name = getInfo(data, "Name"),
        description = getInfo(data, "Description"),
        author = getInfo(data, "Author"),
        maintainer = getInfo(data, "Maintainer"),
        section = getInfo(data, "Section"),
        depends = getInfo(data, "Depends"),
        icon = getInfo(data, "Icon"),
        depiction = getInfo(data, "Depiction");

        description = description.replace("Color Pack","");
        let returnStr = controlContent.replace('_PACKAGE_',"com.ghxstdev."+themeToCreate.toLowerCase()+scheme.toLowerCase())
        .replace('_NAME_',name + " " + scheme)
        .replace('_VERSION_',version)
        .replace('_ARCHITECTURE_',architecture)
        .replace('_DESCRIPTION_',description + " - " + scheme + " Color Scheme")
        .replace('_AUTHOR_',author)
        .replace('_MAINTAINER_',maintainer)
        .replace('_SECTION_',themeToCreate + " ColorSchemes")
        .replace('_DEPENDS_',depends)
        .replace('_ICON_',"https://eghxst.github.io/cydia/imgs/repoicons/"+themeToCreate+"Pack"+scheme+".png")
        .replace('_DEPICTION_',"https://eghxst.github.io/cydia/depictions/?p=com.ghxstdev."+themeToCreate.toLowerCase()+scheme.toLowerCase());
    return returnStr;
}
function getInfo(data, type) {
  let arr = data.split("\n");
  let types = ["Package", "Name", "Version", "Architecture", "Description", "Author", "Maintainer", "Section", "Depends", "Icon", "Depiction"];
  let idx = types.indexOf(type);
  let infoLine = arr[idx];
  return infoLine.replace(type + ": ",'');
}
