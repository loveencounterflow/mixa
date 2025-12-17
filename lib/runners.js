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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3J1bm5lcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUE7OztFQUlBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLEdBQUEsR0FBNEIsR0FBRyxDQUFDOztFQUNoQyxLQUFBLEdBQTRCOztFQUM1QixLQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsT0FBZixFQUE0QixLQUE1Qjs7RUFDNUIsS0FBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE9BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLE9BQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxTQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsVUFBSixDQUFlLE1BQWYsRUFBNEIsS0FBNUI7O0VBQzVCLElBQUEsR0FBNEIsR0FBRyxDQUFDLFVBQUosQ0FBZSxNQUFmLEVBQTRCLEtBQTVCOztFQUM1QixJQUFBLEdBQTRCLEdBQUcsQ0FBQyxVQUFKLENBQWUsTUFBZixFQUE0QixLQUE1Qjs7RUFDNUIsSUFBQSxHQUE0QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQVQsQ0FBYyxHQUFkLEVBZDVCOzs7RUFnQkEsRUFBQSxHQUE0QixPQUFBLENBQVEsZUFBUjs7RUFDNUIsS0FBQSxHQUE0QixPQUFBLENBQVEsU0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEdBQUYsRUFDRSxRQURGLEVBRUUs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VUFBdkM7TUFBbUQ7SUFBbkQsQ0FBakI7QUFDQTtNQUFJLEVBQUEsR0FBSyxFQUFFLENBQUMsUUFBSCxDQUFZLE9BQVosRUFBcUIsUUFBckIsRUFBVDtLQUF1QyxjQUFBO01BQU07QUFFM0MsYUFBTyxDQUFBOztRQUFFLEtBQUEsRUFBTztVQUFFLElBQUEsRUFBTSxFQUFSO1VBQVksR0FBQSxFQUFLLFNBQWpCO1VBQTRCLE9BQUEsRUFBUyxLQUFLLENBQUM7UUFBM0MsQ0FBVDtRQUFnRSxPQUFoRTtRQUF5RSxDQUFDLEdBQUQsQ0FBQSxFQUFPO01BQWhGLEVBRjhCOztBQUd2QyxXQUFPLENBQUUsRUFBRixFQUFNLE9BQU47RUF6Qkc7QUEvQ1oiLCJzb3VyY2VzQ29udGVudCI6WyJcbid1c2Ugc3RyaWN0J1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuQ05EICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2NuZCdcbnJwciAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQucnByXG5iYWRnZSAgICAgICAgICAgICAgICAgICAgID0gJ01JWEEvUlVOTkVSUydcbmRlYnVnICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnZGVidWcnLCAgICAgYmFkZ2VcbmFsZXJ0ICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnYWxlcnQnLCAgICAgYmFkZ2VcbndoaXNwZXIgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2hpc3BlcicsICAgYmFkZ2Vcbndhcm4gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnd2FybicsICAgICAgYmFkZ2VcbmhlbHAgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaGVscCcsICAgICAgYmFkZ2VcbnVyZ2UgICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAndXJnZScsICAgICAgYmFkZ2VcbmluZm8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZ2V0X2xvZ2dlciAnaW5mbycsICAgICAgYmFkZ2VcbmVjaG8gICAgICAgICAgICAgICAgICAgICAgPSBDTkQuZWNoby5iaW5kIENORFxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5DUCAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbnR5cGVzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3R5cGVzJ1xueyBpc2FcbiAgdmFsaWRhdGVcbiAgc2FkICAgICB9ICAgICAgICAgICAgICAgPSB0eXBlcy5leHBvcnQoKVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGhlbHAgPSAoIHBhcnNlICkgLT5cbiAgaWYgdHlwZXMuaXNhLmZ1bmN0aW9uIHNob3dfaGVscCA9IHBhcnNlLmpvYmRlZj8uY29tbWFuZHM/LmhlbHA/LnJ1bm5lclxuICAgIGVjaG8oKVxuICAgIHNob3dfaGVscCgpXG4gICAgZWNobygpXG4gIGVsc2VcbiAgICBpbmZvICdeMjMzMzg3XicsIFwibm8gaGVscCBjb21tYW5kIGNvbmZpZ3VyZWRcIlxuICBleGl0X29uX2Vycm9yID0gcGFyc2Uuam9iZGVmLmV4aXRfb25fZXJyb3IgPyB0cnVlXG4gICMgd2hpc3BlciAnXjIzMzM4N14nLCBwYXJzZVxuICBpZiAoIGVycm9yID0gcGFyc2UudmVyZGljdC5lcnJvciAgICAgICkgPyBudWxsIHRoZW4gc3RhZ2UgPSAnaW5wdXQnXG4gIGVsc2UgaWYgKCBlcnJvciA9IHBhcnNlLm91dHB1dC5lcnJvciAgKSA/IG51bGwgdGhlbiBzdGFnZSA9ICdvdXRwdXQnXG4gIGlmIGVycm9yP1xuICAgICMjIyBUQUlOVCB1c2UgYF9zaWduYWwoKWAgdG8gZGVyaXZlIGRlZmF1bHRzICMjI1xuICAgIGNvZGUgICAgPSBlcnJvci5jb2RlID8gMThcbiAgICB0YWcgICAgID0gZXJyb3IudGFnICA/ICdVTktOT1dOJ1xuICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlID8gXCJhbiB1bnNwZWNpZmllZCBlcnJvciBvY2N1cnJlZFwiXG4gICAgd2FybiAnXm1peGEvcnVubmVycy9oZWxwQDQ0NTdeJywgXCJ0YWc6ICN7dGFnfSwgY29kZTogI3tjb2RlfSwgc3RhZ2U6ICN7cnByIHN0YWdlfVwiXG4gICAgd2FybiAnXm1peGEvcnVubmVycy9oZWxwQDQ0NTdeJywgQ05ELnJldmVyc2UgXCIgI3ttZXNzYWdlfSBcIlxuICAgIHByb2Nlc3MuZXhpdCBjb2RlIGlmIGV4aXRfb25fZXJyb3JcbiAgcmV0dXJuIHBhcnNlXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGV4ZWNTeW5jID0gKCBwYXJzZSApIC0+XG4gIHsgam9iZGVmXG4gICAgdmVyZGljdCB9ID0gcGFyc2VcbiAgZXhlY3V0YWJsZSAgPSB2ZXJkaWN0LnBsdXM/LmV4ZWN1dGFibGUgPyBqb2JkZWYuZXhlY3V0YWJsZSA/IHZlcmRpY3QuY21kXG4gIHZhbGlkYXRlLm5vbmVtcHR5X3RleHQgZXhlY3V0YWJsZVxuICBhcmd2ICAgICAgICA9IHZlcmRpY3QuYXJndiAgICAgICAgPyBbXVxuICAjIyMgVEFJTlQgbWFrZSBlc2NhcGluZyBvZiBhcmd1bWVudHMgY29uZmlndXJhYmxlPyAjIyNcbiAgYXJncyAgICAgICAgPSBDTkQuc2hlbGxlc2NhcGUgYXJndlxuICAjIGFyZ3MgICAgICAgID0gYXJndi5qb2luICcgJ1xuICBjb21tYW5kICAgICA9IFwiI3tleGVjdXRhYmxlfSAje2FyZ3N9XCJcbiAgc2V0dGluZ3MgICAgPVxuICAgIGN3ZDogICAgICAgICAgdmVyZGljdC5jZCA/IHByb2Nlc3MuY3dkKClcbiAgICBlbmNvZGluZzogICAgICd1dGYtOCdcbiAgcGFyYW1ldGVycyAgPSB2ZXJkaWN0LnBhcmFtZXRlcnMgID8gbnVsbFxuICBpZiBwYXJhbWV0ZXJzPyBhbmQgKCBrZXlzID0gT2JqZWN0LmtleXMgcGFyYW1ldGVycyApLmxlbmd0aCA+IDBcbiAgICAjIyMgVEFJTlQgYXBwbHkgcGFyYW1ldGVycyB0byBDUCBzZXR0aW5ncz8gIyMjXG4gICAgIyMjIFRBSU5UIGRvbid0IHRocm93IGVycm9yLCByZXR1cm4gc2FkIHJlc3VsdCAjIyNcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJeMzM2NjdeIGRvbid0IGtub3cgcGFyYW1ldGVycyAje3JwciBwYXJhbWV0ZXJzfVwiXG4gIGluZm8gJ14yMzMzODdeJywgXCI9PT09PT09PSBleGVjU3luYyA9PT09PT09PT09XCJcbiAgd2hpc3BlciAnXjIzMzM4N14nLCBwYXJzZVxuICAjIyMgVEFJTlQgbWFrZSB0aGlzIGluZm8gcGFydCBvZiByZXN1bHQgIyMjXG4gIGluZm8gJ14yMzMzODdeJywgeyBleGVjdXRhYmxlLCBhcmd2LCBjd2Q6IHNldHRpbmdzLmN3ZCwgcGFyYW1ldGVycywgY29tbWFuZCwgfVxuICB0cnkgb2sgPSBDUC5leGVjU3luYyBjb21tYW5kLCBzZXR0aW5ncyBjYXRjaCBlcnJvclxuICAgICMjIyBUQUlOVCBkb24ndCB0aHJvdyBlcnJvciwgcmV0dXJuIHNhZCByZXN1bHQgIyMjXG4gICAgcmV0dXJuIHsgZXJyb3I6IHsgY29kZTogMTYsIHRhZzogJ1VOS05PV04nLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCB9LCBjb21tYW5kLCBbc2FkXTogdHJ1ZSwgfVxuICByZXR1cm4geyBvaywgY29tbWFuZCwgfVxuXG5cblxuXG4iXX0=
