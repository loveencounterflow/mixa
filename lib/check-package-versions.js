(function() {
  'use strict';
  var CND, SEMVER, alert, badge, debug, echo, help, info, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'MIXA/VERSION-CHECKER';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  SEMVER = require('semver');

  //===========================================================================================================
  module.exports = function(packages_and_versions) {
    var error, matcher, offenders, package_name, ref, ref1, version;
    offenders = [];
    ref = packages_and_versions.dependencies;
    for (package_name in ref) {
      matcher = ref[package_name];
      try {
        ({version} = require(`${package_name}/package.json`));
      } catch (error1) {
        error = error1;
        offenders.push(`${package_name} (≁ ${matcher}) (${(ref1 = error.code) != null ? ref1 : 'ERROR'}:${error.message})`);
        continue;
      }
      if (!SEMVER.satisfies(version, matcher)) {
        offenders.push(`${package_name}@${version} (≁ ${matcher})`);
        warn('^mixa/version-checker@1^', CND.reverse(`version of ${package_name} pinned at ${rpr(matcher)}, got ${rpr(version)}`));
      }
    }
    if (offenders.length === 0) {
      return null;
    }
    throw new Error("^mixa/version-checker@2^ the following packages do not have a matching version: " + offenders.join(', '));
    return null;
  };

}).call(this);

//# sourceMappingURL=check-package-versions.js.map