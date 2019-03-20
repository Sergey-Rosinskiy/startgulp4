var syntax        = 'scss', // Syntax: sass or scss;
		gulpversion   = '4'; // Gulp version: 3 or 4

var gulp          = require('gulp'),
    gutil         = require('gulp-util' ),
	sass          = require('gulp-sass'),
	browserSync   = require('browser-sync'),
	concat        = require('gulp-concat'),
	uglify        = require('gulp-uglify'),
	cleancss      = require('gulp-clean-css'),
	rename        = require('gulp-rename'),
	autoprefixer  = require('gulp-autoprefixer'),
	notify        = require('gulp-notify'),
	rsync         = require('gulp-rsync');
var filesize = require('gulp-filesize');
// npm i gulp-filesize --save-dev

var sourcemaps = require('gulp-sourcemaps');
 // npm install gulp-sourcemaps --save-dev
var gulpif                = require('gulp-if');
// npm install gulp-if --save-dev  задействоват для gulp-sourcemaps
// переменая которая контролирует создание (true) или отключение (false) карты кода в файле
var isDevelopmant = true;

var plumber               = require('gulp-plumber');
// npm install gulp-plumber --save-dev
var notify                = require("gulp-notify");
// npm install gulp-notify --save-dev
var growl                 = require('gulp-notify-growl');
// npm install gulp-notify-growl --save-dev

var imagemin              = require('gulp-imagemin');
var pngquant              = require('imagemin-pngquant');
// npm i gulp-imagemin imagemin-pngquant --save-dev
var imageminJpg = require('imagemin-jpeg-recompress');
//$ npm install --save-dev imagemin-jpeg-recompress

//var cache                 = require('gulp-cache');
// npm i gulp-cache --save-dev

var del = require('del');
// npm i del --save-dev

// плагин для создания спрайтов png
var spritesmith = require('gulp.spritesmith');
// npm i gulp.spritesmith --save-dev

const svgSprite = require("gulp-svg-sprites");
// npm i gulp-svg-sprites


// три строки переменные для генерации фавикона
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var FAVICON_DATA_FILE = 'app/libs/favicon/faviconData.json';
// npm install gulp-real-favicon --save-dev


var gulpUtil = require('gulp-util');
var ftp   = require('gulp-ftp');
var vinyFTP = require( 'vinyl-ftp' );
// npm install --save-dev gulp-ftp vinyl-ftp gulp-util

var critical = require('critical').stream;
//$ npm install --save critical


gulp.task('serve', function() {
	browserSync.init({
		server: {
			baseDir: './app'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	});
    browserSync.watch('app', browserSync.reload);
});

gulp.task('styles', function() {
	return gulp.src('app/scss/main.scss')
.pipe(plumber({
     errorHandler: notify.onError({
            message: function(error) {
                return error.message;
            }})
 }))
	.pipe(gulpif (isDevelopmant, sourcemaps.init({loadMaps:true})))
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade:true}))
.pipe(filesize()).on('error', gutil.log)
	.pipe(gulpif (isDevelopmant, sourcemaps.write(".")))
	.pipe(gulp.dest('app/css'));
});

gulp.task('scripts', function() {
const jsFiles = [
'app/libs/jquery/dist/jquery.min.js',
'app/libs/nicescroll/jquery.nicescroll.min.js',
'app/libs/jquery.PageScroll2id/jquery.PageScroll2id.min.js',
'app/libs/magnific-popup/jquery.magnific-popup.min.js',
'app/libs/owlcarousel/owl.carousel.min.js',
'app/libs/common.js' // Always at the end
]
	return gulp.src(jsFiles)
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(filesize()).on('error', gutil.log);
});

gulp.task('code', function() {
	return gulp.src(['app/*.html', 'app/*php']);
});

gulp.task('picture', function() {
    return gulp.src(['app/img/*.{jpg,png,svg,ico}']);

});

gulp.task('watch', function() {
gulp.watch("app/scss/**/*.scss", gulp.series('styles'));
gulp.watch("app/libs/**/*.js", gulp.series('scripts'));
gulp.watch("app/*.html", gulp.series('code'));
gulp.watch("app/img/**/*.*", gulp.series('picture'));
});

gulp.task('default', gulp.series(
    gulp.parallel('styles','scripts','code','picture'),
     gulp.parallel( 'watch', 'serve')
     ));


gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});




// npm install --save-dev gulp-ftp vinyl-ftp
//FTP: ftp://vh146.timeweb.ru
//Логин: cc63120
//Пароль: j7X4Y36Od5Zm

gulp.task( 'ftp', function () {
    var conn = vinyFTP.create( {
     host:     'vh116.timeweb.ru',
     user:     'cx76534',
     password: 'PowO7q2Qcv2Y',
     parallel: 10,
     log:      gulpUtil.log
    } );

    var globs = [
        // 'src/**',
        // 'css/**',
        // 'js/**',
        // 'fonts/**',
        // 'index.html'
        'dist/**'
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src( globs, { base: './dist/', buffer: false } )
        .pipe( conn.newerOrDifferentSize( '/public_html' ) )// only upload newer files
       .pipe( conn.dest( '/public_html' ) );

} );

// Как подключиться по SSH


function cleaner() {
return del('dist/*');
}
gulp.task('cleanbuild', cleaner);
function movefile() {
	return gulp.src('app/*.html')
       .pipe(critical({base: 'dist/',
            inline: true,
             css: 'app/css/main.min.css'}))
        .on('error', function(err) { gulpUtil.log(gutil.colors.red(err.message)); })
	 .pipe(gulp.dest('dist'));
}

function movefilother() {
	return gulp.src('app/*.{php,access}')
	 .pipe(gulp.dest('dist'));
}


function movejs() {
	return gulp.src('app/js/scripts.min.js')
	.pipe(uglify()) // Mifify js (opt.)
	 .pipe(gulp.dest('dist/js'))
	 .pipe(filesize()).on('error', gutil.log);
}
function movecss() {
	return gulp.src('app/css/main.min.css')
	.pipe(cleancss( {level: { 2: { specialComments: 0 } } })) // Opt., comment out when debugging
	 	 .pipe(gulp.dest('dist/css'))
	 	 .pipe(filesize()).on('error', gutil.log);
}
gulp.task('movefile', movefile);
gulp.task('movefilother', movefilother);
gulp.task('movejs', movejs);
gulp.task('movecss', movecss);
gulp.task('moveimages', moveimages);
gulp.task('build', gulp.series('cleanbuild', gulp.parallel('movefile', 'movefilother', 'movejs', 'movecss', 'moveimages' )));

function moveimages() {
	return gulp.src('app/img/**/*.{jpg,svg,png,ico}')
        .pipe(imagemin([
    imageminJpg({
 			loops: 5,
            min: 50,
            max: 95,
            quality: 'hight'
            }),
   imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]))
        .pipe(gulp.dest('dist/img'))
        .pipe(filesize()).on('error', gutil.log);
}


// task для создания спрайтов png

// ниже размещена команда для ручного создания спрайтов
// в каталог app/libs/pngsprites/ закинут файлы для спрайта

function spritepng() {
	return gulp.src('app/libs/pngsprites/*.png')
  .pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_spritepng.css',
    padding: 120,
    algorithm:'top-down',
    cssTemplate: 'app/libs/handlebars/sprites.handlebars'
  }));
    spriteData.img.pipe(gulp.dest('app/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('app/css/')); // путь, куда сохраняем стили
}

gulp.task('spritepng', spritepng);


function spritesvg() {
return gulp.src('app/libs/svgsprites/*.svg')
.pipe(svgSprite({
selector: "i-sp-%f",
svg: {sprite: "svg.svg"},
svgPath: "%f",
cssFile: "_svg_sprite.css",
common: "ic"
}))
.pipe(gulp.dest("app/css"));
}

gulp.task('spritesvg', spritesvg);



// Generate the icons.
gulp.task('genfav', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'app/libs/favicon/basic.png',
        dest: 'app/img/favicon/',
        iconsPath: 'img/favicon',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin', //Add a solid, plain background to fill the transparent regions.
                backgroundColor: '#ffffff',
                margin: '14%',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'whiteSilhouette', //Use a white silhouette version of the favicon
                backgroundColor: '#da532c',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#da532c',
                manifest: {
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#da532c'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// Inject the favicon markups in your HTML pages.
gulp.task('infav', function() {
    return gulp.src(['app/*.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('app'));
});

// Check for updates on RealFaviconGenerator
gulp.task('favupdate', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});


