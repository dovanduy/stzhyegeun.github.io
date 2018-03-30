var gulp = require("gulp");
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var htmlreplace = require("gulp-html-replace");
var domSrc = require('gulp-dom-src');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var zip = require('gulp-zip');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');
const audiosprite = require('gulp-audiosprite');

//var runsequence = require('run-sequence');
var runsequence = require('gulp-sequence');

var print = require('gulp-print').default;
var minimist = require('minimist');

var tinypng = require('gulp-tinypng');
//var tinypng_nokey = require('gulp-tinypng-nokey');
//var imagemin = require('gulp-imagemin');

var fileMap = require('./FileMap');
//var packBuilder = require('./AssetPackRebuilder');

var knownOptions = {
    default: { 
        deploy : 'stage',
        ver : '1.1.1'
    }
};

// *********** 1 **********
// gulp 빌드 명령으로부터 옵션 정보를 받아온다.
// gulp -f Build/gulpfile.js build --deploy dev --ver 1.0.0 
// 위와 같은 방식으로 명령을 입력하면 knownOptions의 형식에 맞춰 options 데이터를 만들 수 있다.
var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('audiosprite', ()=> {
    return gulp.src('../WebContent/assets/sounds/**/*.*')
    .pipe(audiosprite({
        log: "info", 
        output: "audiosprite", 
        export: "mp3"
    }))
    .pipe(gulp.dest('../Production/assets/sounds'));
});

gulp.task('zip', () => {
        return gulp.src('../Production/**/*.*')
        .pipe(print((filepath) => { return `zip: ${filepath}`; }))
        .pipe(zip(`DinoRunz-${options.deploy}-${options.ver}.zip`))
        .pipe(gulp.dest('../output'));
});

// build-config
// 다이노볼즈의 StzBuildConfig.js 파일을 생성하는 기능 
gulp.task('build-config', ()=> {
    return fileMap.buildConfig(options);
});

gulp.task('clean', ()=> {
    return del('../Production/', { force: true });
});

gulp.task('copy-dev', ()=>{
    return gulp.src([
        '../WebContent/**/*.*'
    ])
    .pipe(gulp.dest('../Production/'));
});

// 파라미터로 넘겨준 목록을 참고하여 파일들을 복사하는 역할.
// gulp.src 함수의 파라미터 앞에 !을 붙이면 제외하라는 뜻
gulp.task('copy', ()=> {
    return gulp.src( [
        '../WebContent/**/*.*',
        // Exclude all javascript files
        '!../WebContent/**/*.js',
        
        
        // With one exception
        '!../WebContent/stz_leaderboard/**/*.*', 
        '!../WebContent/assets/sounds/**/*.*',

        '../WebContent/lib/phaser.js',
        //'../WebContent/assets/assets-pack.json',

        // Exclude all atlas folders of subgames
        // '!../WebContent/assets/game/**/atlas/',
        // '!../WebContent/assets/game/**/atlas/**/*',
        // '!../WebContent/assets/game/**/atlas2/',
        // '!../WebContent/assets/game/**/atlas2/**/*',
        // '!../WebContent/assets/game/**/atlas_pre_pack/**/*',
        // '!../WebContent/assets/sprites/**/atlas_pack/**/*',
        // '!../WebContent/assets/images/**/atlas_pre_pack/**/*',

        // Exclude all html files.
        '!../WebContent/**/*.html',

        // Exclude all canvas files
        '!../WebContent/**/*.canvas',

        // '!../WebContent/assets/game/**/*.json',
        // '!../WebContent/assets/imagefonts/**/*.json',
        // '!../WebContent/assets/images/**/*.json',
        // '!../WebContent/assets/sounds/**/*.json',
        // '!../WebContent/assets/sprites/**/*.json',
        // '!../WebContent/assets/webfonts/**/*.json',

        '!../WebContent/assets/**/*.fnt',

        // Exclude all screenshot files.
        // '!../WebContent/assets/images/screenshot/**/*',
    ])
    .pipe(gulp.dest('../Production/'))
})

