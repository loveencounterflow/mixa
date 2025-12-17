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

  // debug 'Ωcfgrator___1', require 'path-exists'; process.exit 111
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZ3VyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxjQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBOzs7RUFLQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixHQUFBLEdBQTRCLEdBQUcsQ0FBQzs7RUFDaEMsS0FBQSxHQUE0Qjs7RUFDNUIsS0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE9BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixPQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsU0FBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQVQsQ0FBYyxHQUFkLEVBZDVCOzs7RUFnQkEsS0FBQSxHQUE0QixPQUFBLENBQVEsU0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEdBQUYsRUFDRSxRQURGLENBQUEsR0FDNEIsS0FBSyxDQUFDLE1BQU4sQ0FBQSxDQUQ1QixF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LFdBQUosR0FBb0IsWUFBWSxDQUFDLElBQWIsQ0FBa0IsR0FBbEI7QUFBc0Isd0NBQzFDLEdBQUcsQ0FBQyxXQUFKLEdBQW9CLEdBYnRCOztJQWVFLEtBQUEsc0VBQUE7O0FBQ0U7UUFDRSxXQUFBLEdBQWMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFFLENBQUMsWUFBSCxDQUFnQixLQUFoQixDQUFYLEVBRGhCO09BRUEsY0FBQTtRQUFNO1FBQ0osSUFBbUIsS0FBSyxDQUFDLElBQU4sS0FBYyxRQUFqQztVQUFBLE1BQU0sTUFBTjs7UUFDQSxJQUFBLENBQUssQ0FBQSxzQkFBQSxDQUFBLENBQXlCLEdBQUEsQ0FBSSxJQUFKLENBQXpCLENBQUEsVUFBQSxDQUFMO0FBQ0EsaUJBSEY7O01BSUEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFoQixDQUFxQixLQUFyQixFQU5KOztNQVFJLENBQUEsR0FBSSxLQUFBLENBQU0sQ0FBTixFQUFTLFdBQVQ7SUFUTjtBQVVBLFdBQU87RUExQkc7QUE5Q1oiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdDT05GSUdVUkFUT1InXG5kZWJ1ZyAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2RlYnVnJywgICAgIGJhZGdlXG53YXJuICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3dhcm4nLCAgICAgIGJhZGdlXG5pbmZvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2luZm8nLCAgICAgIGJhZGdlXG51cmdlICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3VyZ2UnLCAgICAgIGJhZGdlXG5oZWxwICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ2hlbHAnLCAgICAgIGJhZGdlXG53aGlzcGVyICAgICAgICAgICAgICAgICAgID0gQ05ELmdldF9sb2dnZXIgJ3doaXNwZXInLCAgIGJhZGdlXG5lY2hvICAgICAgICAgICAgICAgICAgICAgID0gQ05ELmVjaG8uYmluZCBDTkRcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxudHlwZXMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdHlwZXMnXG57IGlzYVxuICB2YWxpZGF0ZSB9ICAgICAgICAgICAgICA9IHR5cGVzLmV4cG9ydCgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzJ1xuT1NQQVRIICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ29zcGF0aCdcblRPTUwgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdAaWFybmEvdG9tbCdcbiMgZGVidWcgJ86pY2ZncmF0b3JfX18xJywgcmVxdWlyZSAncGF0aC1leGlzdHMnOyBwcm9jZXNzLmV4aXQgMTExXG57IHBhdGhFeGlzdHNTeW5jLCAgICAgICB9ID0gcmVxdWlyZSAncGF0aC1leGlzdHMnXG5GSU5EVVAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZmluZC11cCdcblBLR0RJUiAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdwYWNrYWdlLWRpcmVjdG9yeSdcbm1lcmdlICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsb2Rhc2gubWVyZ2UnXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxudHlwZXMuZGVjbGFyZSAnbWl4YWNmZ19jZmcnLCB0ZXN0czpcbiAgXCJAaXNhLm9iamVjdCB4XCI6ICAgICAgICAgICAgICAgICAgICAgICggeCApIC0+IEBpc2Eub2JqZWN0IHhcbiAgXCJAaXNhLm5vbmVtcHR5X3RleHQgeC5tb2R1bGVfaG9tZVwiOiAgICggeCApIC0+IEBpc2Eubm9uZW1wdHlfdGV4dCB4Lm1vZHVsZV9ob21lXG4gIFwiQGlzYS5ub25lbXB0eV90ZXh0IHgubW9kdWxlX25hbWVcIjogICAoIHggKSAtPiBAaXNhLm5vbmVtcHR5X3RleHQgeC5tb2R1bGVfbmFtZVxuICBcIkBpc2Eubm9uZW1wdHlfdGV4dCB4LnN0YXJ0X3BhdGhcIjogICAgKCB4ICkgLT4gQGlzYS5ub25lbXB0eV90ZXh0IHguc3RhcnRfcGF0aFxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9nZXRfY2ZnX3NlYXJjaF9wYXRocyA9ICggY2ZnICkgLT5cbiAgUiAgICAgICAgICAgPSBuZXcgU2V0KClcbiAgcGF0aCAgICAgICAgPSBGSU5EVVAuZmluZFVwU3luYyBjZmcuY2ZnX25hbWUsIHsgY3dkOiBjZmcuc3RhcnRfcGF0aCwgfTsgUi5hZGQgcGF0aCBpZiBwYXRoP1xuICBwYXRoICAgICAgICA9IFBBVEguam9pbiBPU1BBVEguaG9tZSgpLCBjZmcuY2ZnX25hbWU7ICAgICAgICAgICAgICBSLmFkZCBwYXRoIGlmIHBhdGhFeGlzdHNTeW5jIHBhdGhcbiAgcmV0dXJuIFsgUi4uLiwgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkByZWFkX2NmZyA9ICggY2ZnICkgLT5cbiAgY2ZnID0geyB7fS4uLiwgY2ZnLi4uLCB9XG4gIHVubGVzcyBjZmcuc3RhcnRfcGF0aD9cbiAgICB1bmxlc3MgKCBjZmcuc3RhcnRfcGF0aCA9ICggQ05ELmdldF9jYWxsZXJfaW5mbyAyICk/LnJvdXRlID8gbnVsbCApP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiXm1peGEvY29uZmlndXJhdG9yQDFeIHVuYWJsZSB0byByZXNvbHZlIG1vZHVsZVwiXG4gIGNmZy5tb2R1bGVfaG9tZSAgPz0gUEtHRElSLnBhY2thZ2VEaXJlY3RvcnlTeW5jIGNmZy5zdGFydF9wYXRoXG4gIGNmZy5tb2R1bGVfbmFtZSAgPz0gUEFUSC5iYXNlbmFtZSBjZmcubW9kdWxlX2hvbWVcbiAgY2ZnLmNmZ19uYW1lICAgICA/PSBcIi4je2NmZy5tb2R1bGVfbmFtZX0udG9tbFwiXG4gIHZhbGlkYXRlLm1peGFjZmdfY2ZnIGNmZ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgZGVidWcgJ140NDM1MzheJywgKCByZXF1aXJlICd1dGlsJyApLmluc3BlY3QgY2ZnXG4gIFIgICAgICAgICAgICAgICAgID0geyAkOiBjZmcsIH1cbiAgc2VhcmNoX3BhdGhzICAgICAgPSBAX2dldF9jZmdfc2VhcmNoX3BhdGhzIGNmZ1xuICBjZmcuc2VhcmNoX3BhdGggICA9IHNlYXJjaF9wYXRocy5qb2luICc6JyAjIyMgVEFJTlQgbm90IHZhbGlkIG9uIFdpbmRvd3MgIyMjXG4gIGNmZy5mb3VuZF9wYXRocyAgID0gW11cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3Igcm91dGUsIHJvdXRlX2lkeCBpbiBzZWFyY2hfcGF0aHNcbiAgICB0cnlcbiAgICAgIHBhcnRpYWxfY2ZnID0gVE9NTC5wYXJzZSBGUy5yZWFkRmlsZVN5bmMgcm91dGVcbiAgICBjYXRjaCBlcnJvclxuICAgICAgdGhyb3cgZXJyb3IgdW5sZXNzIGVycm9yLmNvZGUgaXMgJ0VOT0VOVCdcbiAgICAgIHdhcm4gXCJeY2ZnQDFeIG5vIHN1Y2ggZmlsZTogI3tycHIgcGF0aH0sIHNraXBwaW5nXCJcbiAgICAgIGNvbnRpbnVlXG4gICAgY2ZnLmZvdW5kX3BhdGhzLnB1c2ggcm91dGVcbiAgICAjIHBhcnRpYWxfY2ZnICAgPSBmbGF0dGVuIHBhcnRpYWxfY2ZnLCB7IGRlbGltaXRlcjogJy4nLCBzYWZlOiB0cnVlLCB9XG4gICAgUiA9IG1lcmdlIFIsIHBhcnRpYWxfY2ZnXG4gIHJldHVybiBSXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
