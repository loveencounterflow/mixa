(function() {
  'use strict';
  var CND, FINDUP, FS, OSPATH, PATH, PKGDIR, TOML, badge, debug, echo, flatten, help, info, isa, rpr, types, urge, validate, warn, whisper;

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

  flatten = require('flat');

  OSPATH = require('ospath');

  TOML = require('@iarna/toml');

  FINDUP = require('find-up');

  PKGDIR = require('pkg-dir');

  //-----------------------------------------------------------------------------------------------------------
  this.get_cfg_search_path = function(start_path) {
    var R, filename, module_home, module_name, path;
    module_home = PKGDIR.sync(start_path);
    module_name = PATH.basename(module_home);
    filename = `.${module_name}.toml`;
    R = new Set();
    path = FINDUP.sync(filename, {
      cwd: start_path
    });
    if (path != null) {
      R.add(path);
    }
    path = PATH.join(OSPATH.home(), filename);
    if (FINDUP.sync.exists(path)) {
      R.add(path);
    }
    return [...R];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.read_cfg = function(start_path = null) {
    var R, error, i, len, partial_cfg, ref, ref1, ref2, route, route_idx;
    if (start_path == null) {
      if ((start_path = (ref = (ref1 = CND.get_caller_info(2)) != null ? ref1.route : void 0) != null ? ref : null) == null) {
        throw new Error("^mixa/configurator@1^ unable to resolve module");
      }
    } else {
      validate.nonempty_text(start_path);
    }
    R = {
      $routes: []
    };
    ref2 = this.get_cfg_search_path(start_path);
    for (route_idx = i = 0, len = ref2.length; i < len; route_idx = ++i) {
      route = ref2[route_idx];
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
      R.$routes.push(route);
      partial_cfg = flatten(partial_cfg, {
        delimiter: '.',
        safe: true
      });
      R = {...R, ...partial_cfg};
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=configurator.js.map