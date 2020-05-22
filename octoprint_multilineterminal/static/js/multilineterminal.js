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

			OctoPrint.control.sendGcode(command.split("\n"))
				.done(function() {
					self.terminalViewModel.cmdHistory.push(command);
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

		self.terminalViewModel.handleKeyUpMultiLine = function(e){
			if (event.shiftKey && event.keyCode === 13) {
				$('#terminal-send').trigger('click');
			}
			// do not prevent default action
			return true;
		};

		self.onStartup = function(){
			$('#terminal-command').replaceWith('<span class="add-on" id="multilinehistorybuttons"><a class="icon icon-arrow-up" data-bind="click: function(){getHistoryMultiLine(1);}, enable: isOperational() && loginState.isUser()"></a><a class="icon icon-arrow-down" data-bind="click: function(){getHistoryMultiLine(-1);}, enable: isOperational() && loginState.isUser()"></a></span><textarea rows="4" class="input input-block-level" id="terminal-command" data-bind="textInput: command, event: { keyup: function(d,e) { return handleKeyUpMultiLine(e); } }, enable: isOperational() && loginState.isUser()"/>').parent('div').addClass('input prepend');
			$('#terminal-send').attr('data-bind','click: sendCommandMultiLine, enable: isOperational() && loginState.isUser()');
		}
	}

	OCTOPRINT_VIEWMODELS.push({
		construct: MultilineterminalViewModel,
		dependencies: ["terminalViewModel"],
		elements: []
	});
});
