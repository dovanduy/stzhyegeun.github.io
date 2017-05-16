/**
 * 
 * 사용 예
 * { '프레임인덱스' : 딜레이 시간 (ms) }
 * blockMatchAnim.animations.playWithDelayList(animationName, 15, {'1': 1000, '2': 2000, '3': 3000}, false);
 * 
 * @param name
 * @param frameRate
 * @param delayList
 * @param loop
 * @param killOnComplete
 * @returns
 */
Phaser.AnimationManager.prototype.playWithDelayList = function (name, frameRate, delayList, loop, killOnComplete) {

    if (this._anims[name]) {
        if (this.currentAnim === this._anims[name]) {
            if (this.currentAnim.isPlaying === false) {
                this.currentAnim.paused = false;
                return this.currentAnim.playWithDelayList(frameRate, delayList, loop, killOnComplete);
            }

            return this.currentAnim;
        } 
        
        if (this.currentAnim && this.currentAnim.isPlaying) {
            this.currentAnim.stop();
        }

        this.currentAnim = this._anims[name];
        this.currentAnim.paused = false;
        this.currentFrame = this.currentAnim.currentFrame;
        return this.currentAnim.playWithDelayList(frameRate, delayList, loop, killOnComplete);
    }
};


Phaser.Animation.prototype.getDelayListValue = function(inFrameIndex) {
    var result = 0;
    if (typeof this.delayList !== 'undefined') {
        if (this.delayList.hasOwnProperty('' + inFrameIndex) && typeof this.delayList['' + inFrameIndex] === 'number') {
        	result = this.delayList['' + inFrameIndex];
        }
    }

    return result;
};

Phaser.Animation.prototype.playWithDelayList = function (frameRate, delayList, loop, killOnComplete) {

    if (typeof delayList !== 'undefined') {
        this.delayList = delayList;
    }

    this.play(frameRate, loop, killOnComplete);

};

Phaser.Animation.prototype.base_play = Phaser.Animation.prototype.play;
Phaser.Animation.prototype.play = function (inFrameRate, inLoop, inKillOnComplete) {

    if (typeof inFrameRate === 'number')
    {
        //  If they set a new frame rate then use it, otherwise use the one set on creation
        this.delay = 1000 / inFrameRate;
    }

    if (typeof inLoop === 'boolean')
    {
        //  If they set a new loop value then use it, otherwise use the one set on creation
        this.loop = inLoop;
    }

    if (typeof inKillOnComplete !== 'undefined')
    {
        //  Remove the parent sprite once the animation has finished?
        this.killOnComplete = inKillOnComplete;
    }

    this.isPlaying = true;
    this.isFinished = false;
    this.paused = false;
    this.loopCount = 0;

    this._timeLastFrame = this.game.time.time;
    this._timeNextFrame = this.game.time.time + this.delay + this.getDelayListValue(0);

    this._frameIndex = this.isReversed ? this._frames.length - 1 : 0;
    this.updateCurrentFrame(false, true);

    this._parent.events.onAnimationStart$dispatch(this._parent, this);

    this.onStart.dispatch(this._parent, this);

    this._parent.animations.currentAnim = this;
    this._parent.animations.currentFrame = this.currentFrame;

    return this;

};

Phaser.Animation.prototype.base_restart = Phaser.Animation.prototype.restart;
Phaser.Animation.prototype.restart = function () {

    this.isPlaying = true;
    this.isFinished = false;
    this.paused = false;
    this.loopCount = 0;

    this._timeLastFrame = this.game.time.time;
    this._timeNextFrame = this.game.time.time + this.delay + this.getDelayListValue(0);

    this._frameIndex = 0;

    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

    this._parent.setFrame(this.currentFrame);

    this._parent.animations.currentAnim = this;
    this._parent.animations.currentFrame = this.currentFrame;

    this.onStart.dispatch(this._parent, this);

};

Phaser.Animation.prototype.base_update = Phaser.Animation.prototype.update;
Phaser.Animation.prototype.update = function () {

    if (this.isPaused)
    {
        return false;
    }

    if (this.isPlaying && this.game.time.time >= this._timeNextFrame)
    {
        this._frameSkip = 1;

        //  Lagging?
        this._frameDiff = this.game.time.time - this._timeNextFrame;

        this._timeLastFrame = this.game.time.time;

        if (this._frameDiff > this.delay)
        {
            //  We need to skip a frame, work out how many
            this._frameSkip = Math.floor(this._frameDiff / this.delay);
            this._frameDiff -= (this._frameSkip * this.delay);
        }

        //  And what's left now?
        this._timeNextFrame = this.game.time.time + (this.delay - this._frameDiff) + this.getDelayListValue(this._frameIndex);

        if (this.isReversed)
        {
            this._frameIndex -= this._frameSkip;
        }
        else
        {
            this._frameIndex += this._frameSkip;
        }

        if (!this.isReversed && this._frameIndex >= this._frames.length || this.isReversed && this._frameIndex <= -1)
        {
            if (this.loop)
            {
                // Update current state before event callback
                this._frameIndex = Math.abs(this._frameIndex) % this._frames.length;

                if (this.isReversed)
                {
                    this._frameIndex = this._frames.length - 1 - this._frameIndex;
                }

                this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

                //  Instead of calling updateCurrentFrame we do it here instead
                if (this.currentFrame)
                {
                    this._parent.setFrame(this.currentFrame);
                }

                this.loopCount++;
                this._parent.events.onAnimationLoop$dispatch(this._parent, this);
                this.onLoop.dispatch(this._parent, this);

                if (this.onUpdate)
                {
                    this.onUpdate.dispatch(this, this.currentFrame);

                    // False if the animation was destroyed from within a callback
                    return !!this._frameData;
                }
                return true;
            }
            this.complete();
            return false;
        }
        return this.updateCurrentFrame(true);
    }

    return false;
};

Phaser.Animation.prototype.base_destroy = Phaser.Animation.prototype.destroy;
Phaser.Animation.prototype.destroy = function () {

    if (!this._frameData)
    {
        // Already destroyed
        return;
    }

    this.game.onPause.remove(this.onPause, this);
    this.game.onResume.remove(this.onResume, this);

    this.game = null;
    this._parent = null;
    this._frames = null;
    this._frameData = null;
    this.currentFrame = null;
    this.delayList = null;
    this.isPlaying = false;

    this.onStart.dispose();
    this.onLoop.dispose();
    this.onComplete.dispose();

    if (this.onUpdate)
    {
        this.onUpdate.dispose();
    }

};
