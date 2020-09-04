(function() {
  'use strict';
  var CND, CP, alert, badge, debug, echo, help, info, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'MIXA/RUN';

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
  this.run = function(settings) {};

  //-----------------------------------------------------------------------------------------------------------
  this.run.execSync = function(settings) {
    return debug('^233387^', settings);
  };

}).call(this);

//# sourceMappingURL=run.js.map