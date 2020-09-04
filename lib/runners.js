(function() {
  'use strict';
  var CND, CP, alert, badge, debug, echo, help, info, rpr, urge, warn, whisper;

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

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.help = function(parse) {
    info('^233387^', "======== display help text here ==========");
    return whisper('^233387^', parse);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.execSync = function(parse) {
    info('^233387^', "======== execSync ==========");
    return whisper('^233387^', parse);
  };

}).call(this);

//# sourceMappingURL=runners.js.map