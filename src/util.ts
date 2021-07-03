import * as fs from "https://deno.land/std@0.100.0/fs/mod.ts";
import { VERSION } from "./constants.ts";

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

export const displayHelpMenu = () => {
    // TODO: This should probably be auto-generated based on available commands.
    // TODO: Also we'll want to move this out of the index.ts file.
    console.log(
        `TagIt v${VERSION}\n` +
        `author: Mathew Horner <mathewhorner456@gmail.com>\n\n` +
        `Commands\n` +
        `--------\n` +
        `add            Adds a tag to a file.\n` +
        `help           Displays this menu.\n` +
        `init           Initializes the current directory as a TagIt directory.\n` +
        `list           Lists files and their associated tags.\n` +
        `remove         Removes a tag from a file.\n` +
        `version        Displays the current version.\n`
    );
};

export const fatal = (message: string) => {
    console.log('Error:', message);
    Deno.exit(1);
}