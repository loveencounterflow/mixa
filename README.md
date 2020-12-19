

# M.I.X.A.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

  - [Command Line Structure](#command-line-structure)
  - [Metaflags](#metaflags)
  - [Job Definition (`<jobdef>`)](#job-definition-jobdef)
  - [Command Definitions (`<cmddefs>`, `<cmddef>`)](#command-definitions-cmddefs-cmddef)
  - [Flag Definitions (`<flagdefs>`, `<flagdef>`)](#flag-definitions-flagdefs-flagdef)
  - [Command Line Parsing: Example](#command-line-parsing-example)
- [Passing Options to Other Programs](#passing-options-to-other-programs)
- [Passing Options to Run Methods](#passing-options-to-run-methods)
- [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

* M.I.X.A. is short for **M**eta—**I**nternal/e**X**ternal command—**A**rguments
* this is the generalized command line structure
* flags, a.k.a. 'options', 'settings', Boolean or not:
  * Boolean flags have no srgument and are `true` when given
  * flags of other types must be given a value as `-f value`, `--flag value`, optionally with an equals sign
    between the flag name and the value
* Internal commands must parse their specific flags and other arguments.
* External commands call a child process that is passed the remaing command line arguments, so those can be
  dealt with summarily.

## Command Line Structure

```
node cli.js │ --cd=some/other/place funge --verbose=true -gh 'foo'
│  │ │    │ │ │                   │ │   │ └────────────┘ └─┘ └───┘
│  │ │    │ │ │                   │ │   │   L             S   P
└──┘ └────┘ │ └───────────────────┘ └───┘ └──────────────────────┘
  E    S    │   M                    I/X    A
```

* E—executable
* S—script
* **M**—meta flags (flags that pertain to MIXA)
* **I**/**X**—internal or external command
* **A**—arguments (flags that pertain to the command)
* L—long flag `verbose` with value
* S—short Boolean flags `g`, `h`
* P—positional flag

A valid command line must either call for printing a application-specific help (using one of `... -h`, `...
--help`, or `... help`), or application version (using one of `... -v`, `... --version`, or `... version`),
or else spell out a configured application-specific command (including additional arguments where required).

## Metaflags

Metaflags are command line arguments preceded by one (short form) or two (long form) dashes that are placed
before the command line like so:

```bash
node cli.js --help                                  # show help and exit
node cli.js -h                                      # dto.
node cli.js --version                               # show version and exit
node cli.js -v                                      # dto.
node cli.js --cd some/other/place/somewhere foo 42  # change into directory given, then run `foo 42`
node cli.js -d some/other/place/somewhere foo 42    # dto.
```

The above are the preconfigured metaflags, but one can define additional ones in the [Job Definition
(`<jobdef>`)](#job-definition-jobdef).

## Job Definition (`<jobdef>`)

A Job definition (an object of type `<jobdef>`) specifies declaratively what additional metaflags and
commands are available for the application in question. A Job definition may contain the following fields
(question mark indicates optional value, angle brackets specifiy types; the default is given behind the
equals sign):

* **`?exit_on_error <boolean> = true`**—When calling `MIXA.run jobdef, input`, determines whether to exit
  with an exit code in case an error in the jobdef or the input was detected. `exit_on_error` does not
  affect the behavior of `MIXA.parse jobdef, input`.
* **`?meta <mixa_flagdefs>`**—An object that specifies (additional) metaflags to go before the command.
  See [Flag Definitions (`<flagdefs>`, `<flagdef>`)](#flag-definitions-flagdefs-flagdef)
* **`?commands <mixa_cmddefs>`**—See [Command Definitions (`<cmddefs>`,
  `<cmddef>`)](#command-definitions-cmddefs-cmddef).

Example:

```coffee
jobdef =
  exit_on_error: true
  commands:
    foo: { ... definition for command `foo` ... }
    bar: { ... definition for command `bar` ... }
```

This job definition declares that there two commands `foo` and `bar` in the application.

## Command Definitions (`<cmddefs>`, `<cmddef>`)

The keys of a `cmddefs` object are interpreted as command names; its values are `<cmddef>` objects:

* **`?description <text>`**—A helpful one-liner to explain what the command does.
* **`?allow_extra <boolean> = false`**—Whether to allow unspecified arguments on the command line; these
  will be made available as `verdict.extra`.
* **`?flags <mixa_flagdefs>`**—An object detailing each command line argument to the command in question.
* **`?runner <_mixa_runnable>`**—A synchronous or asynchronous function to be called by `MIXA.run jobdef,
  input` provided no error occured during validation of `jobdef` and parsing the `input`
* **`?plus <any>`**—Any additional value or values that should be made accessible to the runner as
  `verdict.plus`.

Example (cont'd from above):

```coffee
# file: cli.coffee

MIXA = require 'mixa'

jobdef =
  exit_on_error: true
  commands:
    foo:
      description:    "Do something awesome"
      allow_extra:    true                          # allow unconfigured extra arguments
      runner:         run_foo                       # function to be called
    listfiles:
      runner:         MIXA.runners.execSync         # call convenience function for sync sub-process
      plus:           { executable: 'ls', }         # `execSync` will use `plus.executable` as name of executable
      allow_extra:    true                          # `true` b/c we want to pass arguments to `ls`

console.log MIXA.run jobdef, process.argv

```

We can now call `node cli.js --cd=somewhere listfiles -- -AlF` from the command line to execute `ls -AlF`
and get back whatever that outputs.


## Flag Definitions (`<flagdefs>`, `<flagdef>`)

The keys of a `flagdefs` object are interpreted as long flag names; its values are `<flagdef>` objects:

* **`multiple <_mixa_mutliple>`**—`false`, `'greedy'`, `'lazy'`; defaults to `false`; if `'greedy'`,
  multiple values may be set without repeating the flag name; if `'lazy'`, flag name must be repeated for
  each value. Ensuing named values are honored in either case.
* **`fallback <any>`**—Used when flag is missing; note that when flag is mentioned without a value, then
  value `none` will be assigned
* **`positional <boolean>`**—`true` or `false` (translated to `defaultOption`), indicates whether unnamed argument
  id allowed; interacts with `allow_extra`; only at most one flag can be marked `positional`


## Command Line Parsing: Example

* `parse jobdef, process.argv` will return object with
  * **`jobdef`**—The `jobdef` that describes how to parse command line arguments into a command with
    flags (jobflags and metaflags)
  * **`input`**—The `argv` used as input, unchanged
  * **`verdict`**—The result of parsing the input `argv` against the `jobdef`; this is either a 'happy'
    result or, if an error was detected, a 'sad' result with indicators what the problem was.
    * A happy verdict will have the following attributes:
      * **`cmd`**—The matching command;
      * **`argv`**—Remaining arguments, if any;
      * **`parameters`**—Object with the named flags and their values;
      * **`plus`**—The `plus` attribute from the matching jobdef's command definition, if any;
      * **`runner`**—The `runner` attribute from the matching jobdef's command definition, if any.
    * A sad verdict will have the following attributes:
      * **`cmd`**—Invariably set to `help`, indicating that a helpful message should be displayed;
      * **`error`**:
        * **`tag`**—A short upper case textual code that identifies the error class
        * **`code`**—An integer error code in the range `[ 1 .. 127 ]`
        * **`message`**—An error message
  * **`output`**:—What the runner returned
    * **`ok`**:—The value of the computation, if any, depending on the runner called
    * **`error`**:—Details in case a runner encountered problems computing an `ok` value; as above, will
      have fields `tag`, `code`, `message` where present

*upcoming*

# Passing Options to Other Programs

* Sometimes one wants to pass options to another executable; e.g. say we want to use `node x.js search
  -iname 'whatever'` to call the Linux `find` command in a subprocess and we wish to not analyze any options
  but just pass them through to the subprocess
* Note that the `find` utility uses long options with a single hyphen; problem is that the parser currently
  used bei MIXA will misinterpret `iname` as `[ '-i', '-n', '-a', '-m', '-e', ]`
* As a workaround, use `--` (a.k.a. 'the inhibitor') somewhere *after* the command (`search` in this
  example) but *before* before the first single-dash flag to be left as-is (`-iname` in this case), that is,
  call your program as `node x.js search -- -iname 'whatever'`.
* A future version of MIXA might not require using `--`.
* Observe that `allow_extra` should be set to `true` to allow extra arguments; otherwise, an `EXTRA_FLAGS`
  error will be generated.

# Passing Options to Run Methods

* set `runner` in the command definition to a synchronous or asynchronous function that will be called with the
  object that describes the parsing result; this will be called the 'run method' or the 'runner'
* set `plus` in the command definition to any value to be attached to the result object
* the value of `plus` is specific to the run method chosen

# To Do

* [ ] consider whether to replace `positional` flag configuration with a single option in command
  configuration
* [ ] implement mandatory flags
* [ ] consider moving from `command-line-args` to [`sade`](https://github.com/lukeed/sade)
* [ ] consider to offer sub-contexts as done by https://github.com/substack/subarg





