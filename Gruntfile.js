// Generated on 2014-10-21 using
// generator-webapp 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function(grunt) {


	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	var style = require('grunt-cmd-transport').style.init(grunt);

	// Configurable paths
	var config = {
		app: 'app',
		dist: 'dist'
	};

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		config: config,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			js: {
				files: ['<%= config.app %>/scripts/**/*.js'],
				// tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			jstest: {
				files: ['test/spec/{,*/}*.js'],
				tasks: ['test:watch']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			sass: {
				files: ['<%= config.app %>/styles/**/*.{scss,sass}'],
				tasks: ['sass:server', 'autoprefixer']
			},
			styles: {
				files: ['<%= config.app %>/styles/**/*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.app %>/**/*.html',
					'.tmp/styles/**/*.css',
					'<%= config.app %>/images/**/*',
					'app/scripts/**/*.js'
				]
			},
			template: {
				files: ['<%= config.app %>/templates/**/*.html'],
				tasks: ['tmod:template']
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				open: true,
				livereload: 35729,
				// Change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
							connect().use('/bower_components', connect.static('./bower_components')),
							connect.static(config.app)
						];
					}
				}
			},
			test: {
				options: {
					open: false,
					port: 9001,
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
							connect.static('test'),
							connect().use('/bower_components', connect.static('./bower_components')),
							connect.static(config.app)
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= config.dist %>',
					livereload: false
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= config.app %>/scripts/**/*.js',
				'test/spec/{,*/}*.js'
			]
		},

		// Mocha testing framework configuration options
		mocha: {
			all: {
				options: {
					run: true,
					urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/**/*.html']
				}
			}
		},

		// cmd-transport
		transport: {
			options: {
				paths: ['app'],
				debug: false,
				alias: {
					"base": "scripts/base",
					"baseController": "scripts/baseController",

					// factory
					"factory.application": "scripts/factory/Application",
					"factory.organization": "scripts/factory/organization",
					"factory.user": "scripts/factory/user",

					// public
					"advertMaker": "scripts/public/advertMaker",
					"ajaxhandler": "scripts/public/ajaxHandler",
					"array": "scripts/public/array",
					"browser": "scripts/public/browser",
					"config": "scripts/public/config",
					"date": "scripts/public/date",
					"eventListener": "scripts/public/eventListener",
					"helper": "scripts/public/helper",
					"history": "scripts/public/history",
					"AssistiveTouch": "scripts/public/AssistiveTouch",
					"loader": "scripts/public/loader",
					"localStore": "scripts/public/localStore",
					"alert": "scripts/public/Ly.alert",
					"toast": "scripts/public/Ly.toast",
					"ly.modal": "scripts/public/Ly.modal",
					"scrollToBottom": "scripts/public/scrollToBottom",
					"validation": "scripts/public/validate",
					"public.homeMenu": "scripts/public/HomeMenu",
					"public.statistics": "scripts/public/statistics",

					// directives
					"directive.accordion": "scripts/directives/accordion",

					// lib
					"lib.imageUploader": "scripts/lib/imageUploader",

					"lib.form": "scripts/lib/Form",
					"lib.form.text": "scripts/lib/form/Text",
					"lib.form.date": "scripts/lib/form/Date",
					"lib.form.choice": "scripts/lib/form/Choice",

					// 绑定手机
					"lib.phoneBindBox": "scripts/lib/PhoneBindBox",
					// 绑定邮箱
					"lib.emailBindBox": "scripts/lib/EmailBindBox",

					"lib.makeFields": "scripts/lib/makeFields",
					"ImageBox": "scripts/lib/ImageBox",
					"tips": "scripts/lib/Ly.tips",
					"modalbox": "scripts/lib/modalbox",
					"qrcode": "scripts/lib/QRCode",
					"REQUIREINFO": "scripts/lib/RequireInfo",
					"Color": "scripts/lib/Color",
					"lib.commentBox": "scripts/lib/CommentBox",
					"lib.categorySelector": "scripts/lib/CategorySelector",
					"lib.citySelector": "scripts/lib/CitySelector",
					"lib.searchBox": "scripts/lib/SearchBox",
					"lib.headerListener": "scripts/lib/headerListener",
					"lib.praiseAnimation": "scripts/lib/PraiseAnimation",


					// plugins
					"audiojs": "plugins/audiojs/audiojs/audio.min",
					"dropkick": "plugins/dropkick/dropkick",
					"dropkick.css": "plugins/dropkick/production/css/dropkick.css",


					//templates
					"template": "scripts/public/template",

					// configs


					//services
					'AccountService': 'scripts/services/AccountService',
					'AdvertisementService': 'scripts/services/AdvertisementService',
					'ArticleService': 'scripts/services/ArticleService',
					'AwardService': 'scripts/services/AwardService',
					'CommentService': 'scripts/services/CommentService',
					'EventService': 'scripts/services/EventService',
					'ExhibitionService': 'scripts/services/ExhibitionService',
					'FeedbackService': 'scripts/services/FeedbackService',
					'FormService': 'scripts/services/FormService',
					'HomePageService': 'scripts/services/HomePageService',
					'LogService': 'scripts/services/LogService',
					'LostService': 'scripts/services/LostService',
					'LotteryService': 'scripts/services/LotteryService',
					'MemberService': 'scripts/services/MemberService',
					'MengxiaozhuService': 'scripts/services/MengxiaozhuService',
					'NoticeService': 'scripts/services/NoticeService',
					'NotificationService': 'scripts/services/NotificationService',
					'OrganizationService': 'scripts/services/OrganizationService',
					'PraiseService': 'scripts/services/PraiseService',
					'ProposalService': 'scripts/services/ProposalService',
					'PublicService': 'scripts/services/PublicService',
					'QuestionnaireService': 'scripts/services/QuestionnaireService',
					"RelatedOrganizationService": "scripts/services/RelatedOrganizationService",
					'RelationService': 'scripts/services/RelationService',
					'TicketService': 'scripts/services/TicketService',
					'UserService': 'scripts/services/UserService',
					'VoteService': 'scripts/services/VoteService',
					'WallService': 'scripts/services/WallService',
					'WeChatService': 'scripts/services/WeChatService',

					"wxsdk": "http://res.wx.qq.com/open/js/jweixin-1.0.0.js"
				}
			},
			release: {
				files: [{
					expand: true,
					cwd: 'app',
					src: [
						'scripts/**/*.js',
						'!scripts/seajs-config.js',
						'!**/--*.js'
					],
					dest: 'dist'
				}, {
					expand: true,
					src: ['.tmp/**/*.css', 'bower_components/font-awesome/css/font-awesome.css']
				}]
			}
		},

		// Compiles Sass to CSS and generates necessary files if requested
		sass: {
			options: {
				loadPath: [
					'bower_components'
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/styles',
					src: ['*.{scss,sass}'],
					dest: '.tmp/styles',
					ext: '.css'
				}]
			},
			server: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/styles',
					src: ['*.scss'],
					dest: '.tmp/styles',
					ext: '.css'
				}]
			}
		},

		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 8', 'ie 9', 'ie 10', 'ie 11']
			},
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/styles/',
					src: ['**/*.css', '!**/noprefixer.css'],
					dest: '.tmp/styles/'
				}]
			}
		},

		// Automatically inject Bower components into the HTML file
		wiredep: {
			app: {
				ignorePath: /^\/|\.\.\//,
				src: ['<%= config.app %>/home.html'],
				exclude: ['bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js']
			},
			sass: {
				src: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
				ignorePath: /(\.\.\/){1,2}bower_components\//
			}
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= config.dist %>/styles/main.css',
						'<%= config.dist %>/scripts/vendor.js'
					]
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			options: {
				dest: '<%= config.dist %>'
			},
			html: '<%= config.app %>/**/*.html'
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			options: {
				assetsDirs: [
					'<%= config.dist %>',
					'<%= config.dist %>/images',
					'<%= config.dist %>/styles'
				]
			},
			html: ['<%= config.dist %>/**/*.html'],
			css: ['<%= config.dist %>/styles/**/*.css']
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/images',
					src: '**/*.{gif,jpeg,jpg,png}',
					dest: '<%= config.dist %>/images'
				}]
			}
		},

		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/images',
					src: '**/*.svg',
					dest: '<%= config.dist %>/images'
				}]
			}
		},

		htmlmin: {
			dist: {
				options: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					conservativeCollapse: true,
					removeAttributeQuotes: true,
					removeCommentsFromCDATA: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true,
					removeRedundantAttributes: true,
					useShortDoctype: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.dist %>',
					src: ['**/*.html', '!dist/templates/'],
					dest: '<%= config.dist %>'
				}]
			}
		},

		// By default, your `index.html`'s <!-- Usemin block --> will take care
		// of minification. These next options are pre-configured if you do not
		// wish to use the Usemin blocks.
		cssmin: {
			dist: {
				files: [{
					expand: true,
					cwd: "dist/styles",
					dest: "dist/styles",
					src: ["*.*"]
				}]
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> build by picker */\n'
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'dist/scripts',
					src: ['**/*.js', '!debug/**/*.js'],
					dest: 'dist/scripts'
				}, {
					expand: true,
					cwd: 'dist/plugins',
					src: '**/*.js',
					dest: 'dist/plugins'
				}]
			}
		},
		concat: {
			options: {
				include: 'relative',
				css2js: style.css2js,
				noncmd: true
			},
			dist: {

				files: {
					'dist/scripts/application.js': [
						'dist/scripts/application.js',
						'dist/scripts/base.js',
						'dist/scripts/directives/*.js',
						'dist/scripts/factory/*.js',
						'dist/scripts/public/*.js',
						'dist/scripts/services/*.js',
						'dist/scripts/baseController.js',
						'dist/scripts/router.js',
						'dist/scripts/template.js'
					]
				}
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'images/**/*',
						'**/*.html',
						"!templates/**/*",
						'styles/fonts/{,*/}*.*'
					]
				}, {
					expand: true,
					dot: true,
					cwd: '.tmp',
					src: ['styles/*.css'],
					dest: 'dist/'
				}, {
					expand: true,
					dot: true,
					cwd: 'app',
					src: ['plugins/**/*.*', 'posters/**/*.*', 'demos/**/*.*', 'assets/**/*.*'],
					dest: 'dist/'
				}]
			},
			dest: {
				files: [{
					expand: true,
					dot: true,
					cwd: '.tmp/concat',
					dest: 'dist',
					src: '**/*.*'
				}, {
					expand: true,
					dot: true,
					cwd: 'app/scripts',
					dest: 'dist/scripts',
					src: ['baseSea.js']
				}]
			},
			styles: {
				expand: true,
				dot: true,
				cwd: '<%= config.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			},
			debug: {
				expand: true,
				dot: true,
				cwd: 'app/scripts',
				dest: 'dist/scripts/debug',
				src: ['**', "!.cache/**"]
			}
		},

		// Generates a custom Modernizr build that includes only the tests you
		// reference in your app
		modernizr: {
			dist: {
				devFile: 'bower_components/modernizr/modernizr.js',
				outputFile: '<%= config.dist %>/scripts/vendor/modernizr.js',
				// files: {
				// 	src: [
				// 		'<%= config.dist %>/scripts/{,*/}*.js',
				// 		'<%= config.dist %>/styles/{,*/}*.css',
				// 		'!<%= config.dist %>/scripts/vendor/*'
				// 	]
				// },
				uglify: false
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			server: [
				'sass:server',
				'tmod'
			],
			test: [
				'copy:styles'
			],
			dist: [
				'sass:dist',
				'copy:styles',
				'tmod'
			]
		},
		// TmodJs to Compile
		tmod: {
			options: {
				combo: true,
				syntax: 'simple',
				minify: true,
				cache: false,
				debug: true
			},
			template: {
				src: ['app/templates/**/*.html', '!app/templates/**/--*.html'],
				dest: 'app/scripts/template.js'
			}
		}
	});


	grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function(target) {
		if (grunt.option('allow-remote')) {
			grunt.config.set('connect.options.hostname', '0.0.0.0');
		}
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			//'wiredep',
			'concurrent:server',
			'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('server', function(target) {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run([target ? ('serve:' + target) : 'serve']);
	});

	grunt.registerTask('test', function(target) {
		if (target !== 'watch') {
			grunt.task.run([
				'clean:server',
				'concurrent:test',
				'autoprefixer'
			]);
		}

		grunt.task.run([
			'connect:test',
			'mocha'
		]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		//'wiredep',
		'useminPrepare',
		'concurrent:dist',
		'autoprefixer',
		'copy:dist',
		// 'modernizr',

		'transport',
		'concat',
		'copy:dest',
		'copy:debug',

		//压缩js文件
		'uglify',

		'cssmin',

		// 静态资源替换
		'rev',
		'usemin',
		'htmlmin',
	]);

	grunt.registerTask('default', [
		'newer:jshint',
		'test',
		'build'
	]);
};