
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'MIXA'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
@types                    = require './types'
{ isa
  validate
  validate_optional
  cast
  type_of }               = @types.export()
# CP                        = require 'child_process'
# defer                     = setImmediate
parse_argv                = require 'command-line-args'
misfit                    = Symbol 'misfit'
# relpath                   = PATH.relative process.cwd(), __filename
{ freeze
  lets }                  = require 'letsfreezethat'

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
pluck = ( d, name, fallback = misfit ) ->
  R = d[ name ]
  delete d[ name ]
  unless R?
    return fallback unless fallback is misfit
    throw new Error "^cli@5477^ no such attribute: #{rpr name}"
  return R


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_compile_settings = ( settings ) ->
  meta      = []
  internals = []
  externals = []
  R         = { meta, internals, externals, }
  usr       = { meta: ( settings?.meta ? null ), commands: ( settings?.commands ? null ), }
  #.........................................................................................................
  for name, description of Object.assign {}, defaults.meta, usr.meta
    throw Error "^cli@5587^ must not have attribute name, got #{rpr description}" if description.name?
    meta.push lets description, ( d ) -> d.name = name
  #.........................................................................................................
  for name, description of Object.assign {}, defaults.commands, usr.commands
    throw Error "^cli@5588^ must not have attribute name, got #{rpr description}" if description.name?
    is_external = false
    e = lets description, ( d ) ->
      d.name      = name
      is_external = pluck d, 'external', false
    if is_external then externals.push e
    else                internals.push e
  #.........................................................................................................
  return freeze R

#-----------------------------------------------------------------------------------------------------------
defaults = freeze {
  meta:
    help:   { alias: 'h', type: Boolean, description: "show help and exit", }
    cd:     { alias: 'd', type: String,  description: "change to directory before running command", }
  commands:
    help:     { description: "show help and exit", }
    'cats!':
      description: "draw a cat"
      flags:
        color:  { alias: 'c', type: Boolean, description: "whether to use color", }
    version:  { description: "show project version and exit", }
  }


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_signal = ( R, run, exit_code = null, message = null ) ->
  validate.nonempty_text          run
  validate_optional.integer       exit_code
  validate_optional.nonempty_text message
  R.run       = run
  R.exit_code = exit_code
  R.message   = message
  return R

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@parse = ( settings, argv = null ) ->
  validate.mixa_settings settings
  return freeze @_parse ( @_compile_settings settings ), argv

#-----------------------------------------------------------------------------------------------------------
@_parse = ( me, argv = null ) ->
  #---------------------------------------------------------------------------------------------------------
  q =
    help:         false # place under `meta`
    testing:      argv? # place under `meta`
    stage:        null
  R =
    exit_code:    null
    message:      null
    cd:           null
    cmd:          null
    parameters:   {}
  #---------------------------------------------------------------------------------------------------------
  # Stage: Metaflags
  #.........................................................................................................
  q.stage = 'meta'
  argv    = argv ? process.argv
  d       = me.meta
  s       = { argv, stopAtFirstUnknown: true, }
  p       = parse_argv d, s
  argv    = pluck p, '_unknown', []
  q.help  = pluck p, 'help',  false
  if p.hasOwnProperty 'cd'
    return @_signal R, 'help_and_exit', 12, "^mixa@12^ must give target directory when using --dd, -d" unless p.cd?
    R.cd = pluck p, 'cd', null
  return @_signal R, 'help_and_exit', 0 if q.help
  return @_signal R, 'help_and_exit', 10, "^mixa@10^ extraneous flag #{rpr flag}" if ( flag = argv[ 0 ] )?.startsWith '-'
  #---------------------------------------------------------------------------------------------------------
  # Stage: Internal Commands
  # Internal commands must parse their specific flags and other arguments.
  #.........................................................................................................
  q.stage = 'internal'
  d       = { name: 'cmd', defaultOption: true, }
  p       = parse_argv d, { argv, stopAtFirstUnknown: true, }
  q.cmd   = pluck p, 'cmd', null
  argv    = pluck p, '_unknown', []
  return @_signal R, 'help_and_exit', 11, "^mixa@11^ missing command" unless q.cmd?
  #.........................................................................................................
  switch q.cmd
    when 'help'
      d                   = me.internals.help
      p                   = parse_argv d, { argv, stopAtFirstUnknown: true, }
      R.parameters.topic  = pluck p, 'topic', null
      argv                = pluck p, '_unknown', []
      return show_help_for_topic_and_exit q, argv
    when 'cat'
      return show_cat_and_exit()
  #---------------------------------------------------------------------------------------------------------
  # Stage: External Commands
  #.........................................................................................................
  # External commands call a child process that is passed the remaing command line arguments, so those
  # can be dealt with summarily.
  #.........................................................................................................
  q.stage             = 'external'
  p                   = parse_argv [], { argv, stopAtFirstUnknown: true, }
  argv                = pluck p, '_unknown', []
  R.parameters.argv   = argv[ .. ]
  ### TAINT derive list from settings ###
  if q.cmd in [ 'psql', 'node', 'nodexh', ]
    return q
  return @_signal R, 'help_and_exit', 13, "^mixa@13^ Unknown command #{CND.reverse rpr q.cmd}"

