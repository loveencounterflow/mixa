
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

#-----------------------------------------------------------------------------------------------------------
as_list_of_flags = ( flags ) ->
  R = []
  return R unless flags?
  for k, v of flags
    v.name = k
    R.push v
  return R

#-----------------------------------------------------------------------------------------------------------
defaults = freeze {
  meta:
    help:   { alias: 'h', type: Boolean, description: "show help and exit", }
    cd:     { alias: 'd', type: String,  description: "change to directory before running command", }
  commands:
    help:
      description:  "show help and exit"
      flags:
        topic:  { type: String, defaultOption: true, }

    'cats!':
      description:  "draw cats!"
      flags:
        color:  { alias: 'c', type: Boolean, description: "whether to use color", }
    version:  { description: "show project version and exit", }
  }

#-----------------------------------------------------------------------------------------------------------
E =
  OK:             0
  MISSING_CMD:    10
  UNKNOWN_CMD:    11
  HAS_NAME:       12
  NEEDS_VALUE:    13
  UNKNOWN_FLAG:   14
  EXTRA_FLAGS:    15
  OTHER:          16

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@compile_settings = ( settings ) ->
  validate.mixa_settings settings
  meta      = []
  commands  = {}
  R         = { meta, commands, }
  usr       = { meta: ( settings?.meta ? null ), commands: ( settings?.commands ? null ), }
  #.........................................................................................................
  for name, description of Object.assign {}, defaults.meta, usr.meta
    if description.name?
      ### TAINT do not throw error, return sad value ###
      throw Error "^cli@5587^ must not have attribute 'name', got #{rpr description}"
    meta.push lets description, ( d ) ->
      d.name = name
      if d.multiple?
        switch d.multiple
          when false    then null
          when 'lazy'   then delete d.multiple; d.lazyMultiple = true
          when 'greedy' then d.multiple = true
      return null
  #.........................................................................................................
  for name, description of Object.assign {}, defaults.commands, usr.commands
    if description.name?
      ### TAINT do not throw error, return sad value ###
      throw Error "^cli@5588^ must not have attribute 'name', got #{rpr description}"
    e = lets description, ( d ) ->
      d.name          = name
      d.flags         = as_list_of_flags d.flags
      d.allow_extra  ?= false
    commands[ name ] = e
  #.........................................................................................................
  return freeze R


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_signal = ( R, cmd, tag = 'OK', message = null ) ->
  validate.nonempty_text          cmd
  validate.nonempty_text          tag
  if tag is 'OK'
    validate.null message
  else
    validate.nonempty_text message
    code            = E[ tag ] ? '111'
    R.error         = { code, tag, message, }
    R[ @types.sad ] = true
  R.cmd = cmd
  return R

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@parse = ( settings, argv = null ) -> freeze @_parse ( @compile_settings settings ), argv

#-----------------------------------------------------------------------------------------------------------
@_parse = ( me, argv = null ) ->
  #---------------------------------------------------------------------------------------------------------
  R = {}
  #---------------------------------------------------------------------------------------------------------
  # Stage: Metaflags
  #.........................................................................................................
  argv    = argv ? process.argv
  d       = me.meta
  s       = { argv, stopAtFirstUnknown: true, }
  ### TAINT use method to do parse_argv w/ error handling, return happy/sad values ###
  try p = parse_argv d, s catch error
    return @_signal R, 'help', 'OTHER', error.message
  argv    = pluck p, '_unknown', []
  help    = pluck p, 'help',  false
  #.........................................................................................................
  if p.hasOwnProperty 'cd'
    unless p.cd?
      return @_signal R, 'help', 'NEEDS_VALUE', "must give target directory when using --dd, -d"
    R.cd = pluck p, 'cd', null
  #.........................................................................................................
  if help
    return @_signal R, 'help', 'OK'
  #.........................................................................................................
  if ( flag = argv[ 0 ] )?.startsWith '-'
    return @_signal R, 'help', 'UNKNOWN_FLAG', "unknown flag #{rpr flag}"
  #---------------------------------------------------------------------------------------------------------
  # Stage: Commands
  #.........................................................................................................
  d       = { name: 'cmd', defaultOption: true, }
  ### TAINT use method to do parse_argv w/ error handling, return happy/sad values ###
  try p = parse_argv d, { argv, stopAtFirstUnknown: true, } catch error
    return @_signal R, 'help', 'OTHER', error.message
  cmd     = pluck p, 'cmd', null
  unless cmd?
    return @_signal R, 'help', 'MISSING_CMD', "missing command"
  argv    = pluck p, '_unknown', []
  # urge '^33344^', me
  # urge '^33344^', cmd
  cmddef  = me.commands[ cmd ] ? null
  unless cmddef?
    return @_signal R, 'help', 'UNKNOWN_CMD', "unknown command #{rpr cmd}"
  if cmddef.flags?
    ### TAINT use method to do parse_argv w/ error handling, return happy/sad values ###
    try p = parse_argv cmddef.flags, { argv, stopAtFirstUnknown: true, } catch error
      return @_signal R, 'help', 'OTHER', error.message
    R.argv              = pluck p, '_unknown', []
    R.parameters        = p
  #.........................................................................................................
  if ( not cmddef.allow_extra ) and R.argv.length > 0
    return @_signal R, 'help', 'EXTRA_FLAGS', "command #{rpr cmd} does not allow extra, got #{rpr R.argv}"
  return @_signal R, cmd, 'OK'




