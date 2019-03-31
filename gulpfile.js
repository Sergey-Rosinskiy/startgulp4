
var gulp              = require('gulp');
var sass                  = require('gulp-sass');
var browserSync           = require('browser-sync').create();
var concat                = require('gulp-concat');
var uglify                = require('gulp-uglify');
var cleancss              = require('gulp-clean-css');
var rename                = require('gulp-rename');
var autoprefixer          = require('gulp-autoprefixer');
var rsync                 = require('gulp-rsync');
var filesize          = require('gulp-filesize');
var sourcemaps        = require('gulp-sourcemaps');
// eslint-disable-next-line no-var
var gulpif            = require('gulp-if');
var plumber           = require('gulp-plumber');

var notify                = require('gulp-notify');
var growl          = require('gulp-notify-growl');

var imagemin          = require('gulp-imagemin');
var pngquant          = require('imagemin-pngquant');
var imageminJpg       = require('imagemin-jpeg-recompress');

//var cache           = require('gulp-cache');
// npm i gulp-cache --save-dev

var del               = require('del');

// плагин для создания спрайтов png
var spritesmith       = require('gulp.spritesmith');

var svgSprite         = require("gulp-svg-sprites");

var tingpng           = require('gulp-tinypng');

// три строки переменные для генерации фавикона
var realFavicon       = require ('gulp-real-favicon');
var fs                = require('fs');
var FAVICON_DATA_FILE = 'app/libs/favicon/faviconData.json';

var gulpUtil          = require('gulp-util');
var ftp               = require('gulp-ftp');
var vinyFTP           = require( 'vinyl-ftp' );

var critical          = require('critical').stream;

// эти два плагина отвечают за создания иконочных шрифтов из SVG
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now()/1000);

// переменая которая контролирует создание (true) или отключение (false) карты кода в файле
var isDevelopmant     = true;

gulp.task('serve', done => {
    browserSync.init({
        server: {
            baseDir: './app'
        },
        notify: false,
         open:true,
        // open: false,
        // online: false, // Work Offline Without Internet Connection
        // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
    });
    browserSync.watch('app', browserSync.reload);
    done();
});

gulp.task('styles', done => {
    return gulp.src('app/scss/main.scss')
.pipe(plumber({
     errorHandler: notify.onError({
            message: function(error) {
                return error.message;
            }})
 }))
.pipe(gulpif (isDevelopmant, sourcemaps.init({largeFile: true, loadMaps:true})))
.pipe(sass({ outputStyle: 'expanded' }))
// .on('error', notify.onError({
//     title: 'Error!',
//     message: '<%= error.message %>',
//     sound: 'Beep'
// }))
.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade:true}))
.pipe(rename({ suffix: '.min'}))
//.pipe(cleancss( {level: { 2: { specialComments: 0 } } })) // Opt., comment out when debugging
.pipe(filesize()).on('error', gulpUtil.log)
.pipe(gulpif (isDevelopmant, sourcemaps.write(".")))
.pipe(notify("Create file: <%= file.relative %>!"))
.pipe(gulp.dest('app/css'));
done();
});

gulp.task('scripts', done => {
var jsFiles = [
'app/libs/plagins/jquery/jquery.min.js',
//'app/libs/plagins/nicescroll/jquery.nicescroll.min.js',
//'app/libs/plagins/jquery.PageScroll2id/jquery.PageScroll2id.min.js',
'app/libs/plagins/magnific-popup/jquery.magnific-popup.min.js',
// 'app/libs/plagins/owlcarousel/owl.carousel.min.js',
'app/libs/plagins/slick/slick.min.js',
'app/libs/common.js'
// Always at the end
];
	return gulp.src(jsFiles)
	.pipe(concat('scripts.min.js'))
//	.pipe(uglify()) // Mifify js (opt.)
.pipe(notify("Create file: <%= file.relative %>!"))
	.pipe(gulp.dest('app/js'))
	.pipe(filesize()).on('error', gulpUtil.log);
    done();
});

gulp.task('code', done => {
	return gulp.src(['app/*.html', 'app/*php']);
    done();
});

gulp.task('picture', done => {
    return gulp.src(['app/img/*.{jpg,png,svg,ico}']);
    done();
});

gulp.task('watch', done => {
gulp.watch("app/scss/**/*.scss", gulp.series('styles'));
gulp.watch("app/libs/**/*.js", gulp.series('scripts'));
gulp.watch("app/*.html", gulp.series('code'));
gulp.watch("app/img/**/*.*", gulp.series('picture'));
done();
});

gulp.task('default', gulp.parallel(['styles','scripts', 'watch', 'serve']));

// Как подключиться по SSH
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
	}));
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

function cleaner() {
return del('dist/*');
}


function movefile() {
	return gulp.src('app/*.html')
       .pipe(critical({base: 'dist/',
            inline: true,
             css: 'app/css/main.min.css'}))
        .on('error', function(err) { gulpUtil.log(gulpUtil.colors.red(err.message)); })
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
     .pipe(filesize()).on('error', gulpUtil.log);
}
function movecss() {
    return gulp.src('app/css/main.min.css')
    .pipe(cleancss( {level: { 2: { specialComments: 0 } } })) // Opt., comment out when debugging
         .pipe(gulp.dest('dist/css'))
         .pipe(filesize()).on('error', gulpUtil.log);
}

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
        .pipe(filesize()).on('error', gulpUtil.log);
}

function compressimg() {
 return gulp.src('app/beforecompress/**/*')
     .pipe(tingpng('8cVpmwZQXvCdnVDk2FqdbWVk5RfJBS9Z'))
  .pipe(gulp.dest('dist/aftercompress'));
}

gulp.task('compressimg', gulp.series(compressimg));
gulp.task('cleanbuild', cleaner);
gulp.task('movefile', movefile);
gulp.task('movefilother', movefilother);
gulp.task('movejs', movejs);
gulp.task('movecss', movecss);
gulp.task('moveimages', gulp.series(moveimages));


gulp.task('build', gulp.series('cleanbuild', gulp.parallel('movefile', 'movefilother', 'movejs', 'movecss', 'moveimages' )));

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
gulp.task('injectfav', function() {
    return gulp.src(['app/*.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('app'));
});

// Check for updates on RealFaviconGenerator
gulp.task('updatefav', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});

// важные файлы размещены в каталоге templates/
// нужно использовать SVG большого размера хорошего качества

gulp.task('iconfont', function(){
  return gulp.src(['app/libs/svgforiconfonts/*.svg'])
     .pipe(iconfontCss({
      fontName: 'myfont', // required
      path: 'app/libs/templates/_icons.css',
      targetPath: '../../scss/_icons.css',
      fontPath: 'app/fonts/icons/'
    }))
    .pipe(iconfont({
      fontName: 'myfont', // required
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff'], // default, 'woff2' and 'svg' are available
      timestamp: runTimestamp, // recommended to get consistent builds when watching files
    }))
      .on('glyphs', function(glyphs, options) {
        // CSS templating, e.g.
        console.log(glyphs, options);
      })
    .pipe(gulp.dest('app/fonts/icons/'));
});