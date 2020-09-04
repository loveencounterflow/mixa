
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'MIXA/RUNNERS'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
CP                        = require 'child_process'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@help = ( parse ) ->
  info '^233387^', "======== display help text here =========="
  whisper '^233387^', parse

#-----------------------------------------------------------------------------------------------------------
@execSync = ( parse ) ->
  info '^233387^', "======== execSync =========="
  whisper '^233387^', parse





