

# M.I.X.A.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Command Line Structure](#command-line-structure)
- [Command Line Parsing: Example](#command-line-parsing-example)

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

<!--
# To Do

 -->