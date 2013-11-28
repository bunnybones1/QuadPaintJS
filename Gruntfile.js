module.exports = function(grunt) {
	
	function log(err, stdout, stderr, cb) {
	    console.log(stdout);
	    cb();
	}
	
	grunt.initConfig({
	    shell: {
		    beefy: {
		      command: ['beefy',
		      	'scripts/main.js',
		      	'--cwd html'].join(" ")
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
	grunt.loadNpmTasks('grunt-shell-spawn');
	
	grunt.registerTask('default', ['concurrent']);
};