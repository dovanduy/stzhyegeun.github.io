import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
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

        this.gameList.push(new GameInfo('Othelo P2P', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-totoro.png', 'http://infinite-cliffs-71037.herokuapp.com'));
        //this.gameList.push(new GameInfo('Anipang', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-rotla.png', 'https://stzhyegeun.github.io/anipang/WebContent/index.html'));
        this.gameList.push(new GameInfo('Anipang', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-rotla.png', 'games/anipang/WebContent/index.html'));
        this.gameList.push(new GameInfo('Anipang Sachunsung', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-ghostbusters.png', 'https://stzhyegeun.github.io/Sachunsung/WebContent/index.html'));
        this.gameList.push(new GameInfo('Anipang Touch', 'HTML5 Team in SuntoLabs', 'assets/img/thumbnail-batman.png', 'https://stzhyegeun.github.io/anipangtouch/WebContent/index.html'));

    }

    onPageDidEnter() {
        console.log("onPageDidEnter triggered");

        /*
        for (var gameKey in this.gameList) {
            if (this.gameList.hasOwnProperty(gameKey) == false) {
                continue;
            }
            this.navCtrl.push(GameItemPage);
        }
        */
    }

    launchGame(inIndex) {

        var launchAddress : string = this.gameList[inIndex].launchAddress;
        console.log(this.gameList[inIndex].launchAddress);

        
        //let browser = new InAppBrowser(launchAddress, "_blank", "location=no");
        //browser.show();
        

        window.open(launchAddress, "_blank", "location=no");
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