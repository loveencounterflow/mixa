(function() {
  'use strict';
  var CND, FINDUP, FS, OSPATH, PATH, PKGDIR, TOML, badge, debug, echo, help, info, isa, merge, pathExistsSync, rpr, types, urge, validate, warn, whisper;

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

  ({pathExistsSync} = require('path-exists'));

  FINDUP = require('find-up');

  PKGDIR = require('package-directory');

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
    path = FINDUP.findUpSync(cfg.cfg_name, {
      cwd: cfg.start_path
    });
    if (path != null) {
      R.add(path);
    }
    path = PATH.join(OSPATH.home(), cfg.cfg_name);
    if (pathExistsSync(path)) {
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
      cfg.module_home = PKGDIR.packageDirectorySync(cfg.start_path);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZ3VyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxjQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBOzs7RUFLQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixHQUFBLEdBQTRCLEdBQUcsQ0FBQzs7RUFDaEMsS0FBQSxHQUE0Qjs7RUFDNUIsS0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE9BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixPQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsU0FBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQVQsQ0FBYyxHQUFkLEVBZDVCOzs7RUFnQkEsS0FBQSxHQUE0QixPQUFBLENBQVEsU0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEdBQUYsRUFDRSxRQURGLENBQUEsR0FDNEIsS0FBSyxDQUFDLE1BQU4sQ0FBQSxDQUQ1QixF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QW9CLFlBQVksQ0FBQyxJQUFiLENBQWtCLEdBQWxCO0FBQXNCLHdDQUMxQyxHQUFHLENBQUMsV0FBSixHQUFvQixHQWJ0Qjs7SUFlRSxLQUFBLHNFQUFBOztBQUNFO1FBQ0UsV0FBQSxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsS0FBaEIsQ0FBWCxFQURoQjtPQUVBLGNBQUE7UUFBTTtRQUNKLElBQW1CLEtBQUssQ0FBQyxJQUFOLEtBQWMsUUFBakM7VUFBQSxNQUFNLE1BQU47O1FBQ0EsSUFBQSxDQUFLLENBQUEsc0JBQUEsQ0FBQSxDQUF5QixHQUFBLENBQUksSUFBSixDQUF6QixDQUFBLFVBQUEsQ0FBTDtBQUNBLGlCQUhGOztNQUlBLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBaEIsQ0FBcUIsS0FBckIsRUFOSjs7TUFRSSxDQUFBLEdBQUksS0FBQSxDQUFNLENBQU4sRUFBUyxXQUFUO0lBVE47QUFVQSxXQUFPO0VBMUJHO0FBN0NaIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnQ09ORklHVVJBVE9SJ1xuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnR5cGVzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3R5cGVzJ1xueyBpc2FcbiAgdmFsaWRhdGUgfSAgICAgICAgICAgICAgPSB0eXBlcy5leHBvcnQoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbk9TUEFUSCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdvc3BhdGgnXG5UT01MICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnQGlhcm5hL3RvbWwnXG57IHBhdGhFeGlzdHNTeW5jLCAgICAgICB9ID0gcmVxdWlyZSAncGF0aC1leGlzdHMnXG5GSU5EVVAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZmluZC11cCdcblBLR0RJUiAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYWNrYWdlLWRpcmVjdG9yeSdcbm1lcmdlICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gubWVyZ2UnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxudHlwZXMuZGVjbGFyZSAnbWl4YWNmZ19jZmcnLCB0ZXN0czpcbiAgXCJAaXNhLm9iamVjdCB4XCI6ICAgICAgICAgICAgICAgICAgICAgICggeCApIC0+IEBpc2Eub2JqZWN0IHhcbiAgXCJAaXNhLm5vbmVtcHR5X3RleHQgeC5tb2R1bGVfaG9tZVwiOiAgICggeCApIC0+IEBpc2Eubm9uZW1wdHlfdGV4dCB4Lm1vZHVsZV9ob21lXG4gIFwiQGlzYS5ub25lbXB0eV90ZXh0IHgubW9kdWxlX25hbWVcIjogICAoIHggKSAtPiBAaXNhLm5vbmVtcHR5X3RleHQgeC5tb2R1bGVfbmFtZVxuICBcIkBpc2Eubm9uZW1wdHlfdGV4dCB4LnN0YXJ0X3BhdGhcIjogICAgKCB4ICkgLT4gQGlzYS5ub25lbXB0eV90ZXh0IHguc3RhcnRfcGF0aFxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9nZXRfY2ZnX3NlYXJjaF9wYXRocyA9ICggY2ZnICkgLT5cbiAgUiAgICAgICAgICAgPSBuZXcgU2V0KClcbiAgcGF0aCAgICAgICAgPSBGSU5EVVAuZmluZFVwU3luYyBjZmcuY2ZnX25hbWUsIHsgY3dkOiBjZmcuc3RhcnRfcGF0aCwgfTsgUi5hZGQgcGF0aCBpZiBwYXRoP1xuICBwYXRoICAgICAgICA9IFBBVEguam9pbiBPU1BBVEguaG9tZSgpLCBjZmcuY2ZnX25hbWU7ICAgICAgICAgICAgICBSLmFkZCBwYXRoIGlmIHBhdGhFeGlzdHNTeW5jIHBhdGhcbiAgcmV0dXJuIFsgUi4uLiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX2NmZyA9ICggY2ZnICkgLT5cbiAgY2ZnID0geyB7fS4uLiwgY2ZnLi4uLCB9XG4gIHVubGVzcyBjZmcuc3RhcnRfcGF0aD9cbiAgICB1bmxlc3MgKCBjZmcuc3RhcnRfcGF0aCA9ICggQ05ELmdldF9jYWxsZXJfaW5mbyAyICk/LnJvdXRlID8gbnVsbCApP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiXm1peGEvY29uZmlndXJhdG9yQDFeIHVuYWJsZSB0byByZXNvbHZlIG1vZHVsZVwiXG4gIGNmZy5tb2R1bGVfaG9tZSAgPz0gUEtHRElSLnBhY2thZ2VEaXJlY3RvcnlTeW5jIGNmZy5zdGFydF9wYXRoXG4gIGNmZy5tb2R1bGVfbmFtZSAgPz0gUEFUSC5iYXNlbmFtZSBjZmcubW9kdWxlX2hvbWVcbiAgY2ZnLmNmZ19uYW1lICAgICA/PSBcIi4je2NmZy5tb2R1bGVfbmFtZX0udG9tbFwiXG4gIHZhbGlkYXRlLm1peGFjZmdfY2ZnIGNmZ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgZGVidWcgJ140NDM1MzheJywgKCByZXF1aXJlICd1dGlsJyApLmluc3BlY3QgY2ZnXG4gIFIgICAgICAgICAgICAgICAgID0geyAkOiBjZmcsIH1cbiAgc2VhcmNoX3BhdGhzICAgICAgPSBAX2dldF9jZmdfc2VhcmNoX3BhdGhzIGNmZ1xuICBjZmcuc2VhcmNoX3BhdGggICA9IHNlYXJjaF9wYXRocy5qb2luICc6JyAjIyMgVEFJTlQgbm90IHZhbGlkIG9uIFdpbmRvd3MgIyMjXG4gIGNmZy5mb3VuZF9wYXRocyAgID0gW11cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3Igcm91dGUsIHJvdXRlX2lkeCBpbiBzZWFyY2hfcGF0aHNcbiAgICB0cnlcbiAgICAgIHBhcnRpYWxfY2ZnID0gVE9NTC5wYXJzZSBGUy5yZWFkRmlsZVN5bmMgcm91dGVcbiAgICBjYXRjaCBlcnJvclxuICAgICAgdGhyb3cgZXJyb3IgdW5sZXNzIGVycm9yLmNvZGUgaXMgJ0VOT0VOVCdcbiAgICAgIHdhcm4gXCJeY2ZnQDFeIG5vIHN1Y2ggZmlsZTogI3tycHIgcGF0aH0sIHNraXBwaW5nXCJcbiAgICAgIGNvbnRpbnVlXG4gICAgY2ZnLmZvdW5kX3BhdGhzLnB1c2ggcm91dGVcbiAgICAjIHBhcnRpYWxfY2ZnICAgPSBmbGF0dGVuIHBhcnRpYWxfY2ZnLCB7IGRlbGltaXRlcjogJy4nLCBzYWZlOiB0cnVlLCB9XG4gICAgUiA9IG1lcmdlIFIsIHBhcnRpYWxfY2ZnXG4gIHJldHVybiBSXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
