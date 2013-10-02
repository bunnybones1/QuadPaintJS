require.config({
	baseUrl: 'scripts',

	paths: {
        'text': 'vendor/require/text',
        'detector': 'vendor/Detector',
        'stats': 'vendor/stats.min',
        'three': 'vendor/three.r60',
        'KeyboardState': 'vendor/THREEx.KeyboardState',
        'RendererStats': 'vendor/THREEx.RendererStats',
        'baseClass': 'vendor/jsOOP/baseClass',
		'Class': 'vendor/jsOOP/Class',
		'Signal': 'vendor/js-signals/signals.min',
        'GUI': 'vendor/dat.gui',
        '_': 'vendor/underscore',
	},

    shim: {
        'detector': {
            exports: 'Detector'
        },
        'stats': {
            exports: 'Stats'
        },
        'three': {
            exports: 'THREE'
        },
        '_': { 
            exports: '_'
        },
    },
    urlArgs: "bust="+123321
});

require([
    "Global",
    "QuadPaint"
], function (
    Global,
    QuadPaint
) {
    var qp = new QuadPaint({});
});