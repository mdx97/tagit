# 001 Subcommand Table

This design document introduces the idea of a subcommand table, a way to centralize data regarding what subcommands exist in TagIt, their code, and an extensible set of metadata surrounding each subcommand (help text, etc)

## Structure

A data structure is required that allows us to look up metadata for a given subcommand that is read off of the command line. The simplest way to do this is with an object.

Pseudocode:
```javascript
const SUBCOMMAND_TABLE = {
    help: {
        code: subcommandHelp,
        help: 'Displays this menu',
    },
    init: {
        code: subcommandInit,
        help: 'Initialize a TagIt repo',
    },
}
```

## Command Invocation

Each subcommand will have its own function for invocation. These new functions should go in their own module (`src/subcommands.ts`). Each subcommand function will need to take in the command line arguments object (of type `Args`) as a parameter.

Pseudocode:
```javascript
const subcommandInit = (args: Args) => {
    assertUninitialized();
    // ...
};
```

## Auxiliary Work
- The help menu must be re-written to construct the subcommand section programatically from the subcommand table.

## Future Work
- The subcommand metadata could potentially be used in the future to define what command line flags are available for each subcommand.