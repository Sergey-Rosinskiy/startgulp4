"use strict";

const gulp              = require('gulp');
const sass              = require('gulp-sass');
const cssbeautify       = require('gulp-cssbeautify');
const stripCssComments  = require('gulp-strip-css-comments');
const strip             = require('gulp-strip-comments');
const concat            = require('gulp-concat');
const uglify            = require('gulp-uglify');
const cleancss          = require('gulp-clean-css');
const rename            = require('gulp-rename');
const autoprefixer      = require('gulp-autoprefixer');
const sourcemaps        = require('gulp-sourcemaps');
const plumber           = require('gulp-plumber');
const filesize          = require('gulp-filesize');
const notify            = require('gulp-notify');
const gulpUtil          = require('gulp-util');
const browserSync       = require('browser-sync').create();
const del               = require('del');
const ftp               = require('gulp-ftp');
const vinyFTP           = require( 'vinyl-ftp' );
const rsync             = require('gulp-rsync');
const svgmin            = require('gulp-svgmin');
const cheerio           = require('gulp-cheerio');
const replace           = require('gulp-replace');
const spriteSvg         = require('gulp-svg-sprite');
const spritesmith       = require('gulp.spritesmith');
const merge             = require('merge-stream');
const tingpng           = require('gulp-tinypng');
const imagemin          = require('gulp-imagemin');
const pngquant          = require('imagemin-pngquant');
const imageminJpg       = require('imagemin-jpeg-recompress');
const realFavicon       = require ('gulp-real-favicon');
const fs                = require('fs');
const FAVICON_DATA_FILE = 'app/libs/favicon/faviconData.json';
const iconfont          = require('gulp-iconfont');
const iconfontCss       = require('gulp-iconfont-css');
const runTimestamp      = Math.round(Date.now()/1000);
const critical          = require('critical').stream;
const log               = require('fancy-log');
const eslint            = require('gulp-eslint');




gulp.task('lint', () => {
    return gulp.src('app/libs/common.js')
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});





gulp.task('critical', function () {
  return gulp.src('dist/*.html')
  .pipe(critical({base: 'dist/', inline: true, css: 'dist/css/libs.min.css'}))
  .on('error', function(err) { log.error(err.message); })
  .pipe(gulp.dest('dist'));
});

gulp.task('styles', () => {
  let sassFiles = [
  'app/scss/libs.scss',
  'app/scss/main.scss'
  ];
  return gulp.src(sassFiles)
  .pipe(plumber({
    errorHandler: notify.onError(function(err){
      return {
        title: 'Styles',
        message:err.message
      }
    })
  }))
  .pipe(sourcemaps.init())
  .pipe(sass({ outputStyle: 'expanded' }))
  .pipe(autoprefixer(['last 6 versions', '> 1%', 'ie 8', 'ie 7'], {cascade:true}))
  .pipe(stripCssComments())
  .pipe(cssbeautify({indent: '  ', openbrace: 'separate-line', autosemicolon: true}))
  .pipe(concat('libs.css'))
  .pipe(rename('libs.min.css'))
//.pipe(cleancss( {level: { 2: { specialComments: 0 } } })) // Opt., comment out when debugging
.pipe(sourcemaps.write(''))
//.pipe(notify("Create file: <%= file.relative %>!"))
.pipe(gulp.dest('app/css'));
});

gulp.task('scripts', (done) => {
  let jsFiles = [
  'app/libs/plagins/jquery341.js',
  'app/libs/plagins/page-scroll-to-id-master/js/minified/jquery.malihu.PageScroll2id.min.js',
  'app/libs/plagins/magnific-popup/jquery.magnific-popup.min.js',
  'app/libs/plagins/slick/slick.min.js',
  'app/libs/common.js'
// Always at the end
];
return gulp.src(jsFiles)
.pipe(strip())
.pipe(concat('scripts.min.js'))
//  .pipe(uglify()) // Mifify js (opt.)
.pipe(notify("Create file: <%= file.relative %>!").on('error', gulpUtil.log) )
.pipe(gulp.dest('app/js'))
.pipe(filesize()).on('error', gulpUtil.log);
});

