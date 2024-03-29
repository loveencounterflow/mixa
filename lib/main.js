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

  this.check_package_versions = require('./check-package-versions');

  this.check_package_versions(require('../pinned-package-versions.json'));

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

//# sourceMappingURL=main.js.map