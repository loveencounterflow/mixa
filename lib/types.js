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
  this.declare('mixa_jobdef', {
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
      "x.?exit_on_error is a boolean": function(x) {
        return this.isa_optional.boolean(x.exit_on_error);
      },
      "x.?default_command is a nonempty_text": function(x) {
        return this.isa_optional.nonempty_text(x.default_command);
      },
      "x has only keys 'meta', 'commands', 'exit_on_error', 'default_command'": function(x) {
        return has_only_keys(x, ['meta', 'commands', 'exit_on_error', 'default_command']);
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
      "x.?positional is a boolean": function(x) {
        return this.isa_optional.boolean(x.positional);
      },
      "x.?fallback is anything": function(x) {
        return true;
      },
      "x has only keys 'type', 'alias', 'description', 'multiple', 'fallback', 'positional'": function(x) {
        return has_only_keys(x, ['type', 'alias', 'description', 'multiple', 'fallback', 'positional']);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('_mixa_multiple', {
    tests: {
      "x? is either false or 'lazy' or 'greedy'": function(x) {
        return x === null || x === false || x === 'greedy' || x === 'lazy';
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('_mixa_runnable', {
    tests: {
      "x is a sync or async function": function(x) {
        return (this.isa.function(x)) || (this.isa.asyncfunction(x));
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
      "x.?runner is a _mixa_runnable": function(x) {
        return this.isa_optional._mixa_runnable(x.runner);
      },
      "x.?plus is anything": function(x) {
        return true;
      },
      "x has only keys 'description', 'allow_extra', 'flags', 'runner', 'plus'": function(x) {
        return has_only_keys(x, ['description', 'allow_extra', 'flags', 'runner', 'plus']);
      }
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3R5cGVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUFBO0FBQUEsTUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUE7SUFBQSxvQkFBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsR0FBQSxHQUE0QixHQUFHLENBQUM7O0VBQ2hDLEtBQUEsR0FBNEI7O0VBQzVCLEtBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxPQUFmLEVBQTRCLEtBQTVCOztFQUM1QixLQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1Qjs7RUFDNUIsT0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLFNBQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixFQUFBLEdBQTRCLElBQUksQ0FBQzs7RUFDakMsU0FBQSxHQUE0QixDQUFFLE9BQUEsQ0FBUSxXQUFSLENBQUYsQ0FBdUIsQ0FBQzs7RUFDcEQsU0FBQSxHQUE0QixJQUFJLFNBQUosQ0FBYyxNQUFNLENBQUMsT0FBckI7O0VBQzVCLENBQUEsR0FBNEIsS0FqQjVCOzs7RUFvQkEsYUFBQSxHQUFnQixRQUFBLENBQUUsQ0FBRixFQUFLLElBQUwsQ0FBQTtBQUNoQixRQUFBO0lBQUUsS0FBQSxNQUFBO01BQ0UsaUJBQWlCLE1BQUwsT0FBWjtBQUFBLGlCQUFBO09BQUo7O0FBRUksYUFBTztJQUhUO0FBSUEsV0FBTztFQUxPLEVBcEJoQjs7O0VBNEJBLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVCxFQUF3QjtJQUFBLEtBQUEsRUFDdEI7TUFBQSxnQkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksQ0FBWjtNQUFULENBQTFDO01BQ0EsNEJBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLElBQUMsQ0FBQSxZQUFZLENBQUMsYUFBZCxDQUE2QixDQUFDLENBQUMsSUFBL0I7TUFBVCxDQUQxQztNQUVBLCtCQUFBLEVBQTBDLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxJQUFDLENBQUEsWUFBWSxDQUFDLFlBQWQsQ0FBNkIsQ0FBQyxDQUFDLFFBQS9CO01BQVQsQ0FGMUM7TUFHQSwrQkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQTZCLENBQUMsQ0FBQyxhQUEvQjtNQUFULENBSDFDO01BSUEsdUNBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLElBQUMsQ0FBQSxZQUFZLENBQUMsYUFBZCxDQUE2QixDQUFDLENBQUMsZUFBL0I7TUFBVCxDQUoxQztNQUtBLHdFQUFBLEVBQTBFLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFDeEUsYUFBQSxDQUFjLENBQWQsRUFBaUIsQ0FBRSxNQUFGLEVBQVUsVUFBVixFQUFzQixlQUF0QixFQUF1QyxpQkFBdkMsQ0FBakI7TUFEd0U7SUFMMUU7RUFEc0IsQ0FBeEIsRUE1QkE7OztFQXNDQSxJQUFDLENBQUEsT0FBRCxDQUFTLGVBQVQsRUFBMEI7SUFBQSxLQUFBLEVBQ3hCO01BQUEsZ0NBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLElBQUMsQ0FBQSxhQUFELENBQWUsY0FBZixFQUErQixDQUEvQjtNQUFUO0lBQTFDO0VBRHdCLENBQTFCLEVBdENBOzs7RUEwQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQXlCO0lBQUEsS0FBQSxFQUN2QjtNQUFBLCtCQUFBLEVBQTBDLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxJQUFDLENBQUEsYUFBRCxDQUFlLGFBQWYsRUFBOEIsQ0FBOUI7TUFBVDtJQUExQztFQUR1QixDQUF6QixFQTFDQTs7O0VBOENBLElBQUMsQ0FBQSxPQUFELENBQVMsY0FBVCxFQUF5QjtJQUFBLEtBQUEsRUFDdkI7TUFBQSxnQkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksQ0FBWjtNQUFULENBQTFDOzs7Ozs7OztNQVFBLHVCQUFBLEVBQTBDLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxJQUFDLENBQUEsWUFBWSxDQUFDLFFBQWQsQ0FBNkIsQ0FBQyxDQUFDLElBQS9CO01BQVQsQ0FSMUM7TUFTQSxvQkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQTZCLENBQUMsQ0FBQyxLQUEvQjtNQUFULENBVDFDO01BVUEsMEJBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLElBQUMsQ0FBQSxZQUFZLENBQUMsSUFBZCxDQUE2QixDQUFDLENBQUMsV0FBL0I7TUFBVCxDQVYxQztNQVdBLGlDQUFBLEVBQTBDLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxJQUFDLENBQUEsWUFBWSxDQUFDLGNBQWQsQ0FBNkIsQ0FBQyxDQUFDLFFBQS9CO01BQVQsQ0FYMUM7TUFZQSw0QkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQTZCLENBQUMsQ0FBQyxVQUEvQjtNQUFULENBWjFDO01BYUEseUJBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTO01BQVQsQ0FiMUM7TUFjQSxzRkFBQSxFQUNFLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxhQUFBLENBQWMsQ0FBZCxFQUFpQixDQUFFLE1BQUYsRUFBVSxPQUFWLEVBQW1CLGFBQW5CLEVBQWtDLFVBQWxDLEVBQThDLFVBQTlDLEVBQTBELFlBQTFELENBQWpCO01BQVQ7SUFmRjtFQUR1QixDQUF6QixFQTlDQTs7O0VBaUVBLElBQUMsQ0FBQSxPQUFELENBQVMsZ0JBQVQsRUFBMkI7SUFBQSxLQUFBLEVBQ3pCO01BQUEsMENBQUEsRUFBNEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLE1BQU8sUUFBUCxNQUFhLFNBQWIsTUFBb0IsWUFBcEIsTUFBOEI7TUFBdkM7SUFBNUM7RUFEeUIsQ0FBM0IsRUFqRUE7OztFQXFFQSxJQUFDLENBQUEsT0FBRCxDQUFTLGdCQUFULEVBQTJCO0lBQUEsS0FBQSxFQUN6QjtNQUFBLCtCQUFBLEVBQWlDLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxDQUFFLElBQUMsQ0FBQSxHQUFHLENBQUMsUUFBTCxDQUFjLENBQWQsQ0FBRixDQUFBLElBQXVCLENBQUUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxhQUFMLENBQW1CLENBQW5CLENBQUY7TUFBaEM7SUFBakM7RUFEeUIsQ0FBM0IsRUFyRUE7OztFQXlFQSxJQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0I7SUFBQSxLQUFBLEVBQ3RCO01BQUEsZ0JBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLENBQVo7TUFBVCxDQUExQzs7TUFFQSwwQkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQTZCLENBQUMsQ0FBQyxXQUEvQjtNQUFULENBRjFDO01BR0EsNkJBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUE2QixDQUFDLENBQUMsV0FBL0I7TUFBVCxDQUgxQztNQUlBLDZCQUFBLEVBQTBDLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxJQUFDLENBQUEsWUFBWSxDQUFDLGFBQWQsQ0FBNkIsQ0FBQyxDQUFDLEtBQS9CO01BQVQsQ0FKMUM7TUFLQSwrQkFBQSxFQUEwQyxRQUFBLENBQUUsQ0FBRixDQUFBO2VBQVMsSUFBQyxDQUFBLFlBQVksQ0FBQyxjQUFkLENBQTZCLENBQUMsQ0FBQyxNQUEvQjtNQUFULENBTDFDO01BTUEscUJBQUEsRUFBMEMsUUFBQSxDQUFFLENBQUYsQ0FBQTtlQUFTO01BQVQsQ0FOMUM7TUFPQSx5RUFBQSxFQUNFLFFBQUEsQ0FBRSxDQUFGLENBQUE7ZUFBUyxhQUFBLENBQWMsQ0FBZCxFQUFpQixDQUFFLGFBQUYsRUFBaUIsYUFBakIsRUFBZ0MsT0FBaEMsRUFBeUMsUUFBekMsRUFBbUQsTUFBbkQsQ0FBakI7TUFBVDtJQVJGO0VBRHNCLENBQXhCO0FBekVBIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbkNORCAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdjbmQnXG5ycHIgICAgICAgICAgICAgICAgICAgICAgID0gQ05ELnJwclxuYmFkZ2UgICAgICAgICAgICAgICAgICAgICA9ICdNSVhBL1RZUEVTJ1xuZGVidWcgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdkZWJ1ZycsICAgICBiYWRnZVxuYWxlcnQgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdhbGVydCcsICAgICBiYWRnZVxud2hpc3BlciAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3aGlzcGVyJywgICBiYWRnZVxud2FybiAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd3YXJuJywgICAgICBiYWRnZVxuaGVscCAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdoZWxwJywgICAgICBiYWRnZVxudXJnZSAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICd1cmdlJywgICAgICBiYWRnZVxuaW5mbyAgICAgICAgICAgICAgICAgICAgICA9IENORC5nZXRfbG9nZ2VyICdpbmZvJywgICAgICBiYWRnZVxuanIgICAgICAgICAgICAgICAgICAgICAgICA9IEpTT04uc3RyaW5naWZ5XG5JbnRlcnR5cGUgICAgICAgICAgICAgICAgID0gKCByZXF1aXJlICdpbnRlcnR5cGUnICkuSW50ZXJ0eXBlXG5pbnRlcnR5cGUgICAgICAgICAgICAgICAgID0gbmV3IEludGVydHlwZSBtb2R1bGUuZXhwb3J0c1xuTCAgICAgICAgICAgICAgICAgICAgICAgICA9IEBcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5oYXNfb25seV9rZXlzID0gKCB4LCBrZXlzICkgLT5cbiAgZm9yIGsgb2YgeFxuICAgIGNvbnRpbnVlIGlmIGsgaW4ga2V5c1xuICAgICMgdXJnZSAnXjIyNzI2Nl4nLCBcImhhcyBrZXkgI3tycHIga306ICN7cnByIHh9XCJcbiAgICByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHRydWVcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AZGVjbGFyZSAnbWl4YV9qb2JkZWYnLCB0ZXN0czpcbiAgXCJ4IGlzIGFuIG9iamVjdFwiOiAgICAgICAgICAgICAgICAgICAgICAgICAoIHggKSAtPiBAaXNhLm9iamVjdCB4XG4gIFwieC4/bWV0YSBpcyBhIG1peGFfZmxhZ2RlZnNcIjogICAgICAgICAgICAgKCB4ICkgLT4gQGlzYV9vcHRpb25hbC5taXhhX2ZsYWdkZWZzICB4Lm1ldGFcbiAgXCJ4Lj9jb21tYW5kcyBpcyBhIG1peGFfY21kZGVmc1wiOiAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLm1peGFfY21kZGVmcyAgIHguY29tbWFuZHNcbiAgXCJ4Lj9leGl0X29uX2Vycm9yIGlzIGEgYm9vbGVhblwiOiAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLmJvb2xlYW4gICAgICAgIHguZXhpdF9vbl9lcnJvclxuICBcInguP2RlZmF1bHRfY29tbWFuZCBpcyBhIG5vbmVtcHR5X3RleHRcIjogICggeCApIC0+IEBpc2Ffb3B0aW9uYWwubm9uZW1wdHlfdGV4dCAgeC5kZWZhdWx0X2NvbW1hbmRcbiAgXCJ4IGhhcyBvbmx5IGtleXMgJ21ldGEnLCAnY29tbWFuZHMnLCAnZXhpdF9vbl9lcnJvcicsICdkZWZhdWx0X2NvbW1hbmQnXCI6ICggeCApIC0+XG4gICAgaGFzX29ubHlfa2V5cyB4LCBbICdtZXRhJywgJ2NvbW1hbmRzJywgJ2V4aXRfb25fZXJyb3InLCAnZGVmYXVsdF9jb21tYW5kJywgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBkZWNsYXJlICdtaXhhX2ZsYWdkZWZzJywgdGVzdHM6XG4gIFwieCBpcyBhbiBvYmplY3Qgb2YgbWl4YV9mbGFnZGVmXCI6ICAgICAgICAgKCB4ICkgLT4gQGlzYV9vYmplY3Rfb2YgJ21peGFfZmxhZ2RlZicsIHhcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AZGVjbGFyZSAnbWl4YV9jbWRkZWZzJywgdGVzdHM6XG4gIFwieCBpcyBhbiBvYmplY3Qgb2YgbWl4YV9jbWRkZWZcIjogICAgICAgICAgKCB4ICkgLT4gQGlzYV9vYmplY3Rfb2YgJ21peGFfY21kZGVmJywgeFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBkZWNsYXJlICdtaXhhX2ZsYWdkZWYnLCB0ZXN0czpcbiAgXCJ4IGlzIGFuIG9iamVjdFwiOiAgICAgICAgICAgICAgICAgICAgICAgICAoIHggKSAtPiBAaXNhLm9iamVjdCB4XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAjIFRoZXNlIG9wdGlvbnMgYXJlIGZpbGxlZCBvdXQgYnkgYG1peGFgIG9yIHVzZWQgYnkgYGNvbW1hbmQtbGluZS1hcmdzYCBpbiBpbmNvbXBhdGlibGUgd2F5czpcbiAgIyBcIngubmFtZSBpcyBub3Qgc2V0XCI6ICAgICAgICAgICAgICAgICAgICAgICggeCApIC0+IG5vdCB4Lm5hbWU/XG4gICMgXCJ4Lmdyb3VwIGlzIG5vdCBzZXRcIjogICAgICAgICAgICAgICAgICAgICAoIHggKSAtPiBub3QgeC5ncm91cD9cbiAgIyBcInguZGVmYXVsdE9wdGlvbiBpcyBub3Qgc2V0XCI6ICAgICAgICAgICAgICggeCApIC0+IG5vdCB4LmRlZmF1bHRPcHRpb24/XG4gICMgXCJ4Lj9sYXp5TXVsdGlwbGUgaXMgbm90IHNldFwiOiAgICAgICAgICAgICAoIHggKSAtPiBub3QgeC5sYXp5TXVsdGlwbGU/XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgXCJ4Lj90eXBlIGlzIGEgZnVuY3Rpb25cIjogICAgICAgICAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLmZ1bmN0aW9uICAgICAgIHgudHlwZVxuICBcInguP2FsaWFzIGlzIGEgdGV4dFwiOiAgICAgICAgICAgICAgICAgICAgICggeCApIC0+IEBpc2Ffb3B0aW9uYWwudGV4dCAgICAgICAgICAgeC5hbGlhc1xuICBcInguP2Rlc2NyaXB0aW9uIGlzIGEgdGV4dFwiOiAgICAgICAgICAgICAgICggeCApIC0+IEBpc2Ffb3B0aW9uYWwudGV4dCAgICAgICAgICAgeC5kZXNjcmlwdGlvblxuICBcInguP211bHRpcGxlIGlzIGEgX21peGFfbXVsdGlwbGVcIjogICAgICAgICggeCApIC0+IEBpc2Ffb3B0aW9uYWwuX21peGFfbXVsdGlwbGUgeC5tdWx0aXBsZVxuICBcInguP3Bvc2l0aW9uYWwgaXMgYSBib29sZWFuXCI6ICAgICAgICAgICAgICggeCApIC0+IEBpc2Ffb3B0aW9uYWwuYm9vbGVhbiAgICAgICAgeC5wb3NpdGlvbmFsXG4gIFwieC4/ZmFsbGJhY2sgaXMgYW55dGhpbmdcIjogICAgICAgICAgICAgICAgKCB4ICkgLT4gdHJ1ZVxuICBcInggaGFzIG9ubHkga2V5cyAndHlwZScsICdhbGlhcycsICdkZXNjcmlwdGlvbicsICdtdWx0aXBsZScsICdmYWxsYmFjaycsICdwb3NpdGlvbmFsJ1wiOiAgICAgXFxcbiAgICAoIHggKSAtPiBoYXNfb25seV9rZXlzIHgsIFsgJ3R5cGUnLCAnYWxpYXMnLCAnZGVzY3JpcHRpb24nLCAnbXVsdGlwbGUnLCAnZmFsbGJhY2snLCAncG9zaXRpb25hbCcsIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AZGVjbGFyZSAnX21peGFfbXVsdGlwbGUnLCB0ZXN0czpcbiAgXCJ4PyBpcyBlaXRoZXIgZmFsc2Ugb3IgJ2xhenknIG9yICdncmVlZHknXCI6ICggeCApIC0+IHggaW4gWyBudWxsLCBmYWxzZSwgJ2dyZWVkeScsICdsYXp5JywgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBkZWNsYXJlICdfbWl4YV9ydW5uYWJsZScsIHRlc3RzOlxuICBcInggaXMgYSBzeW5jIG9yIGFzeW5jIGZ1bmN0aW9uXCI6ICggeCApIC0+ICggQGlzYS5mdW5jdGlvbiB4ICkgb3IgKCBAaXNhLmFzeW5jZnVuY3Rpb24geCApXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGRlY2xhcmUgJ21peGFfY21kZGVmJywgdGVzdHM6XG4gIFwieCBpcyBhbiBvYmplY3RcIjogICAgICAgICAgICAgICAgICAgICAgICAgKCB4ICkgLT4gQGlzYS5vYmplY3QgeFxuICAjIFwieC5uYW1lIGlzIG5vdCBzZXRcIjogICAgICAgICAgICAgICAgICAgICAgKCB4ICkgLT4gbm90IHgubmFtZT9cbiAgXCJ4Lj9kZXNjcmlwdGlvbiBpcyBhIHRleHRcIjogICAgICAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLnRleHQgICAgICAgICAgIHguZGVzY3JpcHRpb25cbiAgXCJ4Lj9hbGxvd19leHRyYSBpcyBhIGJvb2xlYW5cIjogICAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLmJvb2xlYW4gICAgICAgIHguYWxsb3dfZXh0cmFcbiAgXCJ4Lj9mbGFncyBpcyBhIG1peGFfZmxhZ2RlZnNcIjogICAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLm1peGFfZmxhZ2RlZnMgIHguZmxhZ3NcbiAgXCJ4Lj9ydW5uZXIgaXMgYSBfbWl4YV9ydW5uYWJsZVwiOiAgICAgICAgICAoIHggKSAtPiBAaXNhX29wdGlvbmFsLl9taXhhX3J1bm5hYmxlIHgucnVubmVyXG4gIFwieC4/cGx1cyBpcyBhbnl0aGluZ1wiOiAgICAgICAgICAgICAgICAgICAgKCB4ICkgLT4gdHJ1ZVxuICBcInggaGFzIG9ubHkga2V5cyAnZGVzY3JpcHRpb24nLCAnYWxsb3dfZXh0cmEnLCAnZmxhZ3MnLCAncnVubmVyJywgJ3BsdXMnXCI6ICAgICBcXFxuICAgICggeCApIC0+IGhhc19vbmx5X2tleXMgeCwgWyAnZGVzY3JpcHRpb24nLCAnYWxsb3dfZXh0cmEnLCAnZmxhZ3MnLCAncnVubmVyJywgJ3BsdXMnLCBdXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
