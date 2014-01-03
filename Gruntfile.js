module.exports = function(grunt) {
	
	var FS_PATH = require('path');
	
	function log(err, stdout, stderr, cb) {
	    console.log(stdout);
	    cb();
	}
	
	grunt.initConfig({
		less: {
			development: {
				options: {
					paths: ['debug/styles']
				},
				src: 'debug/styles/main.less',
				dest: 'debug/styles/main.css',
			}
		},
	    shell: {
	        mongo: {
	            command: [
	                //'mkdir database',
	                //'mkdir database/db',
	                'mongod --dbpath database/db'
	            ].join('&&'),
		        options: {
		            //async: true,
		            stdout: true,
		            stderr: true,
		            callback: log
		        }
	        }
		},
		express: {
			custom: {
				options: {
					port: 9001,
					server: FS_PATH.resolve(__dirname, './app')
					// if you do not define a port it will start your server at port 3000
				}
			}
		},
		concurrent: {
			default: {
//				tasks: ['shell:mongo'],
				tasks: ['shell:mongo'],
				options: { logConcurrentOutput: true }
			}
		}	
	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-express');
	//grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-shell-spawn');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.registerTask('default', ['concurrent', 'express', 'express-keepalive']);

};