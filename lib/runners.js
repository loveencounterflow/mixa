(function() {
  'use strict';
  var CND, CP, alert, badge, cast, debug, echo, help, info, isa, rpr, type_of, types, urge, validate, validate_optional, warn, whisper;

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

  ({isa, validate, validate_optional, cast, type_of} = types.export());

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.help = function(parse) {
    info('^233387^', "======== display help text here ==========");
    return whisper('^233387^', parse);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.execSync = function(parse) {
    /* TAINT escape command string; would be better to use array but not possible? */
    var R, argv, command, error, executable, jobdef, keys, parameters, ref, ref1, ref2, ref3, ref4, ref5, settings, verdict;
    ({jobdef, verdict} = parse);
    executable = (ref = (ref1 = (ref2 = verdict.plus) != null ? ref2.executable : void 0) != null ? ref1 : jobdef.executable) != null ? ref : verdict.cmd;
    validate.nonempty_text(executable);
    argv = (ref3 = verdict.argv) != null ? ref3 : [];
    command = `${executable} ${argv.join(' ')}`;
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
    info('^233387^', {
      executable,
      argv,
      cwd: settings.cwd,
      parameters
    });
    try {
      R = CP.execSync(command, settings);
    } catch (error1) {
      error = error1;
      /* TAINT don't throw error, return sad result */
      throw error;
    }
    return R;
  };

}).call(this);

//# sourceMappingURL=runners.js.map