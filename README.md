

# M.I.X.A.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Command Line Structure](#command-line-structure)
- [Command Line Parsing: Example](#command-line-parsing-example)
- [Command Definitions](#command-definitions)
- [Passing Options to Other Programs](#passing-options-to-other-programs)
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

# Command Line Structure

```
node cli.js --cd=some/other/place funge --verbose=true -gh 'foo'
│  │ │    │ │                   │ │   │ └────────────┘ └─┘ └───┘
│  │ │    │ │                   │ │   │   L             S   P
└──┘ └────┘ └───────────────────┘ └───┘ └──────────────────────┘
  E    S      M                    I/X    A
```

* E—executable
* S—script
* **M**—meta flags (flags that pertain to MIXA)
* **I**/**X**—internal or external command
* **A**—arguments (flags that pertain to the command)
* L—long flag `verbose` with value
* S—short Boolean flags `g`, `h`
* P—positional flag


# Command Line Parsing: Example

* `parse defs, process.argv` will return object with
  * **`cmd`**—
  * **`argv`**—
  * **`error`**—

*upcoming*

# Command Definitions

* `meta`
* `commands`
  * `allow_extra`
  * `flags`
    * `multiple`: `false`, `'greedy'`, `'lazy'`; defaults to `false`; if `'greedy'`, multiple values may be
      set without repeating the flag name; if `'lazy'`, flag name must be repeated for each value. Ensuing
      named values are honored in either case.
    * `fallback` (translated to `defaultValue`): used when flag is missing; note that when flag is mentioned
      without a value, then value `none` will be assigned
    * `positional`: `true` or `false` (translated to `defaultOption`), indicates whether unnamed argument
      id allowed; interacts with `allow_extra`; only at most one flag can be marked `positional`
  * `run`: `function` or `asyncfunction`, will receive result of `MIXA.parse()`
  <!-- * `raw`: when `true`,  -->

# Passing Options to Other Programs

* Sometimes one wants to pass options to another executable; e.g. say we want to use `node x.js search
  -iname 'whatever'` to call the Linux `find` command in a subprocess and we wish to not analyze any options
  but just pass them through to the subprocess
* Note that the `find` utility uses long options with a single hyphen; problem is that the parser currently
  used bei MIXA will misinterpret `iname` as `[ '-i', '-n', '-a', '-m', '-e', ]`
* As a workaround, use `--` somewhere *after* the command (`search` in this example) but *before* before the
  first single-dash flag to be left as-is (`-iname` in this case), that is, call your program as `node x.js
  search -- -iname 'whatever'`.
* A future version of MIXA might not require using `--`.

# To Do

* [ ] consider whether to replace `positional` flag configuration with a single option in command
  configuration
