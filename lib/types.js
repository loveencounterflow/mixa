(function() {
  'use strict';
  var CND, Intertype, L, alert, badge, debug, help, info, intertype, jr, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'MIXA/TYPES';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  jr = JSON.stringify;

  Intertype = (require('intertype')).Intertype;

  intertype = new Intertype(module.exports);

  L = this;

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_settings', {
    tests: {
      "x? is a _mixa_settings": function(x) {
        return this.isa_optional._mixa_settings(x);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('_mixa_settings', {
    tests: {
      "x.?meta is a mixa_flagdefs": function(x) {
        return ((!x.meta) != null) || this.isa.mixa_flagdefs(x.meta);
      },
      "x.?commands is a mixa_cmddefs": function(x) {
        return ((!x.commands) != null) || this.isa.mixa_cmddefs(x.commands);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_flagdefs', {
    tests: {
      "x is an object": function(x) {
        return this.isa.object(x);
      },
      "each attribute of x is a mixa_flagdef": function(x) {
        var k, v;
        for (k in x) {
          v = x[k];
          if (!this.isa.mixa_flagdef(v)) {
            return false;
          }
        }
        return true;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_cmddefs', {
    tests: {
      "x is an object": function(x) {
        return this.isa.object(x);
      },
      "each attribute of x is a mixa_cmddef": function(x) {
        var k, v;
        for (k in x) {
          v = x[k];
          if (!this.isa.mixa_cmddef(v)) {
            return false;
          }
        }
        return true;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_flagdef', {
    tests: {
      "x is an object": function(x) {
        return this.isa.object(x);
      },
      //.........................................................................................................
      // These options are filled out by `mixa` or used by `command-line-args` in incompatible ways:
      "x.name is not set": function(x) {
        return x.name == null;
      },
      "x.group is not set": function(x) {
        return x.group == null;
      },
      "x.defaultOption is not set": function(x) {
        return x.defaultOption == null;
      },
      //.........................................................................................................
      "x.?type is a function": function(x) {
        return this.isa_optional.function(x.type);
      },
      "x.?alias is a text": function(x) {
        return this.isa_optional.text(x.alias);
      },
      "x.?description is a text": function(x) {
        return this.isa_optional.text(x.description);
      },
      "x.?multiple is a boolean": function(x) {
        return this.isa_optional.boolean(x.multiple);
      },
      "x.?lazyMultiple is a boolean": function(x) {
        return this.isa_optional.boolean(x.lazyMultiple);
      },
      "x.?defaultValue is anything": function(x) {
        return true;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_cmddef', {
    tests: {
      "x is an object": function(x) {
        return this.isa.object(x);
      },
      "x.name is not set": function(x) {
        return x.name == null;
      },
      "x.?description is a text": function(x) {
        return this.isa_optional.text(x.description);
      },
      "x.?external is a boolean": function(x) {
        return this.isa_optional.boolean(x.external);
      }
    }
  });

}).call(this);

//# sourceMappingURL=types.js.map