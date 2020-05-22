# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class MultilineterminalPlugin(octoprint.plugin.AssetPlugin):

	##~~ AssetPlugin mixin

	def get_assets(self):
		return dict(
			js=["js/multilineterminal.js"],
			css=["css/multilineterminal.css"]
		)

	##~~ Softwareupdate hook

	def get_update_information(self):
		return dict(
			multilineterminal=dict(
				displayName="Multi Line Terminal",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="jneilliii",
				repo="OctoPrint-MultiLineTerminal",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/jneilliii/OctoPrint-MultiLineTerminal/releases/download/{target_version}/{target_version}.zip"
			)
		)

__plugin_name__ = "Multi Line Terminal"
__plugin_pythoncompat__ = ">=2.7,<4" # python 2 and 3

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = MultilineterminalPlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}

