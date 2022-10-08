(function() {
  'use strict';
  var CND, CP, alert, badge, debug, echo, help, info, isa, rpr, sad, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'MIXA/RUNNERS';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  CP = require('child_process');

  types = require('./types');

  ({isa, validate, sad} = types.export());

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.help = function(parse) {
    /* TAINT use `_signal()` to derive defaults */
    var code, error, exit_on_error, message, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, show_help, stage, tag;
    if (types.isa.function(show_help = (ref = parse.jobdef) != null ? (ref1 = ref.commands) != null ? (ref2 = ref1.help) != null ? ref2.runner : void 0 : void 0 : void 0)) {
      echo();
      echo();
      show_help();
      echo();
    } else {
      info('^233387^', "no help command configured");
    }
    exit_on_error = (ref3 = parse.jobdef.exit_on_error) != null ? ref3 : true;
    // whisper '^233387^', parse
    if ((ref4 = (error = parse.verdict.error)) != null ? ref4 : null) {
      stage = 'input';
    } else if ((ref5 = (error = parse.output.error)) != null ? ref5 : null) {
      stage = 'output';
    }
    if (error != null) {
      code = (ref6 = error.code) != null ? ref6 : 18;
      tag = (ref7 = error.tag) != null ? ref7 : 'UNKNOWN';
      message = (ref8 = error.message) != null ? ref8 : "an unspecified error occurred";
      warn('^mixa/runners/help@4457^', `tag: ${tag}, code: ${code}, stage: ${rpr(stage)}`);
      warn('^mixa/runners/help@4457^', CND.reverse(` ${message} `));
      if (exit_on_error) {
        process.exit(code);
      }
    }
    return parse;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.execSync = function(parse) {
    /* TAINT make escaping of arguments configurable? */
    var args, argv, command, error, executable, jobdef, keys, ok, parameters, ref, ref1, ref2, ref3, ref4, ref5, settings, verdict;
    ({jobdef, verdict} = parse);
    executable = (ref = (ref1 = (ref2 = verdict.plus) != null ? ref2.executable : void 0) != null ? ref1 : jobdef.executable) != null ? ref : verdict.cmd;
    validate.nonempty_text(executable);
    argv = (ref3 = verdict.argv) != null ? ref3 : [];
    args = CND.shellescape(argv);
    // args        = argv.join ' '
    command = `${executable} ${args}`;
    settings = {
      cwd: (ref4 = verdict.cd) != null ? ref4 : process.cwd(),
      encoding: 'utf-8'
    };
    parameters = (ref5 = verdict.parameters) != null ? ref5 : null;
    if ((parameters != null) && (keys = Object.keys(parameters)).length > 0) {
      /* TAINT apply parameters to CP settings? */
      /* TAINT don't throw error, return sad result */
      throw new Error(`^33667^ don't know parameters ${rpr(parameters)}`);
    }
    info('^233387^', "======== execSync ==========");
    whisper('^233387^', parse);
    /* TAINT make this info part of result */
    info('^233387^', {
      executable,
      argv,
      cwd: settings.cwd,
      parameters,
      command
    });
    try {
      ok = CP.execSync(command, settings);
    } catch (error1) {
      error = error1;
      return {
        /* TAINT don't throw error, return sad result */
        error: {
          code: 16,
          tag: 'UNKNOWN',
          message: error.message
        },
        command,
        [sad]: true
      };
    }
    return {ok, command};
  };

}).call(this);

//# sourceMappingURL=runners.js.map