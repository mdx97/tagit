import { Args } from "https://deno.land/std@0.100.0/flags/mod.ts";
import * as sc from "./subcommands.ts";

export const VERSION = '0.1.0';

type SubcommandMetadata = {
    code: (args: Args) => void,
    help: string,
};

export const SUBCOMMAND_TABLE: Record<string, SubcommandMetadata> = {
    add: {
        code: sc.subcommandAdd,
        help: 'Adds a tag to a file.',
    },
    help: {
        code: sc.subcommandHelp,
        help: 'Displays this menu.',
    },
    init: {
        code: sc.subcommandInit,
        help: 'Initializes the current directory as a TagIt directory.',
    },
    list: {
        code: sc.subcommandList,
        help: 'Lists files and their associated tags.',
    },
    remove: {
        code: sc.subcommandRemove,
        help: 'Removes a tag from a file.',
    },
    version: {
        code: sc.subcommandVersion,
        help: 'Displays the current version.',
    },
};