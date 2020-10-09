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

			// command matching regex
			// (Example output for inputs G0, G1, G28.1, M117 test)
			// - 1: code including optional subcode. Example: G0, G1, G28.1, M117
			// - 2: main code only. Example: G0, G1, G28, M117
			// - 3: sub code, if available. Example: undefined, undefined, .1, undefined
			// - 4: command parameters incl. leading whitespace, if any. Example: "", "", "", " test"
			var commandRe = /^(([gmt][0-9]+)(\.[0-9+])?)(\s.*)?/i;
			var commandsToSend = [];
			var commandsToProcess = command.split("\n");
			for(idx in commandsToProcess){
				var command_line = commandsToProcess[idx];
				var commandMatch = command_line.match(commandRe);
				if (commandMatch !== null) {
					var fullCode = commandMatch[1].toUpperCase(); // full code incl. sub code
					var mainCode = commandMatch[2].toUpperCase(); // main code only without sub code

					if (self.terminalViewModel.blacklist.indexOf(mainCode) < 0 && self.terminalViewModel.blacklist.indexOf(fullCode) < 0) {
						// full or main code not on blacklist -> upper case the whole command
						command_line = command_line.toUpperCase();
					} else {
						// full or main code on blacklist -> only upper case that and leave parameters as is
						command_line = fullCode + (commandMatch[4] !== undefined ? commandMatch[4] : "");
					}
				}
				commandsToSend.push(command_line);
			}
			var commandsToSend = commandsToSend.filter(function(array_val) {
					return Boolean(array_val) === true;
				});

			OctoPrint.control.sendGcode(commandsToSend)
				.done(function() {
					self.terminalViewModel.cmdHistory.push(command.replace(/\n$/,''));
					self.terminalViewModel.cmdHistory.slice(-300); // just to set a sane limit to how many manually entered commands will be saved...
					self.terminalViewModel.cmdHistoryIdx = self.terminalViewModel.cmdHistory.length;
					self.terminalViewModel.command("");
				});
		};

		self.terminalViewModel.getHistoryMultiLine = function(direction) {
			if (direction == 1 || direction == -1) {
				if (direction == 1 && self.terminalViewModel.cmdHistory.length > 0 && self.terminalViewModel.cmdHistoryIdx > 0) {
					self.terminalViewModel.cmdHistoryIdx--;
				} else if (direction == -1 && self.terminalViewModel.cmdHistoryIdx < self.terminalViewModel.cmdHistory.length - 1) {
					self.terminalViewModel.cmdHistoryIdx++;
				}

				if (self.terminalViewModel.cmdHistoryIdx >= 0 && self.terminalViewModel.cmdHistoryIdx < self.terminalViewModel.cmdHistory.length) {
					self.terminalViewModel.command(self.terminalViewModel.cmdHistory[self.terminalViewModel.cmdHistoryIdx]);
				}
			}
		}

		self.terminalViewModel.handleKeyDownMultiLine = function(e){
			if (event.shiftKey && event.keyCode === 38) {
				self.terminalViewModel.getHistoryMultiLine(1);
				return false;
			}
			if (event.shiftKey && event.keyCode === 40) {
				self.terminalViewModel.getHistoryMultiLine(-1);
				return false;
			}
			if (event.shiftKey && event.keyCode === 13) {
				$('#terminal-send').trigger('click');
				return false;
			}
			// do not prevent default action
			return true;
		}

		self.onStartup = function(){
			$('#terminal-command').replaceWith('<textarea rows="4" class="input input-block-level" id="terminal-command" data-bind="textInput: command, event: { keydown: function(d,e) { return handleKeyDownMultiLine(e); } }, enable: isOperational() && loginState.isUser()"/>').parent('div').addClass('input prepend');
			$('#terminal-send').attr('data-bind','click: sendCommandMultiLine, enable: isOperational() && loginState.isUser()');
		}
	}

	OCTOPRINT_VIEWMODELS.push({
		construct: MultilineterminalViewModel,
		dependencies: ["terminalViewModel"],
		elements: []
	});
});
