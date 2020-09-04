
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
types                     = require './types'
{ isa
  validate
  validate_optional
  cast
  type_of }               = types.export()


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@help = ( parse ) ->
  info '^233387^', "======== display help text here =========="
  whisper '^233387^', parse

#-----------------------------------------------------------------------------------------------------------
@execSync = ( parse ) ->
  { jobdef
    verdict } = parse
  executable  = verdict.plus?.executable ? jobdef.executable ? verdict.cmd
  validate.nonempty_text executable
  argv        = verdict.argv        ? []
  ### TAINT escape command string; would be better to use array but not possible? ###
  command     = "#{executable} #{argv.join ' '}"
  settings    =
    cwd:          verdict.cd ? process.cwd()
    encoding:     'utf-8'
  parameters  = verdict.parameters  ? null
  if parameters? and ( keys = Object.keys parameters ).length > 0
    ### TAINT apply parameters to CP settings? ###
    ### TAINT don't throw error, return sad result ###
    throw new Error "^33667^ don't know parameters #{rpr parameters}"
  info '^233387^', "======== execSync =========="
  whisper '^233387^', parse
  info '^233387^', { executable, argv, cwd: settings.cwd, parameters, }
  try R = CP.execSync command, settings catch error
    ### TAINT don't throw error, return sad result ###
    throw error
  return R




