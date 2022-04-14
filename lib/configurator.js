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

  urge('^4645609056^', PKGDIR.sync());

  //-----------------------------------------------------------------------------------------------------------
  this.get_cfg_search_path = function(module_name) {
    var R, filename, path;
    R = new Set();
    filename = `.${module_name}.toml`;
    path = FINDUP.sync(filename, {
      cwd: process.cwd()
    });
    if (path != null) {
      R.add(path);
    }
    path = PATH.join(PKGDIR.sync(), filename);
    if (FINDUP.sync.exists(path)) {
      R.add(path);
    }
    path = PATH.join(OSPATH.home(), filename);
    if (FINDUP.sync.exists(path)) {
      R.add(path);
    }
    return [...R];
  };

  //-----------------------------------------------------------------------------------------------------------
  this.read_cfg = function(module_name) {
    var R, error, i, len, partial_cfg, ref, route, route_idx;
    debug('^46453656^', CND.get_caller_info(0));
    debug('^46453656^', CND.get_caller_info(1));
    debug('^46453656^', CND.get_caller_info(2));
    process.exit(111);
    validate.nonempty_text(module_name);
    R = {
      $routes: []
    };
    ref = this.get_cfg_search_path(module_name);
    for (route_idx = i = 0, len = ref.length; i < len; route_idx = ++i) {
      route = ref[route_idx];
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