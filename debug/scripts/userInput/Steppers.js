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

	var Steppers = new Class({
		userInputKeyboard: null,
		keyboardSteppers: null,
		initialize: function(userInputKeyboard) {
			this.userInputKeyboard = userInputKeyboard || new Keyboard();
			this.userInputKeyboard.onKeyDownSignal.add(this.onKeyDown.bind(this));
			this.keyboardSteppers = [];
			for (var i = 256 - 1; i >= 0; i--) {
				this.keyboardSteppers[i] = [];
			};
		},
		onKeyDown: function(keyCode, ctrlKey, altKey, shiftKey, metaKey) {
			for (var i = this.keyboardSteppers[keyCode].length - 1; i >= 0; i--) {
				var valueController = this.keyboardSteppers[keyCode][i];
				if(valueController.ctrlKey == ctrlKey && 
				valueController.altKey == altKey &&
				valueController.shiftKey == shiftKey &&
				valueController.metaKey == metaKey) {
					var tempValue = valueController.object[valueController.valueKey];
					if(keyCode == valueController.incrementKeyCode) tempValue++;
					else if(keyCode == valueController.decrementKeyCode) tempValue--;
					if(tempValue >= valueController.total) tempValue = valueController.total-1;
					else if(tempValue < 0) tempValue = 0;
					valueController.object[valueController.valueKey] = tempValue;
				}
			}
		},
		addValue: function(object, valueKey, incrementKeyCode, decrementKeyCode, total, ctrlKey, altKey, shiftKey, metaKey) {
			var valueController = {
				object: object,
				valueKey: valueKey,
				incrementKeyCode: incrementKeyCode,
				decrementKeyCode: decrementKeyCode,
				total: total,
				ctrlKey: !!ctrlKey,
				altKey: !!altKey,
				shiftKey: !!shiftKey,
				metaKey: !!metaKey
			}
			this.keyboardSteppers[incrementKeyCode].push(valueController);
			this.keyboardSteppers[decrementKeyCode].push(valueController);
			return valueController;
		}

	});
	return Steppers;
});