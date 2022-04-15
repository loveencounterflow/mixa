(function() {
  'use strict';
  var CND, FINDUP, FS, OSPATH, PATH, PKGDIR, TOML, badge, debug, echo, help, info, isa, merge, rpr, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'CONFIGURATOR';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  types = require('./types');

  ({isa, validate} = types.export());

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  OSPATH = require('ospath');

  TOML = require('@iarna/toml');

  FINDUP = require('find-up');

  PKGDIR = require('pkg-dir');

  merge = require('lodash.merge');

  //-----------------------------------------------------------------------------------------------------------
  types.declare('mixacfg_cfg', {
    tests: {
      "@isa.object x": function(x) {
        return this.isa.object(x);
      },
      "@isa.nonempty_text x.module_home": function(x) {
        return this.isa.nonempty_text(x.module_home);
      },
      "@isa.nonempty_text x.module_name": function(x) {
        return this.isa.nonempty_text(x.module_name);
      },
      "@isa.nonempty_text x.start_path": function(x) {
        return this.isa.nonempty_text(x.start_path);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this._get_cfg_search_paths = function(cfg) {
    var R, path;
    R = new Set();
    path = FINDUP.sync(cfg.cfg_name, {
      cwd: cfg.start_path
    });
    if (path != null) {
      R.add(path);
    }
    path = PATH.join(OSPATH.home(), cfg.cfg_name);
    if (FINDUP.sync.exists(path)) {
      R.add(path);
    }
    return [...R];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.read_cfg = function(cfg) {
    var R, error, i, len, partial_cfg, ref, ref1, route, route_idx, search_paths;
    cfg = {...{}, ...cfg};
    if (cfg.start_path == null) {
      if ((cfg.start_path = (ref = (ref1 = CND.get_caller_info(2)) != null ? ref1.route : void 0) != null ? ref : null) == null) {
        throw new Error("^mixa/configurator@1^ unable to resolve module");
      }
    }
    if (cfg.module_home == null) {
      cfg.module_home = PKGDIR.sync(cfg.start_path);
    }
    if (cfg.module_name == null) {
      cfg.module_name = PATH.basename(cfg.module_home);
    }
    if (cfg.cfg_name == null) {
      cfg.cfg_name = `.${cfg.module_name}.toml`;
    }
    validate.mixacfg_cfg(cfg);
    //.........................................................................................................
    // debug '^443538^', ( require 'util' ).inspect cfg
    R = {
      $: cfg
    };
    search_paths = this._get_cfg_search_paths(cfg);
    cfg.search_path = search_paths.join(':');
    /* TAINT not valid on Windows */    cfg.found_paths = [];
//.........................................................................................................
    for (route_idx = i = 0, len = search_paths.length; i < len; route_idx = ++i) {
      route = search_paths[route_idx];
      try {
        partial_cfg = TOML.parse(FS.readFileSync(route));
      } catch (error1) {
        error = error1;
        if (error.code !== 'ENOENT') {
          throw error;
        }
        warn(`^cfg@1^ no such file: ${rpr(path)}, skipping`);
        continue;
      }
      cfg.found_paths.push(route);
      // partial_cfg   = flatten partial_cfg, { delimiter: '.', safe: true, }
      R = merge(R, partial_cfg);
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=configurator.js.map