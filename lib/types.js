(function() {
  'use strict';
  var CND, Intertype, L, alert, badge, debug, has_only_keys, help, info, intertype, jr, rpr, urge, warn, whisper,
    indexOf = [].indexOf;

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
  has_only_keys = function(x, keys) {
    var k;
    for (k in x) {
      if (indexOf.call(keys, k) >= 0) {
        continue;
      }
      // urge '^227266^', "has key #{rpr k}: #{rpr x}"
      return false;
    }
    return true;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_settings', {
    tests: {
      "x is an object": function(x) {
        return this.isa.object(x);
      },
      "x.?meta is a mixa_flagdefs": function(x) {
        return this.isa_optional.mixa_flagdefs(x.meta);
      },
      "x.?commands is a mixa_cmddefs": function(x) {
        return this.isa_optional.mixa_cmddefs(x.commands);
      },
      "x has only keys 'meta', 'commands'": function(x) {
        return has_only_keys(x, ['meta', 'commands']);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_flagdefs', {
    tests: {
      "x is an object of mixa_flagdef": function(x) {
        return this.isa_object_of('mixa_flagdef', x);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_cmddefs', {
    tests: {
      "x is an object of mixa_cmddef": function(x) {
        return this.isa_object_of('mixa_cmddef', x);
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
      // # These options are filled out by `mixa` or used by `command-line-args` in incompatible ways:
      // "x.name is not set":                      ( x ) -> not x.name?
      // "x.group is not set":                     ( x ) -> not x.group?
      // "x.defaultOption is not set":             ( x ) -> not x.defaultOption?
      // "x.?lazyMultiple is not set":             ( x ) -> not x.lazyMultiple?
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
      "x.?multiple is a _mixa_multiple": function(x) {
        return this.isa_optional._mixa_multiple(x.multiple);
      },
      "x.?defaultValue is anything": function(x) {
        return true;
      },
      "x has only keys 'type', 'alias', 'description', 'multiple', 'defaultValue'": function(x) {
        return has_only_keys(x, ['type', 'alias', 'description', 'multiple', 'defaultValue']);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('_mixa_multiple', {
    tests: {
      "x? is either false or 'lazy' or 'greedy": function(x) {
        return x === null || x === false || x === 'greedy' || x === 'lazy';
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('mixa_cmddef', {
    tests: {
      "x is an object": function(x) {
        return this.isa.object(x);
      },
      // "x.name is not set":                      ( x ) -> not x.name?
      "x.?description is a text": function(x) {
        return this.isa_optional.text(x.description);
      },
      "x.?allow_extra is a boolean": function(x) {
        return this.isa_optional.boolean(x.allow_extra);
      },
      "x.?flags is a mixa_flagdefs": function(x) {
        return this.isa_optional.mixa_flagdefs(x.flags);
      },
      "x has only keys 'description', 'allow_extra', 'flags'": function(x) {
        return has_only_keys(x, ['description', 'allow_extra', 'flags']);
      }
    }
  });

}).call(this);

//# sourceMappingURL=types.js.map