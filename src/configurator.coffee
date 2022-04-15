

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

#-----------------------------------------------------------------------------------------------------------
@get_cfg_search_path = ( start_path ) ->
  module_home = PKGDIR.sync start_path
  module_name = PATH.basename module_home
  filename    = ".#{module_name}.toml"
  R           = new Set()
  path        = FINDUP.sync filename, { cwd: start_path, };     R.add path if path?
  path        = PATH.join OSPATH.home(), filename;              R.add path if FINDUP.sync.exists path
  return [ R..., ]

#-----------------------------------------------------------------------------------------------------------
@read_cfg = ( start_path = null ) ->
  unless start_path?
    unless ( start_path = ( CND.get_caller_info 2 )?.route ? null )?
      throw new Error "^mixa/configurator@1^ unable to resolve module"
  else
    validate.nonempty_text start_path
  R = { $routes: [], }
  for route, route_idx in @get_cfg_search_path start_path
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












