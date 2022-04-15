

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
OSPATH                    = require 'ospath'
TOML                      = require '@iarna/toml'
FINDUP                    = require 'find-up'
PKGDIR                    = require 'pkg-dir'
merge                     = require 'lodash.merge'


#-----------------------------------------------------------------------------------------------------------
types.declare 'mixacfg_cfg', tests:
  "@isa.object x":                      ( x ) -> @isa.object x
  "@isa.nonempty_text x.module_home":   ( x ) -> @isa.nonempty_text x.module_home
  "@isa.nonempty_text x.module_name":   ( x ) -> @isa.nonempty_text x.module_name
  "@isa.nonempty_text x.start_path":    ( x ) -> @isa.nonempty_text x.start_path


#-----------------------------------------------------------------------------------------------------------
@_get_cfg_search_paths = ( cfg ) ->
  R           = new Set()
  path        = FINDUP.sync cfg.cfg_name, { cwd: cfg.start_path, }; R.add path if path?
  path        = PATH.join OSPATH.home(), cfg.cfg_name;              R.add path if FINDUP.sync.exists path
  return [ R..., ]

#-----------------------------------------------------------------------------------------------------------
@read_cfg = ( cfg ) ->
  cfg = { {}..., cfg..., }
  unless cfg.start_path?
    unless ( cfg.start_path = ( CND.get_caller_info 2 )?.route ? null )?
      throw new Error "^mixa/configurator@1^ unable to resolve module"
  cfg.module_home  ?= PKGDIR.sync   cfg.start_path
  cfg.module_name  ?= PATH.basename cfg.module_home
  cfg.cfg_name     ?= ".#{cfg.module_name}.toml"
  validate.mixacfg_cfg cfg
  #.........................................................................................................
  # debug '^443538^', ( require 'util' ).inspect cfg
  R                 = { $: cfg, }
  search_paths      = @_get_cfg_search_paths cfg
  cfg.search_path   = search_paths.join ':' ### TAINT not valid on Windows ###
  cfg.found_paths   = []
  #.........................................................................................................
  for route, route_idx in search_paths
    try
      partial_cfg = TOML.parse FS.readFileSync route
    catch error
      throw error unless error.code is 'ENOENT'
      warn "^cfg@1^ no such file: #{rpr path}, skipping"
      continue
    cfg.found_paths.push route
    # partial_cfg   = flatten partial_cfg, { delimiter: '.', safe: true, }
    R = merge R, partial_cfg
  return R