gulp.task('serve', done => {
	browserSync.init({
		server: {
			baseDir: './app'
		},
		notify: false,
		open:true,
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  });
	browserSync.watch('app', browserSync.reload);
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
function cleaner() {
	return del('dist/*');
}
function movefile() {
	return gulp.src('app/*.html')
  .pipe(strip())
  .pipe(gulp.dest('dist'));
}
function movefilother() {
	return gulp.src('app/*.{php,access}')
	.pipe(gulp.dest('dist'));
}
function movejs() {
	return gulp.src('app/js/scripts.min.js')
  //  .pipe(uglify()) // Mifify js (opt.)
  .pipe(gulp.dest('dist/js'))
  .pipe(filesize()).on('error', gulpUtil.log);
}
function movecss() {
	return gulp.src('app/css/*')
 //  .pipe(cleancss( {level: { 2: { specialComments: 0 } } })) // Opt., comment out when debugging
 .pipe(gulp.dest('dist/css'))
 .pipe(filesize()).on('error', gulpUtil.log);
}
function moveimages() {
	return gulp.src('app/img/**/*.{jpg,svg,png,ico}')
	.pipe(gulp.dest('dist/img'))
	.pipe(filesize()).on('error', gulpUtil.log);
}

// gulp.task('compressimg', gulp.series(compressimg));
gulp.task('cleanbuild', cleaner);
gulp.task('movefile', movefile);
gulp.task('movefilother', movefilother);
gulp.task('movejs', movejs);
gulp.task('movecss', movecss);
gulp.task('moveimages', gulp.series(moveimages));
gulp.task('build', gulp.series('cleanbuild', gulp.parallel('movefile', 'movefilother', 'movejs', 'movecss', 'moveimages' )));

// FTP: ftp://vh146.timeweb.ru
// Логин: cc63120
// Пароль: j7X4Y36Od5Zm
// http://cw25156.tmweb.ru/

gulp.task( 'ftp', function () {
	const conn = vinyFTP.create( {
		host:     'vh210.timeweb.ru',
		user:     'cw25156',
		password: '2qzRb2Wo2zjm',
		parallel: 10,
		log:      gulpUtil.log
	} );

	const globs = [
	'dist/**'
	];
    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance
    return gulp.src( globs, { base: './dist/', buffer: false } )
        .pipe( conn.newerOrDifferentSize( '/public_html' ) )// only upload newer files
        .pipe( conn.dest( '/public_html' ) );
      } );

// Generate Sprite icons
gulp.task('pngsprite', function () {
  // Generate our spritesheet
  let spriteData = gulp.src('app/libs/pngsprites/*.png')
  .pipe(spritesmith({
    imgName: 'pngsprite.png',
    imgPath: '../img/sprite/pngsprite.png',
    cssName: '_pngsprite.css',
  //  retinaSrcFilter: 'app/img/sprite/*@2x.png',
  //  retinaImgName: 'sprite@2x.png',
  //  retinaImgPath: '../img/sprite@2x.png',
  padding: 25
}));

  // Pipe image stream onto disk
  let imgStream = spriteData.img
  .pipe(gulp.dest('app/img/sprite/'));

  // Pipe CSS stream onto disk
  let cssStream = spriteData.css
  .pipe(gulp.dest('app/scss/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

// создаем SVG спрайты
gulp.task('svgsprite', function () {
	return gulp.src('app/libs/svgsprites/*.svg')
  // минифицируем svg
  .pipe(svgmin({
  	js2svg: {
  		pretty: true
  	}
  }))
  // удалить все атрибуты fill, style and stroke в фигурах
  .pipe(cheerio({
  	run: function ($) {
  		$('[fill]').removeAttr('fill');
  		$('[stroke]').removeAttr('stroke');
  		$('[style]').removeAttr('style');
  	},
  	parserOptions: {
  		xmlMode: true
  	}
  }))
  // cheerio плагин заменит, если появилась, скобка '&gt;', на нормальную.
  .pipe(replace('&gt;', '>'))
  // build svg sprite
  .pipe(spriteSvg({
  	mode: {
  		symbol: {
  			render: {
  				scss: {
  					dest:'../../scss/_svgsprite.scss',
  					template: 'app/libs/svgspritestemplate/_sprite-template.scss'
  				}
  			},
  			sprite: "../sprite/sprite.svg",
  			example: {
          dest: '../sprite/spriteSvgDemo.html' // демо html
        }
      }
    }
  }))
  .pipe(gulp.dest('app/img'));
});


function compressimg() {
  return gulp.src('app/compressimg/**/*')
  .pipe(tingpng('40Vtg4rNz0SLS5F1y6Ns4gBDQTNnlqWK'))
  .pipe(gulp.dest('app/compressimg-end'));
}

gulp.task('compressimg', gulp.series(compressimg));


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
  let currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, function(err) {
    if (err) {
      throw err;
    }
  });
});
