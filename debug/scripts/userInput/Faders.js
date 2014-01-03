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

	var Faders = new Class({
		userInputKeyboard: null,
		keyboardFaders: null,
		step: .01,
		stepScale: 1.1,
		initialize: function(userInputKeyboard) {
			this.userInputKeyboard = userInputKeyboard || new Keyboard();
			this.userInputKeyboard.onKeyDownSignal.add(this.onKeyDown.bind(this));
			this.userInputKeyboard.onKeyUpSignal.add(this.onKeyUp.bind(this));
			this.keyboardFaders = [];
			for (var i = 256 - 1; i >= 0; i--) {
				this.keyboardFaders[i] = [];
			};
			this.downKeys = [];
		},
		onKeyDown: function(keyCode, ctrlKey, altKey, shiftKey, metaKey) {
			for (var i = this.downKeys.length - 1; i >= 0; i--) {
				var key = this.downKeys[i];
				if(key.keyCode == keyCode &&
				key.ctrlKey == ctrlKey &&
				key.altKey == altKey &&
				key.shiftKey == shiftKey &&
				key.metaKey == metaKey) {
					return;
				}
			};
			this.downKeys.push({
				keyCode: keyCode,
				ctrlKey: ctrlKey,
				altKey: altKey,
				shiftKey: shiftKey,
				metaKey: metaKey
			});
			this.ctrlKey = ctrlKey;
			this.altKey = altKey;
			this.shiftKey = shiftKey;
			this.metaKey = metaKey;
		},
		onKeyUp: function(keyCode) {
			for (var i = this.downKeys.length - 1; i >= 0; i--) {
				var key = this.downKeys[i];
				if(key.keyCode == keyCode) this.downKeys.splice(i, 1);
			}
			for (var i = this.keyboardFaders[keyCode].length - 1; i >= 0; i--) {
				this.keyboardFaders[keyCode][i].step = this.keyboardFaders[keyCode][i].stepDefault;
			};
		},
		update: function() {
			for (var i = this.downKeys.length - 1; i >= 0; i--) {
				var keyCode = this.downKeys[i].keyCode;
				for (var j = this.keyboardFaders[keyCode].length - 1; j >= 0; j--) {
					var valueController = this.keyboardFaders[keyCode][j];
					if(valueController.ctrlKey == this.ctrlKey && 
					valueController.altKey == this.altKey &&
					valueController.shiftKey == this.shiftKey &&
					valueController.metaKey == this.metaKey) {
						var tempValue = valueController.object[valueController.valueKey];
						if(keyCode == valueController.incrementKeyCode) tempValue += valueController.step;
						else if(keyCode == valueController.decrementKeyCode) tempValue -= valueController.step;
						if(tempValue > 1) tempValue = 1;
						else if(tempValue < 0) tempValue = 0;
						valueController.object[valueController.valueKey] = tempValue;
						valueController.step *= valueController.stepScale;
					}
				}
			};
		},
		addValue: function(object, valueKey, incrementKeyCode, decrementKeyCode, defaultStep, defaultStepScale, ctrlKey, altKey, shiftKey, metaKey) {
			defaultStep = defaultStep === undefined ? this.step : defaultStep;
			defaultStepScale = defaultStepScale === undefined ? this.stepScale : defaultStepScale;
			var valueController = {
				object: object,
				valueKey: valueKey,
				incrementKeyCode: incrementKeyCode,
				decrementKeyCode: decrementKeyCode,
				stepDefault: defaultStep,
				stepScale: defaultStepScale,
				step: defaultStep,
				ctrlKey: !!ctrlKey,
				altKey: !!altKey,
				shiftKey: !!shiftKey,
				metaKey: !!metaKey
			}
			this.keyboardFaders[incrementKeyCode].push(valueController);
			this.keyboardFaders[decrementKeyCode].push(valueController);
			return valueController;
		}

	});
	return Faders;
});