
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
  sad     }               = types.export()

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@help = ( parse ) ->
  if types.isa.function show_help = parse.jobdef?.commands?.help?.runner
    echo()
    echo()
    show_help()
    echo()
  else
    info '^233387^', "no help command configured"
  exit_on_error = parse.jobdef.exit_on_error ? true
  # whisper '^233387^', parse
  if ( error = parse.verdict.error      ) ? null then stage = 'input'
  else if ( error = parse.output.error  ) ? null then stage = 'output'
  if error?
    ### TAINT use `_signal()` to derive defaults ###
    code    = error.code ? 18
    tag     = error.tag  ? 'UNKNOWN'
    message = error.message ? "an unspecified error occurred"
    warn '^mixa/runners/help@4457^', "tag: #{tag}, code: #{code}, stage: #{rpr stage}"
    warn '^mixa/runners/help@4457^', CND.reverse " #{message} "
    process.exit code if exit_on_error
  return parse

#-----------------------------------------------------------------------------------------------------------
@execSync = ( parse ) ->
  { jobdef
    verdict } = parse
  executable  = verdict.plus?.executable ? jobdef.executable ? verdict.cmd
  validate.nonempty_text executable
  argv        = verdict.argv        ? []
  ### TAINT make escaping of arguments configurable? ###
  args        = CND.shellescape argv
  # args        = argv.join ' '
  command     = "#{executable} #{args}"
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
  ### TAINT make this info part of result ###
  info '^233387^', { executable, argv, cwd: settings.cwd, parameters, command, }
  try ok = CP.execSync command, settings catch error
    ### TAINT don't throw error, return sad result ###
    return { error: { code: 16, tag: 'UNKNOWN', message: error.message, }, command, [sad]: true, }
  return { ok, command, }




