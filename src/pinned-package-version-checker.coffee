

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'MIXA/VERSION-CHECKER'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
SEMVER                    = require 'semver'
packages_and_versions     = require '../pinned-package-versions.json'

#===========================================================================================================
do =>
  offenders   = []
  for package_name, matcher of packages_and_versions.pinned_versions
    { version, }  = require "#{package_name}/package.json"
    unless SEMVER.satisfies version, matcher
      offenders.push "#{package_name}@#{version} (≁ #{matcher})"
      warn '^mixa/version-checker@1^', CND.reverse \
        "version of #{package_name} pinned at #{rpr matcher}, got #{rpr version}"
  return null if offenders.length is 0
  throw new Error "^mixa/version-checker@2^ the following packages do not have a matching version: " + \
    offenders.join ', '



