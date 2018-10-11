const gulp       = require( 'gulp' );
const ts         = require( 'gulp-typescript' );
const tslint     = require( 'gulp-tslint' );
const tslintBase = require( 'tslint' );
const sourcemaps = require( 'gulp-sourcemaps' );
const uglify     = require( 'gulp-uglify' );
const browserify = require( 'browserify' );
const source     = require( 'vinyl-source-stream');
const buffer     = require( 'vinyl-buffer' );
const tsify      = require( 'tsify' );
const sass       = require( 'gulp-sass' );
const baseTs     = require( 'typescript' );
const vueify     = require( 'vueify' );

const project = ts.createProject( 'tsconfig.json' );

gulp.task( 'copy-html', () => {
	return gulp.src( 'index.html' )
		.pipe( gulp.dest( 'dist/' ) );
} );

gulp.task( 'build', [ 'copy-html' ], () => {
	// set up the browserify instance on a task basis
	return browserify( {
		basedir: '.',
		entries: [ 'src/main.ts' ],
		debug: true
	} )
		.transform( vueify, {
			customCompilers: {
				// for tags with lang = "ts"
				ts: (content, cb, compiler, filePath) => {
					// content:           content extracted from lang = "ts" blocks
					// cb:                the callback to call when you're done compiling
					// compiler:          the vueify compiler instance
					// filePath:          the path for the file being compiled

					// compile some TypeScript... and when you're done:
					const result = baseTs.transpileModule( content, {
						compilerOptions: {
							module: baseTs.ModuleKind.CommonJS,
							esModuleInterop: true,
							target: baseTs.ScriptTarget.ES5,
						},
					} );
					cb( null, result.outputText );
				}
			}
		} )
		.plugin( 'vueify/plugins/extract-css', { out: 'dist/css/components.css' } )
		.plugin( tsify )
		.on( 'error', console.log )
		.bundle()
		.on( 'error', console.log )
		.pipe( source( 'main.js' ) )
		.pipe( buffer() )
		.pipe( sourcemaps.init( { loadMaps: true } ) )
		.pipe( uglify( {
			keep_fnames: true,
		} ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'lint', [ 'build' ], () => {
	const program = tslintBase.Linter.createProgram( './tsconfig.json' );

	// TODO: ideally this could use project.src(), but that makes it lint all the JS files
	// TODO: this won't lint .vue files; I have editor support for that, but it would be good to do here too
	return gulp.src( [ 'src/*.ts' ] )
		.pipe( tslint( {
			formatter: 'verbose',
			program:   program,
			configurationFile: './tslint.json'
		} ) )
	.pipe( tslint.report( {
		allowWarnings: true,
		summarizeFailureOutput: true,
	} ) );
} );

gulp.task( 'styles', () => {
	gulp.src( 'styles/**/*.scss' )
		.pipe( sourcemaps.init() )
		.pipe( sass().on( 'error', sass.logError ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './dist/css/' ) );
} );

gulp.task( 'watch', () => {
	// TODO: can this use project.src() instead of this list?
	gulp.watch(
		[ 'src/*.ts', 'index.html', 'styles/*.scss' ],
		[ 'build', 'lint', 'styles' ]
	);
} );

gulp.task( 'default', [ 'build', 'lint', 'styles' ] );