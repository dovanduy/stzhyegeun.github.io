/**
 *
 */
function StageModel (inScale, inAngle, inSpeedDelta, inSpeedDeltaIndex, inPathList) {
	if (!(this instanceof StageModel)) {
		return new StageModel(inScale, inAngle, inSpeedDelta, inSpeedDeltaIndex, inPathList);
	}
	
	this.scale = (inScale === null || inScale === undefined ? 1 : inScale);
	this.angle = (inAngle === null || inScale === undefined ? 0 : inAngle);
	this.speedDelta = (inSpeedDelta === null || inSpeedDelta === undefined ? 0 : inSpeedDelta);
	this.speedDeltaIndex = (inSpeedDeltaIndex === null || inSpeedDelta === undefined ? 0 : inSpeedDeltaIndex);
	
	if (!inPathList) { throw new Error("[StageModel] no path"); }
	this.inPathList = inPathList;
};

