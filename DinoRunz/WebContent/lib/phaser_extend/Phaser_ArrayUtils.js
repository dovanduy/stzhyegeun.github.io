/**
 *
 */
Phaser.ArrayUtils.getRandomItemWithout = function(objects, startIndex, length, withoutItems) {
	if (objects === null) {
		return null;
	}
	
	if (withoutItems === undefined) {
		withoutItems = [];
	}
	
	var newObjects = objects.filter(function(inItem) {
		return (withoutItems.indexOf(inItem) < 0); 
	});
	
	return this.getRandomItem(newObjects, startIndex, length);
};
