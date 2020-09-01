(function() {
  'use strict';
  var CND, alert, badge, cast, debug, defaults, echo, freeze, help, info, isa, lets, misfit, parse_argv, pluck, rpr, type_of, urge, validate, validate_optional, warn, whisper;

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

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this._compile_settings = function(settings) {
    var R, description, e, externals, internals, is_external, meta, name, ref, ref1, ref2, ref3, usr;
    meta = [];
    internals = [];
    externals = [];
    R = {meta, internals, externals};
    usr = {
      meta: (ref = settings != null ? settings.meta : void 0) != null ? ref : null,
      commands: (ref1 = settings != null ? settings.commands : void 0) != null ? ref1 : null
    };
    ref2 = Object.assign({}, defaults.meta, usr.meta);
    //.........................................................................................................
    for (name in ref2) {
      description = ref2[name];
      if (description.name != null) {
        throw Error(`^cli@5587^ must not have attribute name, got ${rpr(description)}`);
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
        throw Error(`^cli@5588^ must not have attribute name, got ${rpr(description)}`);
      }
      is_external = false;
      e = lets(description, function(d) {
        d.name = name;
        return is_external = pluck(d, 'external', false);
      });
      if (is_external) {
        externals.push(e);
      } else {
        internals.push(e);
      }
    }
    //.........................................................................................................
    return freeze(R);
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
        description: "show help and exit"
      },
      'cats!': {
        description: "draw a cat",
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

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this._signal = function(R, run, exit_code = null, message = null) {
    validate.nonempty_text(run);
    validate_optional.integer(exit_code);
    validate_optional.nonempty_text(message);
    R.run = run;
    R.exit_code = exit_code;
    R.message = message;
    return R;
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.parse = function(settings, argv = null) {
    validate.mixa_settings(settings);
    return freeze(this._parse(this._compile_settings(settings), argv));
  };

  //-----------------------------------------------------------------------------------------------------------
  this._parse = function(me, argv = null) {
    var R, d, flag, p, q, ref, ref1, s;
    //---------------------------------------------------------------------------------------------------------
    q = {
      help: false, // place under `meta`
      testing: argv != null, // place under `meta`
      stage: null
    };
    R = {
      exit_code: null,
      message: null,
      cd: null,
      cmd: null,
      parameters: {}
    };
    //---------------------------------------------------------------------------------------------------------
    // Stage: Metaflags
    //.........................................................................................................
    q.stage = 'meta';
    argv = argv != null ? argv : process.argv;
    d = me.meta;
    s = {
      argv,
      stopAtFirstUnknown: true
    };
    p = parse_argv(d, s);
    argv = pluck(p, '_unknown', []);
    q.help = pluck(p, 'help', false);
    if (p.hasOwnProperty('cd')) {
      if (p.cd == null) {
        return this._signal(R, 'help_and_exit', 12, "^mixa@12^ must give target directory when using --dd, -d");
      }
      R.cd = pluck(p, 'cd', null);
    }
    if (q.help) {
      return this._signal(R, 'help_and_exit', 0);
    }
    if ((ref = (flag = argv[0])) != null ? ref.startsWith('-') : void 0) {
      return this._signal(R, 'help_and_exit', 10, `^mixa@10^ extraneous flag ${rpr(flag)}`);
    }
    //---------------------------------------------------------------------------------------------------------
    // Stage: Internal Commands
    // Internal commands must parse their specific flags and other arguments.
    //.........................................................................................................
    q.stage = 'internal';
    d = {
      name: 'cmd',
      defaultOption: true
    };
    p = parse_argv(d, {
      argv,
      stopAtFirstUnknown: true
    });
    q.cmd = pluck(p, 'cmd', null);
    argv = pluck(p, '_unknown', []);
    if (q.cmd == null) {
      return this._signal(R, 'help_and_exit', 11, "^mixa@11^ missing command");
    }
    //.........................................................................................................
    switch (q.cmd) {
      case 'help':
        d = me.internals.help;
        p = parse_argv(d, {
          argv,
          stopAtFirstUnknown: true
        });
        R.parameters.topic = pluck(p, 'topic', null);
        argv = pluck(p, '_unknown', []);
        return show_help_for_topic_and_exit(q, argv);
      case 'cat':
        return show_cat_and_exit();
    }
    //---------------------------------------------------------------------------------------------------------
    // Stage: External Commands
    //.........................................................................................................
    // External commands call a child process that is passed the remaing command line arguments, so those
    // can be dealt with summarily.
    //.........................................................................................................
    q.stage = 'external';
    p = parse_argv([], {
      argv,
      stopAtFirstUnknown: true
    });
    argv = pluck(p, '_unknown', []);
    R.parameters.argv = argv.slice(0);
    /* TAINT derive list from settings */
    if ((ref1 = q.cmd) === 'psql' || ref1 === 'node' || ref1 === 'nodexh') {
      return q;
    }
    return this._signal(R, 'help_and_exit', 13, `^mixa@13^ Unknown command ${CND.reverse(rpr(q.cmd))}`);
  };

}).call(this);

//# sourceMappingURL=main.js.map