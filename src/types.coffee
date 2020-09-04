
'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'MIXA/TYPES'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
jr                        = JSON.stringify
Intertype                 = ( require 'intertype' ).Intertype
intertype                 = new Intertype module.exports
L                         = @

#-----------------------------------------------------------------------------------------------------------
has_only_keys = ( x, keys ) ->
  for k of x
    continue if k in keys
    # urge '^227266^', "has key #{rpr k}: #{rpr x}"
    return false
  return true

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_jobdef', tests:
  "x is an object":                         ( x ) -> @isa.object x
  "x.?meta is a mixa_flagdefs":             ( x ) -> @isa_optional.mixa_flagdefs  x.meta
  "x.?commands is a mixa_cmddefs":          ( x ) -> @isa_optional.mixa_cmddefs   x.commands
  "x has only keys 'meta', 'commands'":     ( x ) -> has_only_keys x, [ 'meta', 'commands', ]

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_flagdefs', tests:
  "x is an object of mixa_flagdef":         ( x ) -> @isa_object_of 'mixa_flagdef', x

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_cmddefs', tests:
  "x is an object of mixa_cmddef":          ( x ) -> @isa_object_of 'mixa_cmddef', x

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_flagdef', tests:
  "x is an object":                         ( x ) -> @isa.object x
  #.........................................................................................................
  # # These options are filled out by `mixa` or used by `command-line-args` in incompatible ways:
  # "x.name is not set":                      ( x ) -> not x.name?
  # "x.group is not set":                     ( x ) -> not x.group?
  # "x.defaultOption is not set":             ( x ) -> not x.defaultOption?
  # "x.?lazyMultiple is not set":             ( x ) -> not x.lazyMultiple?
  #.........................................................................................................
  "x.?type is a function":                  ( x ) -> @isa_optional.function       x.type
  "x.?alias is a text":                     ( x ) -> @isa_optional.text           x.alias
  "x.?description is a text":               ( x ) -> @isa_optional.text           x.description
  "x.?multiple is a _mixa_multiple":        ( x ) -> @isa_optional._mixa_multiple x.multiple
  "x.?positional is a boolean":             ( x ) -> @isa_optional.boolean        x.positional
  "x.?fallback is anything":                ( x ) -> true
  "x has only keys 'type', 'alias', 'description', 'multiple', 'fallback', 'positional'":     \
    ( x ) -> has_only_keys x, [ 'type', 'alias', 'description', 'multiple', 'fallback', 'positional', ]

#-----------------------------------------------------------------------------------------------------------
@declare '_mixa_multiple', tests:
  "x? is either false or 'lazy' or 'greedy'": ( x ) -> x in [ null, false, 'greedy', 'lazy', ]

#-----------------------------------------------------------------------------------------------------------
@declare '_mixa_runnable', tests:
  "x is a sync or async function": ( x ) -> ( @isa.function x ) or ( @isa.asyncfunction x )

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_cmddef', tests:
  "x is an object":                         ( x ) -> @isa.object x
  # "x.name is not set":                      ( x ) -> not x.name?
  "x.?description is a text":               ( x ) -> @isa_optional.text           x.description
  "x.?allow_extra is a boolean":            ( x ) -> @isa_optional.boolean        x.allow_extra
  "x.?flags is a mixa_flagdefs":            ( x ) -> @isa_optional.mixa_flagdefs  x.flags
  "x.?runner is a _mixa_runnable":          ( x ) -> @isa_optional._mixa_runnable x.runner
  "x.?plus is anything":                    ( x ) -> true
  "x has only keys 'description', 'allow_extra', 'flags', 'runner', 'plus'":     \
    ( x ) ->
      debug '^33387^', ( k for k of x )
      has_only_keys x, [ 'description', 'allow_extra', 'flags', 'runner', 'plus', ]









