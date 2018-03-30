var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var _AssetPackRebuilder = function () {
    var assetPack = null;
    var root = '../Production/';
    var contentRoot = '../WebContent/';
    var targetDir = 'assets/assets-pack.json';

    var build = async function () {
        await loadFromProduction();
        await rebuild();
        return await saveAssetPack();
    }

    var loadFromProduction = function () {
        assetPack = {};
        return new Promise(function (resolve, reject) {
            fs.readFile(contentRoot + targetDir, (err, data) => {
                if (!err) {
                    assetPack = JSON.parse(data);
                    resolve(assetPack);
                }
                else
                    reject(err);
                //console.log(assetPack);
            });
        });
    }

    var rebuild = function () {
        var atlasMap = [];
        var promises = [];
        for (let key in assetPack) {
            if(key == 'meta')
                break;
            var packData = assetPack[key];
            packData.forEach((data) => {
                if (data.type == 'atlas') {
                    promises.push(new Promise(function(resolve, reject){
                        fs.readFile(contentRoot + data.atlasURL, (err, atlasData) => {
                            if (!err) {
                                //console.log(data);
                                data.atlasData = JSON.parse(atlasData);
                                data.atlasURL = '';
                            }else{ reject(err); }
                            resolve();
                        });
                    }));
                }
                else if (data.type == 'audiosprite') {
                    promises.push(new Promise(function(resolve, reject){
                        fs.readFile(contentRoot + data.jsonURL, (err, audioData) => {
                            if (!err) {
                                //console.log(data);
                                data.jsonData = JSON.parse(audioData);
                                data.jsonURL = '';
                            }else{ reject(err); }
                            resolve();
                        });
                    }));
                }
                else if (data.type == 'bitmapFont') {
                    promises.push(new Promise(function(resolve, reject){
                        fs.readFile(contentRoot + data.atlasURL, 'utf8', (err, fontData) => {
                            if (!err) {
                                data.atlasData = fontData.toString();
                                data.atlasURL = '';
                            }else{ reject(err); }
                            resolve();
                        });
                    }));
                }
            });
        }
        return Promise.all(promises).then(function() { return assetPack; });
    }

    // var saveAssetPack = function (assetPack) {
    //     fs.unlink(root + targetDir, () => {
    //         fs.writeFile(root + targetDir, JSON.stringify(assetPack));
    //     });
    // }

    var saveAssetPack = function () {
        return new Promise(function(resolve, reject){
            fs.unlink(root + targetDir, (err) => {
                var template = fs.readFileSync('./templates/asset-pack.template.txt', 'utf8');
                var builtPack = template.replace('{asset-pack}', JSON.stringify(assetPack));
                fs.writeFile(root + 'asset-pack.js', builtPack, (err) => {
                    if(!err)
                        resolve(builtPack);
                    else
                        reject(err);
                });
            });
        });
    }

    this.process = function () {
        return build()
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log('AssetPackRebuilder has Error : ' + err);
        });
    }
}

var builder = new _AssetPackRebuilder();
module.exports = builder;