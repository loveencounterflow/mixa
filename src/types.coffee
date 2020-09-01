
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
@declare 'mixa_settings', tests:
  "x? is a _mixa_settings":                 ( x ) -> @isa_optional._mixa_settings x

#-----------------------------------------------------------------------------------------------------------
@declare '_mixa_settings', tests:
  "x.?meta is a mixa_flagdefs":             ( x ) -> ( not x.meta     )? or @isa.mixa_flagdefs x.meta
  "x.?commands is a mixa_cmddefs":          ( x ) -> ( not x.commands )? or @isa.mixa_cmddefs x.commands

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_flagdefs', tests:
  "x is an object":                         ( x ) -> @isa.object x
  "each attribute of x is a mixa_flagdef":  ( x ) ->
    for k, v of x
      return false unless @isa.mixa_flagdef v
    return true

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_cmddefs', tests:
  "x is an object":                         ( x ) -> @isa.object x
  "each attribute of x is a mixa_cmddef":   ( x ) ->
    for k, v of x
      return false unless @isa.mixa_cmddef v
    return true

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_flagdef', tests:
  "x is an object":                         ( x ) -> @isa.object x
  #.........................................................................................................
  # These options are filled out by `mixa` or used by `command-line-args` in incompatible ways:
  "x.name is not set":                      ( x ) -> not x.name?
  "x.group is not set":                     ( x ) -> not x.group?
  "x.defaultOption is not set":             ( x ) -> not x.defaultOption?
  #.........................................................................................................
  "x.?type is a function":                  ( x ) -> @isa_optional.function x.type
  "x.?alias is a text":                     ( x ) -> @isa_optional.text     x.alias
  "x.?description is a text":               ( x ) -> @isa_optional.text     x.description
  "x.?multiple is a boolean":               ( x ) -> @isa_optional.boolean  x.multiple
  "x.?lazyMultiple is a boolean":           ( x ) -> @isa_optional.boolean  x.lazyMultiple
  "x.?defaultValue is anything":            ( x ) -> true

#-----------------------------------------------------------------------------------------------------------
@declare 'mixa_cmddef', tests:
  "x is an object":                         ( x ) -> @isa.object x
  "x.name is not set":                      ( x ) -> not x.name?
  "x.?description is a text":               ( x ) -> @isa_optional.text     x.description
  "x.?allow_extra is a boolean":            ( x ) -> @isa_optional.boolean  x.allow_extra