gulp.task('copy-stz-leaderboard', () => {
    return gulp.src([
        '../WebContent/stz_leaderboard/**/*.*'
    ])
    .pipe(gulp.dest('../Production/stz_leaderboard'));
});

gulp.task('concate-js', ()=> {    
    // index.html 파일에 script 태그로 추가된 모든 js 파일을 획득하여 
    return domSrc({
        file: '../WebContent/index.html',
        selector: 'script',
        attribute: 'src'
    })
    // 그 중에서, jquery와 phaser 엔진 코드는 제외
        .pipe(filter(['**', '!**/nine-patch-phaser-plugin.js', '!**/jquery-3.1.1.min.js', '!**/phaser.js', '!**/stz_leaderboard/**/*.*'], {restore: true}))
    // 파일 처리할 때마다 아래 로그를 남김
    .pipe(print((filepath) => { return `built: ${filepath}`; }))
    // concat: 파일을 이어 붙이는 함수 
    .pipe(concat('scripts.full.js'))
    .pipe(gulp.dest('../Production/'));
});

gulp.task('combine-js', ()=> {
    // browserify : Nodejs 기반 JS 코드를 브라우저에서 실행할 수 있도록 변경해주는 기능
    return browserify({entries:'../Production/scripts.full.js', insertGlobals : true})
    .transform(babelify, { presets: ['babel-preset-es2015'].map(require.resolve) })
    .bundle()
    .on('error',  (err) => { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(source('scripts.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('../Production/'));
});

// replace를 하기 위해 index.html에 
// build:js 주석을 추가.
gulp.task('replace-js-in-html', ()=> {
    return gulp.src('../WebContent/index.html')
        .pipe(htmlreplace({
            'js': ['https://connect.facebook.net/en_US/fbinstant.6.0.js', /*'asset-pack.js',*/ 'jquery-3.1.1.min.js', 'phaser.js', 'nine-patch-phaser-plugin.js', 'scripts.min.js']
        }))
        .pipe(gulp.dest('../Production/'));
});

gulp.task('copy-lib', ()=> {
    return gulp.src(['../WebContent/lib/plugin/*.*', '../WebContent/lib/phaser.js', '../WebContent/lib/jquery-3.1.1.min.js', '../WebContent/asset-pack.js'])
        .pipe(gulp.dest('../Production/'));
})

gulp.task('pack-rebuild', () => {
    return packBuilder.process();
});

gulp.task('tinify-image', () => {
    fileMap.process('../Production/', (files) => {
        
        return gulp.src(Object.keys(files))
        //.pipe(imagemin([imagemin.optipng({optimizationLevel : 5})]))
        .pipe(tinypng('eTcP0f6ggh7ZmxkGjc7YLsuXatqY0wKi')) //sangjun.park@sundaytoz.com
        .pipe(print((filepath) => { return `built: ${filepath}`; }))
        .pipe(gulp.dest('./Cache/'))
        .on('end' , function() {
            console.log('finish');
            gulp.start('finalize');
        })
    });
});

gulp.task('copy-image', function () {
    let stream = gulp;
    var fileGroup = fileMap.getFileGroup();
    for (let dir in fileGroup) {
        let src = [];
        fileGroup[dir].forEach(name => src.push('./Cache/' + name));
        stream.src(src)
        .pipe(gulp.dest(dir))
        .pipe(print((filepath) => { return `moved: ${filepath}`; }))
    }
    return stream;
});

gulp.task('clean-intermediate', ()=> {
    return del([
        '../Production/scripts.full.js'
    ], { force: true });
});






gulp.task('build', runsequence(
    //'build-config', 
    'clean', 
    'copy', 
    'copy-stz-leaderboard',
    'concate-js', 
    'combine-js', 
    'clean-intermediate',
    'replace-js-in-html', 
    'copy-lib', 
    //'pack-rebuild', 
    //'tinify-image',
    'zip'
));

gulp.task('build-dev', runsequence(
    'clean', 
    'copy-dev', 
    'zip'
));

gulp.task('finalize', runsequence(
    'copy-image',
    'zip'
));
