import { parse } from "https://deno.land/std@0.100.0/flags/mod.ts";
import { fatal } from "./util.ts";
import { SUBCOMMAND_TABLE, subcommandHelp, subcommandVersion } from "./subcommands.ts";

const args = parse(Deno.args);

if (args.h || args.help) {
    subcommandHelp(args);
    Deno.exit(0);
}

if (args.v || args.version) {
    subcommandVersion(args);
    Deno.exit(0);
}

if (!args._ || args._.length != 1) {
    console.log('Usage: deno run index.ts <command> [options]')
    Deno.exit(1);
}

try {
    // TODO: Check for errant flags for each command.
    const [ command ] = args._;
    if (!SUBCOMMAND_TABLE[command]) {
        fatal('Invalid subcommand!');
    }
    SUBCOMMAND_TABLE[command].code(args);

} catch (error) {
    fatal(error);
}