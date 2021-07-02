import * as fs from "https://deno.land/std@0.100.0/fs/mod.ts";
import { Args } from "https://deno.land/std@0.100.0/flags/mod.ts";

export const assertFileOp = (args: Args) => {
    assertInitialized();
    if (!args.f) {
        fatal('File not specified, please use -f <file>!');
    }
    if (!args.t) {
        fatal('Tag not specified, please use -t <tag>!');
    }
    if (!fs.existsSync(args.f)) {
        fatal('File not found!');
    }
}

export const assertInitialized = () => {
    if (!directoryInitialized()) {
        fatal('TagIt directory not initialized!');
    }
}

export const assertUninitialized = () => {
    if (directoryInitialized()) {
        fatal('TagIt directory already initialized!');
    }
}

export const directoryInitialized = (): boolean => {
    return fs.existsSync('.tag');
};

export const fatal = (message: string) => {
    console.log('Error:', message);
    Deno.exit(1);
}