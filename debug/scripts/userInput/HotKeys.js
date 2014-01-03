define([
	'Class',
	'userInput/Keyboard',
	'Global',
	'signals'
], function(
	Class,
	Keyboard,
	Global,
	signals
) {

	var HotKeys = new Class({
		userInputKeyboard: null,
		hotKeys: null,
		initialize: function(userInputKeyboard) {
			this.userInputKeyboard = userInputKeyboard || new Keyboard();
			this.userInputKeyboard.onKeyDownSignal.add(this.onKeyDown.bind(this));
			this.hotKeys = [];
			for (var i = 256 - 1; i >= 0; i--) {
				this.hotKeys[i] = [];
			};
		},
		onKeyDown: function(keyCode, ctrlKey, altKey, shiftKey, metaKey) {
			for (var i = this.hotKeys[keyCode].length - 1; i >= 0; i--) {
				var hk = this.hotKeys[keyCode][i];
				if(hk.ctrlKey == ctrlKey && 
					hk.altKey == altKey &&
					hk.shiftKey == shiftKey &&
					hk.metaKey == metaKey) {
					hk.callback();
				}
			};
		},
		addCallback: function(callback, keyCode, ctrlKey, altKey, shiftKey, metaKey) {
			var hk = {
				callback:callback,
				keyCode: keyCode,
				ctrlKey: !!ctrlKey,
				altKey: !!altKey,
				shiftKey: !!shiftKey,
				metaKey: !!metaKey
			}
			this.hotKeys[keyCode].push(hk);
		}
	});
	return HotKeys;
});