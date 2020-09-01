(function() {
  'use strict';
  var CND, E, alert, as_list_of_flags, badge, cast, debug, defaults, echo, freeze, help, info, isa, lets, misfit, parse_argv, pluck, rpr, type_of, urge, validate, validate_optional, warn, whisper;

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
  this.types = require('./types');

  ({isa, validate, validate_optional, cast, type_of} = this.types.export());

  // CP                        = require 'child_process'
  // defer                     = setImmediate
  parse_argv = require('command-line-args');

  misfit = Symbol('misfit');

  // relpath                   = PATH.relative process.cwd(), __filename
  ({freeze, lets} = require('letsfreezethat'));

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
  as_list_of_flags = function(flags) {
    var R, k, v;
    R = [];
    if (flags == null) {
      return R;
    }
    for (k in flags) {
      v = flags[k];
      v.name = k;
      R.push(v);
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
    EXTRA_FLAGS: 15
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.compile_settings = function(settings) {
    var R, commands, description, e, meta, name, ref, ref1, ref2, ref3, usr;
    meta = [];
    commands = {};
    R = {meta, commands};
    usr = {
      meta: (ref = settings != null ? settings.meta : void 0) != null ? ref : null,
      commands: (ref1 = settings != null ? settings.commands : void 0) != null ? ref1 : null
    };
    ref2 = Object.assign({}, defaults.meta, usr.meta);
    //.........................................................................................................
    for (name in ref2) {
      description = ref2[name];
      if (description.name != null) {
        /* TAINT do not throw error, return sad value */
        throw Error(`^cli@5587^ must not have attribute 'name', got ${rpr(description)}`);
      }
      meta.push(lets(description, function(d) {
        return d.name = name;
      }));
    }
    ref3 = Object.assign({}, defaults.commands, usr.commands);
    //.........................................................................................................
    for (name in ref3) {
      description = ref3[name];
      if (description.name != null) {
        /* TAINT do not throw error, return sad value */
        throw Error(`^cli@5588^ must not have attribute 'name', got ${rpr(description)}`);
      }
      e = lets(description, function(d) {
        d.name = name;
        d.flags = as_list_of_flags(d.flags);
        return d.allow_extra != null ? d.allow_extra : d.allow_extra = false;
      });
      commands[name] = e;
    }
    //.........................................................................................................
    return freeze(R);
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
    R.cmd = cmd;
    return R;
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.parse = function(settings, argv = null) {
    validate.mixa_settings(settings);
    return freeze(this._parse(this.compile_settings(settings), argv));
  };

  //-----------------------------------------------------------------------------------------------------------
  this._parse = function(me, argv = null) {
    var R, cmd, cmddef, d, flag, p, ref, ref1, s;
    //---------------------------------------------------------------------------------------------------------
    R = {};
    //---------------------------------------------------------------------------------------------------------
    // Stage: Metaflags
    //.........................................................................................................
    argv = argv != null ? argv : process.argv;
    d = me.meta;
    s = {
      argv,
      stopAtFirstUnknown: true
    };
    p = parse_argv(d, s);
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
    p = parse_argv(d, {
      argv,
      stopAtFirstUnknown: true
    });
    cmd = pluck(p, 'cmd', null);
    if (cmd == null) {
      return this._signal(R, 'help', 'MISSING_CMD', "missing command");
    }
    argv = pluck(p, '_unknown', []);
    // urge '^33344^', me
    // urge '^33344^', cmd
    cmddef = (ref1 = me.commands[cmd]) != null ? ref1 : null;
    if (cmddef == null) {
      return this._signal(R, 'help', 'UNKNOWN_CMD', `unknown command ${rpr(cmd)}`);
    }
    if (cmddef.flags != null) {
      p = parse_argv(cmddef.flags, {
        argv,
        stopAtFirstUnknown: true
      });
      R.argv = pluck(p, '_unknown', []);
      R.parameters = p;
    }
    //.........................................................................................................
    if ((!cmddef.allow_extra) && R.argv.length > 0) {
      return this._signal(R, 'help', 'EXTRA_FLAGS', `command ${rpr(cmd)} does not allow extra, got ${rpr(R.argv)}`);
    }
    return this._signal(R, cmd, 'OK');
  };

}).call(this);

//# sourceMappingURL=main.js.map