var fs = require('fs');
var path = require('path')
var _ = require('lodash');

var fileMap = function() {
    var png = {test : 'asdf'};
    var js = {};

    var updateFiles = {};
    var fileMap = {};
    var newFileMap = {};
    var fileGroup = {};

    var load = function(root) {
        read(root, 'png');
    }

    var readMap = function(callback){
        try{
            fs.readFile('fileMap.json', (err, data) => {
                if(data){
                    try{
                        fileMap = JSON.parse(data);
                    }
                    catch(e){
                        fileMap = {};
                    }
                }
                if(callback)
                    callback();
            });
        }catch(e){
            fileMap = {};
        }
    }

    var read = function(path, format){
        fs.readdirSync(path).forEach((file) => {
            var _path = path + file;
            var stat = fs.lstatSync(_path);
            //console.log(_path)
            if(stat.isDirectory())
                read(_path + '/', format);
            else if(stat.isFile()){
                if(isFormat(_path, format)){
                    newFileMap[_path] = stat.size;
                    if(fileMap.hasOwnProperty(_path)){
                        if(fileMap[_path] != stat.size){
                            fileMap[_path] = stat.size;
                            updateFiles[_path] = stat.size;
                        }
                    }
                    else{
                        updateFiles[_path] = stat.size;
                        fileMap[_path] = stat.size;
                    }
                }
            }
        });
    }

    var checkCacheFile = function(path, format){
        var removeFiles = [];
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        fs.readdirSync(path).forEach((file) => {
            var _path = path + file;
            //console.log(_path)
            //console.log(file)
            if(isFormat(_path, format)){
                let available = false;
                for(var key in fileGroup){
                    if(fileGroup[key].indexOf(file) > -1){
                        available = true;
                        break;
                    }
                }
                if(!available)
                    removeFiles.push(file);
            }
        });
        removeFiles.forEach((file) => {
            console.log('file removed : ' + file);
            fs.unlinkSync(path + file);
        })
    }

    var save = function() {
        fs.writeFile("fileMap.json", JSON.stringify(newFileMap), function(err) {
            if(err) {
                return console.log(err);
            }
        });
    }

    var getExtension = function (filename) {
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }
    
    var isFormat = function(filename, format) {
        var ext = getExtension(filename);
        return ext.toLowerCase() == format;

    }

    var organize = function(){
        fileGroup = {};
        var duplicatedNames = [];
        if(fileMap){
            var pathArr = Object.keys(fileMap);
            pathArr.forEach((filePath) => {
                var dir = path.dirname(filePath) + '/';
                var base = path.basename(filePath);
                
                if(duplicatedNames.indexOf(base) > -1)
                    console.log('duplicated : ' + base);
                duplicatedNames.push(base);

                if(!fileGroup.hasOwnProperty(dir))
                    fileGroup[dir] = [base];
                else
                    fileGroup[dir].push(base);
            });
        }
    }
    
    this.process = function(root, callback){
        readMap(() => {
            load(root);
            save();
            organize();
            checkCacheFile('./Cache/', 'png');
            console.log(updateFiles);
            if(callback)
                callback(updateFiles);
        });
    }

    this.getFileGroup = function(){
        return fileGroup || {};
    }

    this.buildConfig = function(config){
        var ServerModeString = (deploy) => {
            console.log(deploy)
            const _deploy = deploy.toUpperCase();
            return `EServerMode.${_deploy}`;
        }

        return new Promise(function(resolve, reject){
            fs.readFile('./templates/build-config.template.txt', 'utf8', (err, data) => {
                if(!err){
                    let configText = `\nSERVER_MODE : ${ServerModeString(config.deploy)},\nVERSION : '${config.ver}',\nLAST_UPDATE : 'NOT USING',\n`;
                    data = data.replace(/{REPLACE}/, configText);
                    //console.log(data);
                    fs.writeFile('../WebContent/js/config/StzBuildConfig.js', data, (err) => {
                        if(err)
                            reject();
                        else
                            resolve();
                    });
                }
                else
                    reject();
            });
        });
    }
}
var FileMap = new fileMap();
// FileMap.process('./Production/', (files) => {
//     // return gulp.src(files)
//     //     .pipe(tinypng('V738yVDWivS0TY8fkJiQNcIhCoZkTqTf'));
// })
module.exports = FileMap;
