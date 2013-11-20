module.exports = function(grunt) {
	
	var FS_PATH = require('path');
	
	var TEXTUREPACKER_PATH = "";
	
	function log(err, stdout, stderr, cb) {
	    console.log(stdout);
	    cb();
	}
	
	grunt.initConfig({
		less: {
			development: {
				options: {
					paths: ['html/styles']
				},
				src: 'html/styles/main.less',
				dest: 'html/styles/main.css'
			}
		},		
	    shell: {
	        mongo: {
	            command: [
	                'mkdir database/db',
	                '"c:\\Program Files\\mongodb\\bin\\mongod.exe" --dbpath "c:\\Tomasz\\repos\\QuadPaintJS\\database"'
	            ].join('&&'),
		        options: {
		            //async: true,
		            stdout: true,
		            stderr: true,
		            callback: log
		        }
	        },
		    beefy: {
		      command: ['beefy',
		      	'scripts/main.js',
		      	'--cwd html'].join(" ")
		    },
			TexturePacker: {
                options: {
                	stdout: true,
					strderr: true,
					async: false
                },
                command: ["TexturePacker --data debug/styles/sprite.less",
				" --sheet debug/assets/ui/sprite.png",
				" --texturepath debug/assets/ui/",
				" --texture-format png",
				" --algorithm Basic",
				" --trim-mode None",
				" --force-publish",
				" --format multi-css",
				" --size-constraints POT",
				" design/icons"].join(" ")
			}
		},
		concurrent: {
			dev: {
//				tasks: ['shell:mongo','shell:beefy'],
				tasks: ['shell:beefy'],
				options: { logConcurrentOutput: true }
			}
		}
	});
	grunt.loadNpmTasks('grunt-concurrent');
	//grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-shell-spawn');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	
	grunt.registerTask('default', ['concurrent']);
	grunt.registerTask('TexturePacker', ['shell:TexturePacker'] );
};