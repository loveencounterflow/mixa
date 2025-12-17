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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsS0FBQSxFQUFBLGdCQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsR0FBQSxHQUE0QixHQUFHLENBQUM7O0VBQ2hDLEtBQUEsR0FBNEI7O0VBQzVCLEtBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxPQUFmLEVBQTRCLEtBQTVCOztFQUM1QixLQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1Qjs7RUFDNUIsT0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLFNBQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBVCxDQUFjLEdBQWQsRUFkNUI7OztFQWdCQSxJQUFDLENB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QUFJLElBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlLElBQWYsQ0FBTixDQUEyQixDQUFDLE9BQTFDLENBQUg7QUFDRSxhQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLENBQWQsRUFEVDs7SUFFQSxJQUFnQixtQ0FBaEI7QUFBQSxhQUFPLEVBQVA7O0lBRUEsS0FBQSxHQUFZLE9BQU8sQ0FBQyxHQUFSLENBQUE7SUFDWixJQUE4QixvQkFBOUI7TUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBeEIsRUFBQTs7SUFDQSxDQUFDLENBQUMsTUFBRixHQUFZLE1BQUEsQ0FBTyxDQUFQO0lBQ1osT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkO0lBQ0EsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFDLENBQUMsTUFBaEIsQ0FBSDtBQUNFLGFBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsQ0FBZCxFQURUOztBQUVBLFdBQU87RUFYRjs7RUFsUFA7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5DTkQgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY25kJ1xucnByICAgICAgICAgICAgICAgICAgICAgICA9IENORC5ycHJcbmJhZGdlICAgICAgICAgICAgICAgICAgICAgPSAnTUlYQSdcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2VcbmFsZXJ0ICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnYWxlcnQnLCAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbmluZm8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaW5mbycsICAgICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5AcnVubmVycyAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9ydW5uZXJzJ1xuQHR5cGVzICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vdHlwZXMnXG57IGlzYVxuICB2YWxpZGF0ZVxuICB2YWxpZGF0ZV9vcHRpb25hbFxuICBjYXN0XG4gIHR5cGVfb2YgfSAgICAgICAgICAgICAgID0gQHR5cGVzLmV4cG9ydCgpXG4jIENQICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuIyBkZWZlciAgICAgICAgICAgICAgICAgICAgID0gc2V0SW1tZWRpYXRlXG5wYXJzZV9hcmd2ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY29tbWFuZC1saW5lLWFyZ3MnXG5taXNmaXQgICAgICAgICAgICAgICAgICAgID0gU3ltYm9sICdtaXNmaXQnXG4jIHJlbHBhdGggICAgICAgICAgICAgICAgICAgPSBQQVRILnJlbGF0aXZlIHByb2Nlc3MuY3dkKCksIF9fZmlsZW5hbWVcbnsgZnJlZXplXG4gIHRoYXdcbiAgbGV0cyB9ICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdsZXRzZnJlZXpldGhhdCdcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuQGNvbmZpZ3VyYXRvciAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vY29uZmlndXJhdG9yJ1xuIyBAY2hlY2tfcGFja2FnZV92ZXJzaW9ucyAgID0gcmVxdWlyZSAnLi9jaGVjay1wYWNrYWdlLXZlcnNpb25zJ1xuIyBAY2hlY2tfcGFja2FnZV92ZXJzaW9ucyByZXF1aXJlICcuLi9waW5uZWQtcGFja2FnZS12ZXJzaW9ucy5qc29uJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5wbHVjayA9ICggZCwgbmFtZSwgZmFsbGJhY2sgPSBtaXNmaXQgKSAtPlxuICBSID0gZFsgbmFtZSBdXG4gIGRlbGV0ZSBkWyBuYW1lIF1cbiAgdW5sZXNzIFI/XG4gICAgcmV0dXJuIGZhbGxiYWNrIHVubGVzcyBmYWxsYmFjayBpcyBtaXNmaXRcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJeY2xpQDU0NzdeIG5vIHN1Y2ggYXR0cmlidXRlOiAje3JwciBuYW1lfVwiXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVmYXVsdHMgPSBmcmVlemUge1xuICBtZXRhOlxuICAgIGhlbHA6ICAgeyBhbGlhczogJ2gnLCB0eXBlOiBCb29sZWFuLCBkZXNjcmlwdGlvbjogXCJzaG93IGhlbHAgYW5kIGV4aXRcIiwgfVxuICAgIGNkOiAgICAgeyBhbGlhczogJ2QnLCB0eXBlOiBTdHJpbmcsICBkZXNjcmlwdGlvbjogXCJjaGFuZ2UgdG8gZGlyZWN0b3J5IGJlZm9yZSBydW5uaW5nIGNvbW1hbmRcIiwgfVxuICBjb21tYW5kczpcbiAgICBoZWxwOlxuICAgICAgZGVzY3JpcHRpb246ICBcInNob3cgaGVscCBhbmQgZXhpdFwiXG4gICAgICBmbGFnczpcbiAgICAgICAgdG9waWM6ICB7IHR5cGU6IFN0cmluZywgZGVmYXVsdE9wdGlvbjogdHJ1ZSwgfVxuXG4gICAgJ2NhdHMhJzpcbiAgICAgIGRlc2NyaXB0aW9uOiAgXCJkcmF3IGNhdHMhXCJcbiAgICAgIGZsYWdzOlxuICAgICAgICBjb2xvcjogIHsgYWxpYXM6ICdjJywgdHlwZTogQm9vbGVhbiwgZGVzY3JpcHRpb246IFwid2hldGhlciB0byB1c2UgY29sb3JcIiwgfVxuICAgIHZlcnNpb246ICB7IGRlc2NyaXB0aW9uOiBcInNob3cgcHJvamVjdCB2ZXJzaW9uIGFuZCBleGl0XCIsIH1cbiAgZGVmYXVsdF9jb21tYW5kOiBudWxsXG4gIH1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5FID1cbiAgT0s6ICAgICAgICAgICAgICAgMFxuICBNSVNTSU5HX0NNRDogICAgICAxMFxuICBVTktOT1dOX0NNRDogICAgICAxMVxuICBIQVNfTkFNRTogICAgICAgICAxMlxuICBORUVEU19WQUxVRTogICAgICAxM1xuICBVTktOT1dOX0ZMQUc6ICAgICAxNFxuICBFWFRSQV9GTEFHUzogICAgICAxNVxuICBPVEhFUjogICAgICAgICAgICAxNlxuICBJTExFR0FMX1NFVFRJTkdTOiAxN1xuICBVTktOT1dOOiAgICAgICAgICAxOFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFzX2xpc3Rfb2ZfZmxhZ3MgPSAoIGZsYWdzICkgLT5cbiAgUiA9IFtdXG4gIHJldHVybiBSIHVubGVzcyBmbGFncz9cbiAgZm9yIGssIHYgb2YgdGhhdyBmbGFnc1xuICAgIHYubmFtZSA9IGtcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIHYubXVsdGlwbGU/XG4gICAgICBzd2l0Y2ggdi5tdWx0aXBsZVxuICAgICAgICB3aGVuIGZhbHNlXG4gICAgICAgICAgbnVsbFxuICAgICAgICB3aGVuICdsYXp5J1xuICAgICAgICAgIHYubGF6eU11bHRpcGxlID0gdHJ1ZVxuICAgICAgICAgIGRlbGV0ZSB2Lm11bHRpcGxlXG4gICAgICAgIHdoZW4gJ2dyZWVkeSdcbiAgICAgICAgICB2Lm11bHRpcGxlID0gdHJ1ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgdi5mYWxsYmFjaz9cbiAgICAgIHYuZGVmYXVsdFZhbHVlID0gdi5mYWxsYmFja1xuICAgICAgZGVsZXRlIHYuZmFsbGJhY2tcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIHYucG9zaXRpb25hbD9cbiAgICAgIHYuZGVmYXVsdE9wdGlvbiA9IHYucG9zaXRpb25hbFxuICAgICAgZGVsZXRlIHYucG9zaXRpb25hbFxuICAgIFIucHVzaCB2XG4gIHJldHVybiBSXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfY29tcGlsZV9qb2JkZWYgPSAoIGpvYmRlZiApIC0+XG4gICMjIyBUQUlOVCBzaW1wbGlmeSB0aGlzIHdpdGggbmV4dCB2ZXJzaW9uIG9mIEludGVyVHlwZTpcbiAgcmV0dXJuIG5ldyBFcnJvciByZXBvcnQgaWYgKCByZXBvcnQgPSBAdHlwZXMueHh4eHh4eC5taXhhX2pvYmRlZiBqb2JkZWYgKT9cbiAgb3Igc2ltaWxhciwgYXMgdGhlIGNhc2UgbWF5IGJlICMjI1xuICAjIHZhbGlkYXRlLm1peGFfam9iZGVmIGpvYmRlZlxuICB1bmxlc3MgaXNhLm1peGFfam9iZGVmIGpvYmRlZlxuICAgIGFzcGVjdCA9IEB0eXBlcy5fZ2V0X3Vuc2F0aXNmaWVkX2FzcGVjdCAnbWl4YV9qb2JkZWYnLCBqb2JkZWZcbiAgICByZXR1cm4gQF9zaWduYWwge30sICdoZWxwJywgJ0lMTEVHQUxfU0VUVElOR1MnLCBcIm5vdCBhIHZhbGlkIG1peGFfam9iZGVmIG9iamVjdDogdmlvbGF0ZXMgI3tycHIgYXNwZWN0fVwiXG4gIG1ldGEgICAgICA9IFtdXG4gIGNvbW1hbmRzICA9IHt9XG4gIFIgICAgICAgICA9IHsgY29tbWFuZHMsIH1cbiAgdXNyICAgICAgID0geyBtZXRhOiAoIGpvYmRlZj8ubWV0YSA/IG51bGwgKSwgY29tbWFuZHM6ICggam9iZGVmPy5jb21tYW5kcyA/IG51bGwgKSwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIFIubWV0YSA9IGFzX2xpc3Rfb2ZfZmxhZ3MgT2JqZWN0LmFzc2lnbiB7fSwgZGVmYXVsdHMubWV0YSwgdXNyLm1ldGFcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgbmFtZSwgZGVzY3JpcHRpb24gb2YgT2JqZWN0LmFzc2lnbiB7fSwgZGVmYXVsdHMuY29tbWFuZHMsIHVzci5jb21tYW5kc1xuICAgIGUgPSBsZXRzIGRlc2NyaXB0aW9uLCAoIGQgKSAtPlxuICAgICAgZC5uYW1lICAgICAgICAgID0gbmFtZVxuICAgICAgZC5mbGFncyAgICAgICAgID0gYXNfbGlzdF9vZl9mbGFncyBkLmZsYWdzXG4gICAgICBkLmFsbG93X2V4dHJhICA/PSBmYWxzZVxuICAgICAgcmV0dXJuIG51bGxcbiAgICBjb21tYW5kc1sgbmFtZSBdID0gZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGpvYmRlZi5kZWZhdWx0X2NvbW1hbmQ/XG4gICAgdW5sZXNzIGpvYmRlZi5kZWZhdWx0X2NvbW1hbmQgb2YgY29tbWFuZHNcbiAgICAgIHJldHVybiBAX3NpZ25hbCB7fSwgJ2hlbHAnLCAnSUxMRUdBTF9TRVRUSU5HUycsIFwiZGVmYXVsdF9jb21tYW5kIG11c3QgYmUga25vd24sIGdvdCAje3JwciBqb2JkZWYuZGVmYXVsdF9jb21tYW5kfVwiXG4gICAgUi5kZWZhdWx0X2NvbW1hbmQgPSBqb2JkZWYuZGVmYXVsdF9jb21tYW5kXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQF9zaWduYWwgPSAoIFIsIGNtZCwgdGFnID0gJ09LJywgbWVzc2FnZSA9IG51bGwgKSAtPlxuICB2YWxpZGF0ZS5ub25lbXB0eV90ZXh0ICAgICAgICAgIGNtZFxuICB2YWxpZGF0ZS5ub25lbXB0eV90ZXh0ICAgICAgICAgIHRhZ1xuICBpZiB0YWcgaXMgJ09LJ1xuICAgIHZhbGlkYXRlLm51bGwgbWVzc2FnZVxuICBlbHNlXG4gICAgdmFsaWRhdGUubm9uZW1wdHlfdGV4dCBtZXNzYWdlXG4gICAgY29kZSAgICAgICAgICAgID0gRVsgdGFnIF0gPyAnMTExJ1xuICAgIFIuZXJyb3IgICAgICAgICA9IHsgY29kZSwgdGFnLCBtZXNzYWdlLCB9XG4gICAgUlsgQHR5cGVzLnNhZCBdID0gdHJ1ZVxuICAgICMgZGVidWcgJ140NDQzXicsIFJcbiAgUi5jbWQgPSBjbWRcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AX3NwbGl0X29uX2luaGliaXRvciA9ICggYXJndiApIC0+XG4gIHJldHVybiB7IGFyZ3YsICAgICAgICAgICAgICAgICAgcG9zdDogW10sICAgICAgICAgICAgICAgICB9IGlmICggaWR4ID0gYXJndi5pbmRleE9mICctLScgKSA8IDBcbiAgcmV0dXJuIHsgYXJndjogYXJndlsgLi4uIGlkeCBdLCBwb3N0OiBhcmd2WyBpZHggKyAxIC4uIF0sIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHBhcnNlID0gKCBqb2JkZWYsIGFyZ3YgPSBudWxsICkgLT5cbiAgYXJndiAgICA9IGFyZ3YgPyBwcm9jZXNzLmFyZ3ZcbiAgUiAgICAgICA9IHsgam9iZGVmLCBpbnB1dDogYXJndiwgfVxuICBjam9iZGVmID0gQF9jb21waWxlX2pvYmRlZiBqb2JkZWZcbiAgaWYgQHR5cGVzLmlzX3NhZCBjam9iZGVmXG4gICAgUi52ZXJkaWN0ID0gY2pvYmRlZlxuICAgIHJldHVybiBSXG4gIFIudmVyZGljdCA9IEBfcGFyc2UgY2pvYmRlZiwgYXJndlxuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBfcGFyc2UgPSAoIG1lLCBhcmd2ICkgLT5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFN0YWdlOiBNZXRhZmxhZ3NcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBSICAgICAgICAgPSB7fVxuICBkICAgICAgICAgPSBtZS5tZXRhXG4gIHsgYXJndlxuICAgIHBvc3QgfSAgPSBAX3NwbGl0X29uX2luaGliaXRvciBhcmd2XG4gICMgZGVidWcgJ14zMzczNl4nLCB7IGFyZ3YsIHBvc3QsIH1cbiAgIyMjIFRBSU5UIHVzZSBtZXRob2QgdG8gZG8gcGFyc2VfYXJndiB3LyBlcnJvciBoYW5kbGluZywgcmV0dXJuIGhhcHB5L3NhZCB2YWx1ZXMgIyMjXG4gIHRyeSBwID0gcGFyc2VfYXJndiBkLCB7IGFyZ3YsIHN0b3BBdEZpcnN0VW5rbm93bjogdHJ1ZSwgfSBjYXRjaCBlcnJvclxuICAgIHJldHVybiBAX3NpZ25hbCBSLCAnaGVscCcsICdPVEhFUicsIGVycm9yLm1lc3NhZ2VcbiAgYXJndiAgICA9IHBsdWNrIHAsICdfdW5rbm93bicsIFtdXG4gIGhlbHAgICAgPSBwbHVjayBwLCAnaGVscCcsICBmYWxzZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIHAuaGFzT3duUHJvcGVydHkgJ2NkJ1xuICAgIHVubGVzcyBwLmNkP1xuICAgICAgcmV0dXJuIEBfc2lnbmFsIFIsICdoZWxwJywgJ05FRURTX1ZBTFVFJywgXCJtdXN0IGdpdmUgdGFyZ2V0IGRpcmVjdG9yeSB3aGVuIHVzaW5nIC0tZGQsIC1kXCJcbiAgICBSLmNkID0gcGx1Y2sgcCwgJ2NkJywgbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGlmIGhlbHBcbiAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnT0snXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaWYgKCBmbGFnID0gYXJndlsgMCBdICk/LnN0YXJ0c1dpdGggJy0nXG4gICAgcmV0dXJuIEBfc2lnbmFsIFIsICdoZWxwJywgJ1VOS05PV05fRkxBRycsIFwidW5rbm93biBmbGFnICN7cnByIGZsYWd9XCJcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFN0YWdlOiBDb21tYW5kc1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGQgICAgICAgPSB7IG5hbWU6ICdjbWQnLCBkZWZhdWx0T3B0aW9uOiB0cnVlLCB9XG4gICMjIyBUQUlOVCB1c2UgbWV0aG9kIHRvIGRvIHBhcnNlX2FyZ3Ygdy8gZXJyb3IgaGFuZGxpbmcsIHJldHVybiBoYXBweS9zYWQgdmFsdWVzICMjI1xuICB0cnkgcCA9IHBhcnNlX2FyZ3YgZCwgeyBhcmd2LCBzdG9wQXRGaXJzdFVua25vd246IHRydWUsIH0gY2F0Y2ggZXJyb3JcbiAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnT1RIRVInLCBlcnJvci5tZXNzYWdlXG4gIGNtZCAgICAgPSBwbHVjayBwLCAnY21kJywgbnVsbFxuICB1bmxlc3MgY21kP1xuICAgIHJldHVybiBAX3NpZ25hbCBSLCAnaGVscCcsICdNSVNTSU5HX0NNRCcsIFwibWlzc2luZyBjb21tYW5kXCIgdW5sZXNzIG1lLmRlZmF1bHRfY29tbWFuZD9cbiAgICBjbWQgPSBtZS5kZWZhdWx0X2NvbW1hbmRcbiAgYXJndiAgICA9IHBsdWNrIHAsICdfdW5rbm93bicsIFtdXG4gIGNtZGRlZiAgPSBtZS5jb21tYW5kc1sgY21kIF0gPyBudWxsXG4gIHVubGVzcyBjbWRkZWY/XG4gICAgcmV0dXJuIEBfc2lnbmFsIFIsICdoZWxwJywgJ1VOS05PV05fQ01EJywgXCJ1bmtub3duIGNvbW1hbmQgI3tycHIgY21kfVwiXG4gIGlmIGNtZGRlZi5mbGFncz9cbiAgICAjIyMgVEFJTlQgdXNlIG1ldGhvZCB0byBkbyBwYXJzZV9hcmd2IHcvIGVycm9yIGhhbmRsaW5nLCByZXR1cm4gaGFwcHkvc2FkIHZhbHVlcyAjIyNcbiAgICB0cnkgcCA9IHBhcnNlX2FyZ3YgY21kZGVmLmZsYWdzLCB7IGFyZ3YsIHN0b3BBdEZpcnN0VW5rbm93bjogdHJ1ZSwgfSBjYXRjaCBlcnJvclxuICAgICAgcmV0dXJuIEBfc2lnbmFsIFIsICdoZWxwJywgJ09USEVSJywgZXJyb3IubWVzc2FnZVxuICAgIFIuYXJndiAgICAgICAgICAgICAgPSAoIHBsdWNrIHAsICdfdW5rbm93bicsIFtdICkuY29uY2F0IHBvc3RcbiAgICBSLnBhcmFtZXRlcnMgICAgICAgID0gcFxuICBlbHNlXG4gICAgUi5hcmd2ICAgICAgICAgICAgICA9IHBvc3RcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjICMjIyBSZW1vdmUgYWxsIHBlcmNlbnQtZXNjYXBlZCBpbml0aWFsIGh5cGhlbnM6ICMjI1xuICAjICggUi5hcmd2WyBpZHggXSA9IGQucmVwbGFjZSAvXiUtLywgJy0nICkgZm9yIGQsIGlkeCBpbiBSLmFyZ3ZcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiAoIG5vdCBjbWRkZWYuYWxsb3dfZXh0cmEgKSBhbmQgUi5hcmd2Lmxlbmd0aCA+IDBcbiAgICBSLmV4dHJhX2ZsYWdzID0gKCBwYXJzZV9hcmd2IGNtZGRlZi5mbGFncywgeyBhcmd2LCBwYXJ0aWFsOiB0cnVlLCB9ICkuX3Vua25vd25cbiAgICByZXR1cm4gQF9zaWduYWwgUiwgJ2hlbHAnLCAnRVhUUkFfRkxBR1MnLCBcImNvbW1hbmQgI3tycHIgY21kfSBkb2VzIG5vdCBhbGxvdyBleHRyYSBwYXJhbWV0ZXJzLCBnb3QgI3tycHIgUi5hcmd2fVwiXG4gIFIucGx1cyAgICA9IHBsdXMgICAgaWYgKCBwbHVzICAgPSBjbWRkZWYucGx1cyAgICAgICAgICAgICAgICk/XG4gIFIucnVubmVyICA9IHJ1bm5lciAgaWYgKCBydW5uZXIgPSBjbWRkZWYucnVubmVyID8gbWUucnVubmVyICk/XG4gIHJldHVybiBAX3NpZ25hbCBSLCBjbWQsICdPSydcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQHJ1biA9ICggam9iZGVmLCBhcmd2ID0gbnVsbCApIC0+XG4gIGlmIEB0eXBlcy5pc19zYWQgKCBSID0gQHBhcnNlIGpvYmRlZiwgYXJndiApLnZlcmRpY3RcbiAgICByZXR1cm4gQHJ1bm5lcnMuaGVscCBSXG4gIHJldHVybiBSIHVubGVzcyAoIHJ1bm5lciA9IFIudmVyZGljdC5ydW5uZXIgKT9cbiAgIyMjIFRBSU5UIGVuc3VyZSB0aGlzIGlzIGFuIG9iamVjdCBvZiB0eXBlIGByZXN1bHRgIChgeyA/b2s6IGFueSwgP2Vycm9yOiBhbnkgfWApICMjI1xuICBvcGF0aCAgICAgPSBwcm9jZXNzLmN3ZCgpXG4gIHByb2Nlc3MuY2hkaXIgUi52ZXJkaWN0LmNkIGlmIFIudmVyZGljdC5jZD9cbiAgUi5vdXRwdXQgID0gcnVubmVyIFJcbiAgcHJvY2Vzcy5jaGRpciBvcGF0aFxuICBpZiBAdHlwZXMuaXNfc2FkIFIub3V0cHV0XG4gICAgcmV0dXJuIEBydW5uZXJzLmhlbHAgUlxuICByZXR1cm4gUlxuICAjIHJldHVybiBhd2FpdCBSLnJ1bm5lciBSXG5cblxuIl19
