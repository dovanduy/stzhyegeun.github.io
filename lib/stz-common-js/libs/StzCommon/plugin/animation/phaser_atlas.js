function changePhaserFunction() {
    Phaser.AnimationParser.JSONDataHash = function (game, json) {

        //  Let's create some frames then
        var data = new Phaser.FrameData();
        //  Malformed?
        if (!json['frames'])
        {
            if(json['SubTexture']){
                // NOTE @youngsun
                data = this.JSONDataHashFlash(game,json);
                return data;
            }
            console.warn("Phaser.AnimationParser.JSONDataHash: Invalid Texture Atlas JSON given, missing 'frames' object");
            console.log(json);
            return;
        }


        //  By this stage frames is a fully parsed array
        var frames = json['frames'];
        var newFrame;
        var i = 0;

        for (var key in frames)
        {
            newFrame = data.addFrame(new Phaser.Frame(
                i,
                frames[key].frame.x,
                frames[key].frame.y,
                frames[key].frame.w,
                frames[key].frame.h,
                key
            ));

            if (frames[key].trimmed)
            {
                newFrame.setTrim(
                    frames[key].trimmed,
                    frames[key].sourceSize.w,
                    frames[key].sourceSize.h,
                    frames[key].spriteSourceSize.x,
                    frames[key].spriteSourceSize.y,
                    frames[key].spriteSourceSize.w,
                    frames[key].spriteSourceSize.h
                );
            }

            i++;
        }

        return data;

    };


Phaser.AnimationParser.JSONDataHashFlash = function (game, json) {
        //  By this stage frames is a fully parsed array
        var frames = json['SubTexture'];
        var newFrame;
        var i = 0;

        var data = new Phaser.FrameData();
        
        for (i=0; i<frames.length;i++)
        {
            newFrame = data.addFrame(new Phaser.Frame(
                i,
                frames[i].x,
                frames[i].y,
                frames[i].width,
                frames[i].height,
                frames[i].name
            ));

            if (frames[i])
            {
                newFrame.setTrim(
                    false,
                    frames[i].width,
                    frames[i].height,
                    0,
                    0,
                    frames[i].width,
                    frames[i].height
                );
            }
        }

        return data;
    };
}

