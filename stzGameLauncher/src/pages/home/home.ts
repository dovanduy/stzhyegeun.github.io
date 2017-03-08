import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { InAppBrowser } from 'ionic-native';
//import { FilePath} from 'ionic-native';
import { Httpd, HttpdOptions } from 'ionic-native';


//import { GameItemPage} from './GameItemPage';

//import { GameInfo } from './GameInfo';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})



export class HomePage {

    //public gameList : {[id : string] : GameInfo} = {};
    public gameList : Array<GameInfo>;

    constructor(public navCtrl: NavController) {

        if (!this.gameList) {
            this.gameList = [];
        }

        this.gameList.push(new GameInfo('Anipang', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-rotla.png', 'assets/games/anipang/WebContent/index.html'));   
        this.gameList.push(new GameInfo('Othelo P2P', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-totoro.png', 'http://infinite-cliffs-71037.herokuapp.com'));
        this.gameList.push(new GameInfo('Anipang Sachunsung', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-ghostbusters.png', 'https://stzhyegeun.github.io/Sachunsung/WebContent/index.html'));
        this.gameList.push(new GameInfo('Anipang Touch', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-batman.png', 'https://stzhyegeun.github.io/anipangtouch/WebContent/index.html'));

        
        let serverOptions: HttpdOptions = {
            www_root: '', 
            port: 8080, 
            //localhost_only: false
        }

        Httpd.startServer(serverOptions).subscribe((data) => {
            console.log("Server is live");
        });
        
    }

    onPageDidEnter() {
        console.log("onPageDidEnter triggered");    
    }

    launchGame(inIndex) {

       
        var launchAddress : string = this.gameList[inIndex].launchAddress;
        console.log("[Home (launchGame)] Target Address: " + launchAddress);
        if (launchAddress.indexOf('http:') >= 0 || launchAddress.indexOf('https:') >= 0) {
            console.log('[Home (launchGame)] this is web url: ' + launchAddress);
            
        } else {
            console.log('[Home (launchGame)] this is local url: ' + launchAddress);
            launchAddress = 'http://localhost:8080/' + launchAddress;
            console.log('[Home (launchGame)] new address: ' + launchAddress);
            /*
            FilePath.resolveNativePath(launchAddress).then(filePath => {
                console.log('[Home (launchGame)] Find path: ' + filePath);
                window.open(launchAddress, "_blank", "location=no");
            }).catch(err => {
                console.log('[Home (launchGame)] Error: ' + err.message);

            });
            */

        }

        window.open(launchAddress, "_blank", "location=no");

        
        //let browser = new InAppBrowser(launchAddress, "_blank", "location=no");
        //browser.show();
        

        
    }
}


class GameInfo {

    public name : string;
    public author : string;
    public thumbAddress : string;
    public launchAddress : string;

    constructor(inName, inAuthor, inThumbnail, inLaunch) {
        this.name = inName;
        this.author = inAuthor;
        this.thumbAddress = inThumbnail;
        this.launchAddress = inLaunch;    
    }
}