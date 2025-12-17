(function() {
  'use strict';
  var CND, E, alert, as_list_of_flags, badge, cast, debug, defaults, echo, freeze, help, info, isa, lets, misfit, parse_argv, pluck, rpr, thaw, type_of, urge, validate, validate_optional, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'MIXA';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  this.runners = require('./runners');

  this.types = require('./types');

  ({isa, validate, validate_optional, cast, type_of} = this.types.export());

  // CP                        = require 'child_process'
  // defer                     = setImmediate
  parse_argv = require('command-line-args');

  misfit = Symbol('misfit');

  // relpath                   = PATH.relative process.cwd(), __filename
  ({freeze, thaw, lets} = require('letsfreezethat'));

  //...........................................................................................................
  this.configurator = require('./configurator');

  //...........................................................................................................
  /* NOTE not currently used: */
  // @check_package_versions   = require './check-package-versions'
  // @check_package_versions require '../pinned-package-versions.json'

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  pluck = function(d, name, fallback = misfit) {
    var R;
    R = d[name];
    delete d[name];
    if (R == null) {
      if (fallback !== misfit) {
        return fallback;
      }
      throw new Error(`^cli@5477^ no such attribute: ${rpr(name)}`);
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  defaults = freeze({
    meta: {
      help: {
        alias: 'h',
        type: Boolean,
        description: "show help and exit"
      },
      cd: {
        alias: 'd',
        type: String,
        description: "change to directory before running command"
      }
    },
    commands: {
      help: {
        description: "show help and exit",
        flags: {
          topic: {
            type: String,
            defaultOption: true
          }
        }
      },
      'cats!': {
        description: "draw cats!",
        flags: {
          color: {
            alias: 'c',
            type: Boolean,
            description: "whether to use color"
          }
        }
      },
      version: {
        description: "show project version and exit"
      }
    },
    default_command: null
  });

  //-----------------------------------------------------------------------------------------------------------
  E = {
    OK: 0,
    MISSING_CMD: 10,
    UNKNOWN_CMD: 11,
    HAS_NAME: 12,
    NEEDS_VALUE: 13,
    UNKNOWN_FLAG: 14,
    EXTRA_FLAGS: 15,
    OTHER: 16,
    ILLEGAL_SETTINGS: 17,
    UNKNOWN: 18
  };

  //-----------------------------------------------------------------------------------------------------------
  as_list_of_flags = function(flags) {
    var R, k, ref, v;
    R = [];
    if (flags == null) {
      return R;
    }
    ref = thaw(flags);
    for (k in ref) {
      v = ref[k];
      v.name = k;
      //.......................................................................................................
      if (v.multiple != null) {
        switch (v.multiple) {
          case false:
            null;
            break;
          case 'lazy':
            v.lazyMultiple = true;
            delete v.multiple;
            break;
          case 'greedy':
            v.multiple = true;
        }
      }
      //.......................................................................................................
      if (v.fallback != null) {
        v.defaultValue = v.fallback;
        delete v.fallback;
      }
      //.......................................................................................................
      if (v.positional != null) {
        v.defaultOption = v.positional;
        delete v.positional;
      }
      R.push(v);
    }
    return R;
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this._compile_jobdef = function(jobdef) {
    var R, aspect, commands, description, e, meta, name, ref, ref1, ref2, usr;
    /* TAINT simplify this with next version of InterType:
     return new Error report if ( report = @types.xxxxxxx.mixa_jobdef jobdef )?
     or similar, as the case may be */
    // validate.mixa_jobdef jobdef
    if (!isa.mixa_jobdef(jobdef)) {
      aspect = this.types._get_unsatisfied_aspect('mixa_jobdef', jobdef);
      return this._signal({}, 'help', 'ILLEGAL_SETTINGS', `not a valid mixa_jobdef object: violates ${rpr(aspect)}`);
    }
    meta = [];
    commands = {};
    R = {commands};
    usr = {
      meta: (ref = jobdef != null ? jobdef.meta : void 0) != null ? ref : null,
      commands: (ref1 = jobdef != null ? jobdef.commands : void 0) != null ? ref1 : null
    };
    //.........................................................................................................
    R.meta = as_list_of_flags(Object.assign({}, defaults.meta, usr.meta));
    ref2 = Object.assign({}, defaults.commands, usr.commands);
    //.........................................................................................................
    for (name in ref2) {
      description = ref2[name];
      e = lets(description, function(d) {
        d.name = name;
        d.flags = as_list_of_flags(d.flags);
        if (d.allow_extra == null) {
          d.allow_extra = false;
        }
        return null;
      });
      commands[name] = e;
    }
    //.........................................................................................................
    if (jobdef.default_command != null) {
      if (!(jobdef.default_command in commands)) {
        return this._signal({}, 'help', 'ILLEGAL_SETTINGS', `default_command must be known, got ${rpr(jobdef.default_command)}`);
      }
      R.default_command = jobdef.default_command;
    }
    //.........................................................................................................
    return R;
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this._signal = function(R, cmd, tag = 'OK', message = null) {
    var code, ref;
    validate.nonempty_text(cmd);
    validate.nonempty_text(tag);
    if (tag === 'OK') {
      validate.null(message);
    } else {
      validate.nonempty_text(message);
      code = (ref = E[tag]) != null ? ref : '111';
      R.error = {code, tag, message};
      R[this.types.sad] = true;
    }
    // debug '^4443^', R
    R.cmd = cmd;
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._split_on_inhibitor = function(argv) {
    var idx;
    if ((idx = argv.indexOf('--')) < 0) {
      return {
        argv,
        post: []
      };
    }
    return {
      argv: argv.slice(0, idx),
      post: argv.slice(idx + 1)
    };
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.parse = function(jobdef, argv = null) {
    var R, cjobdef;
    argv = argv != null ? argv : process.argv;
    R = {
      jobdef,
      input: argv
    };
    cjobdef = this._compile_jobdef(jobdef);
    if (this.types.is_sad(cjobdef)) {
      R.verdict = cjobdef;
      return R;
    }
    R.verdict = this._parse(cjobdef, argv);
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._parse = function(me, argv) {
    /* TAINT use method to do parse_argv w/ error handling, return happy/sad values */
    var R, cmd, cmddef, d, error, flag, p, plus, post, ref, ref1, ref2, runner;
    //---------------------------------------------------------------------------------------------------------
    // Stage: Metaflags
    //.........................................................................................................
    R = {};
    d = me.meta;
    ({argv, post} = this._split_on_inhibitor(argv));
    try {
      // debug '^33736^', { argv, post, }
      /* TAINT use method to do parse_argv w/ error handling, return happy/sad values */
      p = parse_argv(d, {
        argv,
        stopAtFirstUnknown: true
      });
    } catch (error1) {
      error = error1;
      return this._signal(R, 'help', 'OTHER', error.message);
    }
    argv = pluck(p, '_unknown', []);
    help = pluck(p, 'help', false);
    //.........................................................................................................
    if (p.hasOwnProperty('cd')) {
      if (p.cd == null) {
        return this._signal(R, 'help', 'NEEDS_VALUE', "must give target directory when using --dd, -d");
      }
      R.cd = pluck(p, 'cd', null);
    }
    //.........................................................................................................
    if (help) {
      return this._signal(R, 'help', 'OK');
    }
    //.........................................................................................................
    if ((ref = (flag = argv[0])) != null ? ref.startsWith('-') : void 0) {
      return this._signal(R, 'help', 'UNKNOWN_FLAG', `unknown flag ${rpr(flag)}`);
    }
    //---------------------------------------------------------------------------------------------------------
    // Stage: Commands
    //.........................................................................................................
    d = {
      name: 'cmd',
      defaultOption: true
    };
    try {
      p = parse_argv(d, {
        argv,
        stopAtFirstUnknown: true
      });
    } catch (error1) {
      error = error1;
      return this._signal(R, 'help', 'OTHER', error.message);
    }
    cmd = pluck(p, 'cmd', null);
    if (cmd == null) {
      if (me.default_command == null) {
        return this._signal(R, 'help', 'MISSING_CMD', "missing command");
      }
      cmd = me.default_command;
    }
    argv = pluck(p, '_unknown', []);
    cmddef = (ref1 = me.commands[cmd]) != null ? ref1 : null;
    if (cmddef == null) {
      return this._signal(R, 'help', 'UNKNOWN_CMD', `unknown command ${rpr(cmd)}`);
    }
    if (cmddef.flags != null) {
      try {
        /* TAINT use method to do parse_argv w/ error handling, return happy/sad values */
        p = parse_argv(cmddef.flags, {
          argv,
          stopAtFirstUnknown: true
        });
      } catch (error1) {
        error = error1;
        return this._signal(R, 'help', 'OTHER', error.message);
      }
      R.argv = (pluck(p, '_unknown', [])).concat(post);
      R.parameters = p;
    } else {
      R.argv = post;
    }
    //.........................................................................................................
    // ### Remove all percent-escaped initial hyphens: ###
    // ( R.argv[ idx ] = d.replace /^%-/, '-' ) for d, idx in R.argv
    //.........................................................................................................
    if ((!cmddef.allow_extra) && R.argv.length > 0) {
      R.extra_flags = (parse_argv(cmddef.flags, {
        argv,
        partial: true
      }))._unknown;
      return this._signal(R, 'help', 'EXTRA_FLAGS', `command ${rpr(cmd)} does not allow extra parameters, got ${rpr(R.argv)}`);
    }
    if ((plus = cmddef.plus) != null) {
      R.plus = plus;
    }
    if ((runner = (ref2 = cmddef.runner) != null ? ref2 : me.runner) != null) {
      R.runner = runner;
    }
    return this._signal(R, cmd, 'OK');
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.run = function(jobdef, argv = null) {
    /* TAINT ensure this is an object of type `result` (`{ ?ok: any, ?error: any }`) */
    var R, opath, runner;
    if (this.types.is_sad((R = this.parse(jobdef, argv)).verdict)) {
      return this.runners.help(R);
    }
    if ((runner = R.verdict.runner) == null) {
      return R;
    }
    opath = process.cwd();
    if (R.verdict.cd != null) {
      process.chdir(R.verdict.cd);
    }
    R.output = runner(R);
    process.chdir(opath);
    if (this.types.is_sad(R.output)) {
      return this.runners.help(R);
    }
    return R;
  };

  // return await R.runner R

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLGdCQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsR0FBQSxHQUE0QixHQUFHLENBQUM7O0VBQ2hDLEtBQUEsR0FBNEI7O0VBQzVCLEtBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxPQUFmLEVBQTRCLEtBQTVCOztFQUM1QixLQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1Qjs7RUFDNUIsT0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLFNBQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBVCxDQUFjLEdBQWQsRUFkNUI7OztFQWdCQSxJQUFDLENB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LEdBQUksSUFBQyxDQUFBLEtBQUQsQ0FBTyxNQUFQLEVBQWUsSUFBZixDQUFOLENBQTJCLENBQUMsT0FBMUMsQ0FBSDtBQUNFLGFBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsQ0FBZCxFQURUOztJQUVBLElBQWdCLG1DQUFoQjtBQUFBLGFBQU8sRUFBUDs7SUFFQSxLQUFBLEdBQVksT0FBTyxDQUFDLEdBQVIsQ0FBQTtJQUNaLElBQThCLG9CQUE5QjtNQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUF4QixFQUFBOztJQUNBLENBQUMsQ0FBQyxNQUFGLEdBQVksTUFBQSxDQUFPLENBQVA7SUFDWixPQUFPLENBQUMsS0FBUixDQUFjLEtBQWQ7SUFDQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLENBQUMsQ0FBQyxNQUFoQixDQUFIO0FBQ0UsYUFBTyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxDQUFkLEVBRFQ7O0FBRUEsV0FBTztFQVhGOztFQXBQUDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdNSVhBJ1xuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxuYWxlcnQgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdhbGVydCcsICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxuZWNobyAgICAgICAgICAgICAgICAgICAgICA9IENORC5lY2hvLmJpbmQgQ05EXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbkBydW5uZXJzICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3J1bm5lcnMnXG5AdHlwZXMgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90eXBlcydcbnsgaXNhXG4gIHZhbGlkYXRlXG4gIHZhbGlkYXRlX29wdGlvbmFsXG4gIGNhc3RcbiAgdHlwZV9vZiB9ICAgICAgICAgICAgICAgPSBAdHlwZXMuZXhwb3J0KClcbiMgQ1AgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NoaWxkX3Byb2Nlc3MnXG4jIGRlZmVyICAgICAgICAgICAgICAgICAgICAgPSBzZXRJbW1lZGlhdGVcbnBhcnNlX2FyZ3YgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjb21tYW5kLWxpbmUtYXJncydcbm1pc2ZpdCAgICAgICAgICAgICAgICAgICAgPSBTeW1ib2wgJ21pc2ZpdCdcbiMgcmVscGF0aCAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVsYXRpdmUgcHJvY2Vzcy5jd2QoKSwgX19maWxlbmFtZVxueyBmcmVlemVcbiAgdGhhd1xuICBsZXRzIH0gICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2xldHNmcmVlemV0aGF0J1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AY29uZmlndXJhdG9yICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9jb25maWd1cmF0b3InXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMjIyBOT1RFIG5vdCBjdXJyZW50bHkgdXNlZDogIyMjXG4jIEBjaGVja19wYWNrYWdlX3ZlcnNpb25zICAgPSByZXF1aXJlICcuL2NoZWNrLXBhY2thZ2UtdmVyc2lvbnMnXG4jIEBjaGVja19wYWNrYWdlX3ZlcnNpb25zIHJlcXVpcmUgJy4uL3Bpbm5lZC1wYWNrYWdlLXZlcnNpb25zLmpzb24nXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnBsdWNrID0gKCBkLCBuYW1lLCBmYWxsYmFjayA9IG1pc2ZpdCApIC0+XG4gIFIgPSBkWyBuYW1lIF1cbiAgZGVsZXRlIGRbIG5hbWUgXVxuICB1bmxlc3MgUj9cbiAgICByZXR1cm4gZmFsbGJhY2sgdW5sZXNzIGZhbGxiYWNrIGlzIG1pc2ZpdFxuICAgIHRocm93IG5ldyBFcnJvciBcIl5jbGlANTQ3N14gbm8gc3VjaCBhdHRyaWJ1dGU6ICN7cnByIG5hbWV9XCJcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZWZhdWx0cyA9IGZyZWV6ZSB7XG4gIG1ldGE6XG4gICAgaGVscDogICB7IGFsaWFzOiAnaCcsIHR5cGU6IEJvb2xlYW4sIGRlc2NyaXB0aW9uOiBcInNob3cgaGVscCBhbmQgZXhpdFwiLCB9XG4gICAgY2Q6ICAgICB7IGFsaWFzOiAnZCcsIHR5cGU6IFN0cmluZywgIGRlc2NyaXB0aW9uOiBcImNoYW5nZSB0byBkaXJlY3RvcnkgYmVmb3JlIHJ1bm5pbmcgY29tbWFuZFwiLCB9XG4gIGNvbW1hbmRzOlxuICAgIGhlbHA6XG4gICAgICBkZXNjcmlwdGlvbjogIFwic2hvdyBoZWxwIGFuZCBleGl0XCJcbiAgICAgIGZsYWdzOlxuICAgICAgICB0b3BpYzogIHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0T3B0aW9uOiB0cnVlLCB9XG5cbiAgICAnY2F0cyEnOlxuICAgICAgZGVzY3JpcHRpb246ICBcImRyYXcgY2F0cyFcIlxuICAgICAgZmxhZ3M6XG4gICAgICAgIGNvbG9yOiAgeyBhbGlhczogJ2MnLCB0eXBlOiBCb29sZWFuLCBkZXNjcmlwdGlvbjogXCJ3aGV0aGVyIHRvIHVzZSBjb2xvclwiLCB9XG4gICAgdmVyc2lvbjogIHsgZGVzY3JpcHRpb246IFwic2hvdyBwcm9qZWN0IHZlcnNpb24gYW5kIGV4aXRcIiwgfVxuICBkZWZhdWx0X2NvbW1hbmQ6IG51bGxcbiAgfVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkUgPVxuICBPSzogICAgICAgICAgICAgICAwXG4gIE1JU1NJTkdfQ01EOiAgICAgIDEwXG4gIFVOS05PV05fQ01EOiAgICAgIDExXG4gIEhBU19OQU1FOiAgICAgICAgIDEyXG4gIE5FRURTX1ZBTFVFOiAgICAgIDEzXG4gIFVOS05PV05fRkxBRzogICAgIDE0XG4gIEVYVFJBX0ZMQUdTOiAgICAgIDE1XG4gIE9USEVSOiAgICAgICAgICAgIDE2XG4gIElMTEVHQUxfU0VUVElOR1M6IDE3XG4gIFVOS05PV046ICAgICAgICAgIDE4XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXNfbGlzdF9vZl9mbGFncyA9ICggZmxhZ3MgKSAtPlxuICBSID0gW11cbiAgcmV0dXJuIFIgdW5sZXNzIGZsYWdzP1xuICBmb3IgaywgdiBvZiB0aGF3IGZsYWdzXG4gICAgdi5uYW1lID0ga1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgdi5tdWx0aXBsZT9cbiAgICAgIHN3aXRjaCB2Lm11bHRpcGxlXG4gICAgICAgIHdoZW4gZmFsc2VcbiAgICAgICAgICBudWxsXG4gICAgICAgIHdoZW4gJ2xhenknXG4gICAgICAgICAgdi5sYXp5TXVsdGlwbGUgPSB0cnVlXG4gICAgICAgICAgZGVsZXRlIHYubXVsdGlwbGVcbiAgICAgICAgd2hlbiAnZ3JlZWR5J1xuICAgICAgICAgIHYubXVsdGlwbGUgPSB0cnVlXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiB2LmZhbGxiYWNrP1xuICAgICAgdi5kZWZhdWx0VmFsdWUgPSB2LmZhbGxiYWNrXG4gICAgICBkZWxldGUgdi5mYWxsYmFja1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgdi5wb3NpdGlvbmFsP1xuICAgICAgdi5kZWZhdWx0T3B0aW9uID0gdi5wb3NpdGlvbmFsXG4gICAgICBkZWxldGUgdi5wb3NpdGlvbmFsXG4gICAgUi5wdXNoIHZcbiAgcmV0dXJuIFJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9jb21waWxlX2pvYmRlZiA9ICggam9iZGVmICkgLT5cbiAgIyMjIFRBSU5UIHNpbXBsaWZ5IHRoaXMgd2l0aCBuZXh0IHZlcnNpb24gb2YgSW50ZXJUeXBlOlxuICByZXR1cm4gbmV3IEVycm9yIHJlcG9ydCBpZiAoIHJlcG9ydCA9IEB0eXBlcy54eHh4eHh4Lm1peGFfam9iZGVmIGpvYmRlZiApP1xuICBvciBzaW1pbGFyLCBhcyB0aGUgY2FzZSBtYXkgYmUgIyMjXG4gICMgdmFsaWRhdGUubWl4YV9qb2JkZWYgam9iZGVmXG4gIHVubGVzcyBpc2EubWl4YV9qb2JkZWYgam9iZGVmXG4gICAgYXNwZWN0ID0gQHR5cGVzLl9nZXRfdW5zYXRpc2ZpZWRfYXNwZWN0ICdtaXhhX2pvYmRlZicsIGpvYmRlZlxuICAgIHJldHVybiBAX3NpZ25hbCB7fSwgJ2hlbHAnLCAnSUxMRUdBTF9TRVRUSU5HUycsIFwibm90IGEgdmFsaWQgbWl4YV9qb2JkZWYgb2JqZWN0OiB2aW9sYXRlcyAje3JwciBhc3BlY3R9XCJcbiAgbWV0YSAgICAgID0gW11cbiAgY29tbWFuZHMgID0ge31cbiAgUiAgICAgICAgID0geyBjb21tYW5kcywgfVxuICB1c3IgICAgICAgPSB7IG1ldGE6ICggam9iZGVmPy5tZXRhID8gbnVsbCApLCBjb21tYW5kczogKCBqb2JkZWY/LmNvbW1hbmRzID8gbnVsbCApLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgUi5tZXRhID0gYXNfbGlzdF9vZl9mbGFncyBPYmplY3QuYXNzaWduIHt9LCBkZWZhdWx0cy5tZXRhLCB1c3IubWV0YVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciBuYW1lLCBkZXNjcmlwdGlvbiBvZiBPYmplY3QuYXNzaWduIHt9LCBkZWZhdWx0cy5jb21tYW5kcywgdXNyLmNvbW1hbmRzXG4gICAgZSA9IGxldHMgZGVzY3JpcHRpb24sICggZCApIC0+XG4gICAgICBkLm5hbWUgICAgICAgICAgPSBuYW1lXG4gICAgICBkLmZsYWdzICAgICAgICAgPSBhc19saXN0X29mX2ZsYWdzIGQuZmxhZ3NcbiAgICAgIGQuYWxsb3dfZXh0cmEgID89IGZhbHNlXG4gICAgICByZXR1cm4gbnVsbFxuICAgIGNvbW1hbmRzWyBuYW1lIF0gPSBlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgam9iZGVmLmRlZmF1bHRfY29tbWFuZD9cbiAgICB1bmxlc3Mgam9iZGVmLmRlZmF1bHRfY29tbWFuZCBvZiBjb21tYW5kc1xuICAgICAgcmV0dXJuIEBfc2lnbmFsIHt9LCAnaGVscCcsICdJTExFR0FMX1NFVFRJTkdTJywgXCJkZWZhdWx0X2NvbW1hbmQgbXVzdCBiZSBrbm93biwgZ290ICN7cnByIGpvYmRlZi5kZWZhdWx0X2NvbW1hbmR9XCJcbiAgICBSLmRlZmF1bHRfY29tbWFuZCA9IGpvYmRlZi5kZWZhdWx0X2NvbW1hbmRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NpZ25hbCA9ICggUiwgY21kLCB0YWcgPSAnT0snLCBtZXNzYWdlID0gbnVsbCApIC0+XG4gIHZhbGlkYXRlLm5vbmVtcHR5X3RleHQgICAgICAgICAgY21kXG4gIHZhbGlkYXRlLm5vbmVtcHR5X3RleHQgICAgICAgICAgdGFnXG4gIGlmIHRhZyBpcyAnT0snXG4gICAgdmFsaWRhdGUubnVsbCBtZXNzYWdlXG4gIGVsc2VcbiAgICB2YWxpZGF0ZS5ub25lbXB0eV90ZXh0IG1lc3NhZ2VcbiAgICBjb2RlICAgICAgICAgICAgPSBFWyB0YWcgXSA/ICcxMTEnXG4gICAgUi5lcnJvciAgICAgICAgID0geyBjb2RlLCB0YWcsIG1lc3NhZ2UsIH1cbiAgICBSWyBAdHlwZXMuc2FkIF0gPSB0cnVlXG4gICAgIyBkZWJ1ZyAnXjQ0NDNeJywgUlxuICBSLmNtZCA9IGNtZFxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfc3BsaXRfb25faW5oaWJpdG9yID0gKCBhcmd2ICkgLT5cbiAgcmV0dXJuIHsgYXJndiwgICAgICAgICAgICAgICAgICBwb3N0OiBbXSwgICAgICAgICAgICAgICAgIH0gaWYgKCBpZHggPSBhcmd2LmluZGV4T2YgJy0tJyApIDwgMFxuICByZXR1cm4geyBhcmd2OiBhcmd2WyAuLi4gaWR4IF0sIHBvc3Q6IGFyZ3ZbIGlkeCArIDEgLi4gXSwgfVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcGFyc2UgPSAoIGpvYmRlZiwgYXJndiA9IG51bGwgKSAtPlxuICBhcmd2ICAgID0gYXJndiA/IHByb2Nlc3MuYXJndlxuICBSICAgICAgID0geyBqb2JkZWYsIGlucHV0OiBhcmd2LCB9XG4gIGNqb2JkZWYgPSBAX2NvbXBpbGVfam9iZGVmIGpvYmRlZlxuICBpZiBAdHlwZXMuaXNfc2FkIGNqb2JkZWZcbiAgICBSLnZlcmRpY3QgPSBjam9iZGVmXG4gICAgcmV0dXJuIFJcbiAgUi52ZXJkaWN0ID0gQF9wYXJzZSBjam9iZGVmLCBhcmd2XG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9wYXJzZSA9ICggbWUsIGFyZ3YgKSAtPlxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgU3RhZ2U6IE1ldGFmbGFnc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIgICAgICAgICA9IHt9XG4gIGQgICAgICAgICA9IG1lLm1ldGFcbiAgeyBhcmd2XG4gICAgcG9zdCB9ICA9IEBfc3BsaXRfb25faW5oaWJpdG9yIGFyZ3ZcbiAgIyBkZWJ1ZyAnXjMzNzM2XicsIHsgYXJndiwgcG9zdCwgfVxuICAjIyMgVEFJTlQgdXNlIG1ldGhvZCB0byBkbyBwYXJzZV9hcmd2IHcvIGVycm9yIGhhbmRsaW5nLCByZXR1cm4gaGFwcHkvc2FkIHZhbHVlcyAjIyNcbiAgdHJ5IHAgPSBwYXJzZV9hcmd2IGQsIHsgYXJndiwgc3RvcEF0Rmlyc3RVbmtub3duOiB0cnVlLCB9IGNhdGNoIGVycm9yXG4gICAgcmV0dXJuIEBfc2lnbmFsIFIsICdoZWxwJywgJ09USEVSJywgZXJyb3IubWVzc2FnZVxuICBhcmd2ICAgID0gcGx1Y2sgcCwgJ191bmtub3duJywgW11cbiAgaGVscCAgICA9IHBsdWNrIHAsICdoZWxwJywgIGZhbHNlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgcC5oYXNPd25Qcm9wZXJ0eSAnY2QnXG4gICAgdW5sZXNzIHAuY2Q/XG4gICAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnTkVFRFNfVkFMVUUnLCBcIm11c3QgZ2l2ZSB0YXJnZXQgZGlyZWN0b3J5IHdoZW4gdXNpbmcgLS1kZCwgLWRcIlxuICAgIFIuY2QgPSBwbHVjayBwLCAnY2QnLCBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgaGVscFxuICAgIHJldHVybiBAX3NpZ25hbCBSLCAnaGVscCcsICdPSydcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiAoIGZsYWcgPSBhcmd2WyAwIF0gKT8uc3RhcnRzV2l0aCAnLSdcbiAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnVU5LTk9XTl9GTEFHJywgXCJ1bmtub3duIGZsYWcgI3tycHIgZmxhZ31cIlxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgU3RhZ2U6IENvbW1hbmRzXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZCAgICAgICA9IHsgbmFtZTogJ2NtZCcsIGRlZmF1bHRPcHRpb246IHRydWUsIH1cbiAgIyMjIFRBSU5UIHVzZSBtZXRob2QgdG8gZG8gcGFyc2VfYXJndiB3LyBlcnJvciBoYW5kbGluZywgcmV0dXJuIGhhcHB5L3NhZCB2YWx1ZXMgIyMjXG4gIHRyeSBwID0gcGFyc2VfYXJndiBkLCB7IGFyZ3YsIHN0b3BBdEZpcnN0VW5rbm93bjogdHJ1ZSwgfSBjYXRjaCBlcnJvclxuICAgIHJldHVybiBAX3NpZ25hbCBSLCAnaGVscCcsICdPVEhFUicsIGVycm9yLm1lc3NhZ2VcbiAgY21kICAgICA9IHBsdWNrIHAsICdjbWQnLCBudWxsXG4gIHVubGVzcyBjbWQ/XG4gICAgcmV0dXJuIEBfc2lnbmFsIFIsICdoZWxwJywgJ01JU1NJTkdfQ01EJywgXCJtaXNzaW5nIGNvbW1hbmRcIiB1bmxlc3MgbWUuZGVmYXVsdF9jb21tYW5kP1xuICAgIGNtZCA9IG1lLmRlZmF1bHRfY29tbWFuZFxuICBhcmd2ICAgID0gcGx1Y2sgcCwgJ191bmtub3duJywgW11cbiAgY21kZGVmICA9IG1lLmNvbW1hbmRzWyBjbWQgXSA/IG51bGxcbiAgdW5sZXNzIGNtZGRlZj9cbiAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnVU5LTk9XTl9DTUQnLCBcInVua25vd24gY29tbWFuZCAje3JwciBjbWR9XCJcbiAgaWYgY21kZGVmLmZsYWdzP1xuICAgICMjIyBUQUlOVCB1c2UgbWV0aG9kIHRvIGRvIHBhcnNlX2FyZ3Ygdy8gZXJyb3IgaGFuZGxpbmcsIHJldHVybiBoYXBweS9zYWQgdmFsdWVzICMjI1xuICAgIHRyeSBwID0gcGFyc2VfYXJndiBjbWRkZWYuZmxhZ3MsIHsgYXJndiwgc3RvcEF0Rmlyc3RVbmtub3duOiB0cnVlLCB9IGNhdGNoIGVycm9yXG4gICAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnT1RIRVInLCBlcnJvci5tZXNzYWdlXG4gICAgUi5hcmd2ICAgICAgICAgICAgICA9ICggcGx1Y2sgcCwgJ191bmtub3duJywgW10gKS5jb25jYXQgcG9zdFxuICAgIFIucGFyYW1ldGVycyAgICAgICAgPSBwXG4gIGVsc2VcbiAgICBSLmFyZ3YgICAgICAgICAgICAgID0gcG9zdFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgIyMjIFJlbW92ZSBhbGwgcGVyY2VudC1lc2NhcGVkIGluaXRpYWwgaHlwaGVuczogIyMjXG4gICMgKCBSLmFyZ3ZbIGlkeCBdID0gZC5yZXBsYWNlIC9eJS0vLCAnLScgKSBmb3IgZCwgaWR4IGluIFIuYXJndlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmICggbm90IGNtZGRlZi5hbGxvd19leHRyYSApIGFuZCBSLmFyZ3YubGVuZ3RoID4gMFxuICAgIFIuZXh0cmFfZmxhZ3MgPSAoIHBhcnNlX2FyZ3YgY21kZGVmLmZsYWdzLCB7IGFyZ3YsIHBhcnRpYWw6IHRydWUsIH0gKS5fdW5rbm93blxuICAgIHJldHVybiBAX3NpZ25hbCBSLCAnaGVscCcsICdFWFRSQV9GTEFHUycsIFwiY29tbWFuZCAje3JwciBjbWR9IGRvZXMgbm90IGFsbG93IGV4dHJhIHBhcmFtZXRlcnMsIGdvdCAje3JwciBSLmFyZ3Z9XCJcbiAgUi5wbHVzICAgID0gcGx1cyAgICBpZiAoIHBsdXMgICA9IGNtZGRlZi5wbHVzICAgICAgICAgICAgICAgKT9cbiAgUi5ydW5uZXIgID0gcnVubmVyICBpZiAoIHJ1bm5lciA9IGNtZGRlZi5ydW5uZXIgPyBtZS5ydW5uZXIgKT9cbiAgcmV0dXJuIEBfc2lnbmFsIFIsIGNtZCwgJ09LJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AcnVuID0gKCBqb2JkZWYsIGFyZ3YgPSBudWxsICkgLT5cbiAgaWYgQHR5cGVzLmlzX3NhZCAoIFIgPSBAcGFyc2Ugam9iZGVmLCBhcmd2ICkudmVyZGljdFxuICAgIHJldHVybiBAcnVubmVycy5oZWxwIFJcbiAgcmV0dXJuIFIgdW5sZXNzICggcnVubmVyID0gUi52ZXJkaWN0LnJ1bm5lciApP1xuICAjIyMgVEFJTlQgZW5zdXJlIHRoaXMgaXMgYW4gb2JqZWN0IG9mIHR5cGUgYHJlc3VsdGAgKGB7ID9vazogYW55LCA/ZXJyb3I6IGFueSB9YCkgIyMjXG4gIG9wYXRoICAgICA9IHByb2Nlc3MuY3dkKClcbiAgcHJvY2Vzcy5jaGRpciBSLnZlcmRpY3QuY2QgaWYgUi52ZXJkaWN0LmNkP1xuICBSLm91dHB1dCAgPSBydW5uZXIgUlxuICBwcm9jZXNzLmNoZGlyIG9wYXRoXG4gIGlmIEB0eXBlcy5pc19zYWQgUi5vdXRwdXRcbiAgICByZXR1cm4gQHJ1bm5lcnMuaGVscCBSXG4gIHJldHVybiBSXG4gICMgcmV0dXJuIGF3YWl0IFIucnVubmVyIFJcblxuXG4iXX0=
