/**
 *
 */
DinoRunz.Title = function  () {
	Phaser.State.call(this);
};

var Title_proto = Object.create(Phaser.State.prototype);
DinoRunz.Title.prototype = Title_proto;
DinoRunz.Title.prototype.constructor = DinoRunz.Title;

DinoRunz.Title.prototype.init = function () {
	
};

DinoRunz.Title.prototype.preload = function () {
	
};

DinoRunz.Title.prototype.create = function () {
	DinoRunz.titleScene = new TitleScene(this.game, this.stage);
};

DinoRunz.Title.prototype.update = function () {
	
};