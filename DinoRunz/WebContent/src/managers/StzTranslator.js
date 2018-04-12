
/**
 *
 */
var StzTranslator_proto = function() {
	
	if (!(this instanceof StzTranslator_proto)) {
		return new StzTranslator_proto();
	}
	
	this.defaultLanguage = "en";  // Facebook Locale code : https://developers.facebook.com/docs/messenger-platform/messenger-profile/supported-locales/
	
    this.init = function(inTranslationData) {
    	this.translations = inTranslationData;
    };
    
    this.getAvailableLanguageList = function() {
    	return ["en", "es", "vn", "th", "pt", "zh", "ko"];
    };
    
    this.setLocale = function(inLocale) {
    	
    	if (inLocale === null || inLocale === undefined || inLocale === false || typeof (inLocale) !== 'string') {
            this.languageCode = this.defaultLanguage;
        } else if (inLocale.length > 2) {
            this.languageCode = inLocale.substr(0, 2);
        } else {
            this.languageCode = inLocale;
        }
    	
    	if (this.languageCode === "vi") {
    		this.languageCode = "vn";
    	}
    };
    
    this.getLocale = function() {
    	if (!this.languageCode) {
    		return this.defaultLanguage;
    	}
    	return this.languageCode;
    };
    
    this.translate = function(val) {
    	if (!StaticManager.dino_thornz_locale) {
    		throw new Error("No locale data!!");
    	}
    	
    	if (!StaticManager.dino_thornz_locale.get(val)) {
    		return val;
    	}
    	
    	if (!StaticManager.dino_thornz_locale.get(val)[this.languageCode]
    		|| StaticManager.dino_thornz_locale.get(val)[this.languageCode] == "") {
    		return StaticManager.dino_thornz_locale.get(val)[this.defaultLanguage];
    	}
    	
    	return StaticManager.dino_thornz_locale.get(val)[this.languageCode];
    };
    
    
    this.getResizeFontStyle = function(localeType) {
    	if(localeType === ELocale.BUTTON_SHARE){
    		if(this.languageCode === 'es'){
    			return {fontSize: '18px', fill: '#73aff9', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'bottom'};
    		}
    		else if(this.languageCode === 'pt' ){
    			return {fontSize: '13px', fill: '#73aff9', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'bottom'};
    		}
    		else{
    			return {fontSize: '24px', fill: '#73aff9', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'bottom'};
    		}
    	}
    	else if(localeType === ELocale.BUTTON_RANK){
    		if(this.languageCode === 'es'){
    			return {fontSize: '13px', fill: '#6cd1fc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'bottom'};
    		}
    		else if(this.languageCode === 'vn' ){
    			return {fontSize: '20px', fill: '#6cd1fc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'bottom'};
    		}
    		else{
    			return {fontSize: '24px', fill: '#6cd1fc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'bottom'};
    		}
    	}
    	else if(localeType === ELocale.POPUP_TITLE_WARP_GATE){
    		if(this.languageCode === 'es'){
    			return {fontSize: '34px', fill: '#c9fffc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    		else if(this.languageCode === 'vn'){
    			return {fontSize: '40px', fill: '#c9fffc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    		else{
    			return {fontSize: '52px', fill: '#c9fffc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    	}
    	else if(localeType === ELocale.POPUP_TITLE_WARP){
    		if(this.languageCode === 'es'){
    			return {fontSize: '28px', fill: '#c9fffc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    		else{
    			return {fontSize: '52px', fill: '#c9fffc', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    	}
    	else if(localeType === ELocale.BUTTON_SHARE_MISSION){
    		if(this.languageCode === 'es'){
    			return {fontSize: '20px', fill: '#7bb6ff', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    		else if(this.languageCode === 'pt'){
    			return {fontSize: '15px', fill: '#7bb6ff', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    		else{
    			return {fontSize: '28px', fill: '#7bb6ff', font: 'blogger_sans_bold', boundsAlignH: 'center', boundsAlignV: 'middle'};
    		}
    	}

    }  
};

