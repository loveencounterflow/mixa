
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
@runners                  = require './runners'
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
  thaw
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
  OK:               0
  MISSING_CMD:      10
  UNKNOWN_CMD:      11
  HAS_NAME:         12
  NEEDS_VALUE:      13
  UNKNOWN_FLAG:     14
  EXTRA_FLAGS:      15
  OTHER:            16
  ILLEGAL_SETTINGS: 17

#-----------------------------------------------------------------------------------------------------------
as_list_of_flags = ( flags ) ->
  R = []
  return R unless flags?
  for k, v of thaw flags
    v.name = k
    #.......................................................................................................
    if v.multiple?
      switch v.multiple
        when false
          null
        when 'lazy'
          v.lazyMultiple = true
          delete v.multiple
        when 'greedy'
          v.multiple = true
    #.......................................................................................................
    if v.fallback?
      v.defaultValue = v.fallback
      delete v.fallback
    #.......................................................................................................
    if v.positional?
      v.defaultOption = v.positional
      delete v.positional
    R.push v
  return R


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_compile_jobdef = ( jobdef ) ->
  ### TAINT simplify this with next version of InterType:
  return new Error report if ( report = @types.xxxxxxx.mixa_jobdef jobdef )?
  or similar, as the case may be ###
  # validate.mixa_jobdef jobdef
  unless isa.mixa_jobdef jobdef
    aspect = @types._get_unsatisfied_aspect 'mixa_jobdef', jobdef
    return @_signal {}, 'help', 'ILLEGAL_SETTINGS', "not a valid mixa_jobdef object: violates #{rpr aspect}"
  meta      = []
  commands  = {}
  R         = { commands, }
  usr       = { meta: ( jobdef?.meta ? null ), commands: ( jobdef?.commands ? null ), }
  #.........................................................................................................
  R.meta = as_list_of_flags Object.assign {}, defaults.meta, usr.meta
  #.........................................................................................................
  for name, description of Object.assign {}, defaults.commands, usr.commands
    e = lets description, ( d ) ->
      d.name          = name
      d.flags         = as_list_of_flags d.flags
      d.allow_extra  ?= false
      return null
    commands[ name ] = e
  #.........................................................................................................
  return R


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
    # debug '^4443^', R
  R.cmd = cmd
  return R

#-----------------------------------------------------------------------------------------------------------
@_split_on_inhibitor = ( argv ) ->
  return { argv,                  post: [],                 } if ( idx = argv.indexOf '--' ) < 0
  return { argv: argv[ ... idx ], post: argv[ idx + 1 .. ], }


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@parse = ( jobdef, argv = null ) ->
  argv    = argv ? process.argv
  R       = { jobdef, input: argv, }
  cjobdef = @_compile_jobdef jobdef
  if @types.is_sad cjobdef
    R.verdict = cjobdef
    return R
  R.verdict = @_parse cjobdef, argv
  return R

#-----------------------------------------------------------------------------------------------------------
@_parse = ( me, argv ) ->
  #---------------------------------------------------------------------------------------------------------
  # Stage: Metaflags
  #.........................................................................................................
  R         = {}
  d         = me.meta
  { argv
    post }  = @_split_on_inhibitor argv
  # debug '^33736^', { argv, post, }
  ### TAINT use method to do parse_argv w/ error handling, return happy/sad values ###
  try p = parse_argv d, { argv, stopAtFirstUnknown: true, } catch error
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
  cmddef  = me.commands[ cmd ] ? null
  unless cmddef?
    return @_signal R, 'help', 'UNKNOWN_CMD', "unknown command #{rpr cmd}"
  if cmddef.flags?
    ### TAINT use method to do parse_argv w/ error handling, return happy/sad values ###
    try p = parse_argv cmddef.flags, { argv, stopAtFirstUnknown: true, } catch error
      return @_signal R, 'help', 'OTHER', error.message
    R.argv              = ( pluck p, '_unknown', [] ).concat post
    R.parameters        = p
  else
    R.argv              = post
  #.........................................................................................................
  # ### Remove all percent-escaped initial hyphens: ###
  # ( R.argv[ idx ] = d.replace /^%-/, '-' ) for d, idx in R.argv
  #.........................................................................................................
  if ( not cmddef.allow_extra ) and R.argv.length > 0
    return @_signal R, 'help', 'EXTRA_FLAGS', "command #{rpr cmd} does not allow extra, got #{rpr R.argv}"
  R.plus    = plus    if ( plus   = cmddef.plus               )?
  R.runner  = runner  if ( runner = cmddef.runner ? me.runner )?
  return @_signal R, cmd, 'OK'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@run = ( jobdef, argv = null ) ->
  if @types.is_sad ( R = @parse jobdef, argv )
    return @runners.help R
  if ( runner = R.verdict.runner ? ( ( x ) -> x ) )?
    R.result = runner R
  return R
  # return await R.runner R


