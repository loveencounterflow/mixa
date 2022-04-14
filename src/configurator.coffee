

'use strict'



############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'CONFIGURATOR'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
types                     = require './types'
{ isa
  validate }              = types.export()
#...........................................................................................................
PATH                      = require 'path'
FS                        = require 'fs'
flatten                   = require 'flat'
OSPATH                    = require 'ospath'
TOML                      = require '@iarna/toml'
FINDUP                    = require 'find-up'
PKGDIR                    = require 'pkg-dir'
urge '^4645609056^', PKGDIR.sync()

#-----------------------------------------------------------------------------------------------------------
@get_cfg_search_path = ( module_name ) ->
  R         = new Set()
  filename  = ".#{module_name}.toml"
  path      = FINDUP.sync filename, { cwd: process.cwd(), };  R.add path if path?
  path      = PATH.join PKGDIR.sync(), filename;              R.add path if FINDUP.sync.exists path
  path      = PATH.join OSPATH.home(), filename;              R.add path if FINDUP.sync.exists path
  return [ R..., ]

#-----------------------------------------------------------------------------------------------------------
@read_cfg = ( module_name ) ->
  debug '^46453656^', CND.get_caller_info 0
  debug '^46453656^', CND.get_caller_info 1
  debug '^46453656^', CND.get_caller_info 2
  process.exit 111
  validate.nonempty_text module_name
  R = { $routes: [], }
  for route, route_idx in @get_cfg_search_path module_name
    try
      partial_cfg = TOML.parse FS.readFileSync route
    catch error
      throw error unless error.code is 'ENOENT'
      warn "^cfg@1^ no such file: #{rpr path}, skipping"
      continue
    R.$routes.push route
    partial_cfg   = flatten partial_cfg, { delimiter: '.', safe: true, }
    R             = { R..., partial_cfg..., }
  return R












