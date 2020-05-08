/*
 * View model for OctoPrint-MultiLineTerminal
 *
 * Author: jneilliii
 * License: AGPLv3
 */
$(function() {
	function MultilineterminalViewModel(parameters) {
		var self = this;

		self.terminalViewModel = parameters[0];

		self.terminalViewModel.sendCommandMultiLine = function() {
			var command = self.terminalViewModel.command();
			if (!command) {
				return;
			}

			OctoPrint.control.sendGcode(command.split("\n"));
		};

		self.onStartup = function(){
			$('#terminal-command').replaceWith('<textarea rows="4" class="input input-block-level" id="terminal-command" data-bind="value: command, event: { keyup: function(d,e) { return handleKeyUp(e); }, keydown: function(d,e) { return handleKeyDown(e); } }, enable: isOperational() && loginState.isUser()"/>');
			$('#terminal-send').attr('data-bind','click: sendCommandMultiLine, enable: isOperational() && loginState.isUser()');
		}
	}

	OCTOPRINT_VIEWMODELS.push({
		construct: MultilineterminalViewModel,
		dependencies: ["terminalViewModel"],
		elements: []
	});
});
