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
  this.run = require('./run');

  this.types = require('./types');

  ({isa, validate, validate_optional, cast, type_of} = this.types.export());

  // CP                        = require 'child_process'
  // defer                     = setImmediate
  parse_argv = require('command-line-args');

  misfit = Symbol('misfit');

  // relpath                   = PATH.relative process.cwd(), __filename
  ({freeze, thaw, lets} = require('letsfreezethat'));

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
    }
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
    ILLEGAL_SETTINGS: 17
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
  this.compile_settings = function(settings) {
    var R, aspect, commands, description, e, meta, name, ref, ref1, ref2, usr;
    /* TAINT simplify this with next version of InterType:
     return new Error report if ( report = @types.xxxxxxx.mixa_settings settings )?
     or similar, as the case may be */
    // validate.mixa_settings settings
    if (!isa.mixa_settings(settings)) {
      aspect = this.types._get_unsatisfied_aspect('mixa_settings', settings);
      return this._signal({}, 'help', 'ILLEGAL_SETTINGS', `not a valid mixa_settings object: violates ${rpr(aspect)}`);
    }
    meta = [];
    commands = {};
    R = {commands};
    usr = {
      meta: (ref = settings != null ? settings.meta : void 0) != null ? ref : null,
      commands: (ref1 = settings != null ? settings.commands : void 0) != null ? ref1 : null
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
  this.parse = function(settings, argv = null) {
    var R;
    if (this.types.is_sad((R = this.compile_settings(settings)))) {
      return R;
    }
    return this._parse(R, argv);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._parse = function(me, argv = null) {
    /* TAINT use method to do parse_argv w/ error handling, return happy/sad values */
    var R, cmd, cmddef, d, error, flag, p, post, ref, ref1;
    //---------------------------------------------------------------------------------------------------------
    R = {};
    //---------------------------------------------------------------------------------------------------------
    // Stage: Metaflags
    //.........................................................................................................
    argv = argv != null ? argv : process.argv;
    d = me.meta;
    ({argv, post} = this._split_on_inhibitor(argv));
    try {
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
      /* TAINT use method to do parse_argv w/ error handling, return happy/sad values */
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
      return this._signal(R, 'help', 'MISSING_CMD', "missing command");
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
      return this._signal(R, 'help', 'EXTRA_FLAGS', `command ${rpr(cmd)} does not allow extra, got ${rpr(R.argv)}`);
    }
    return this._signal(R, cmd, 'OK');
  };

}).call(this);

//# sourceMappingURL=main.js.map