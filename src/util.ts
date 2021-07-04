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

export const fatal = (message: string) => {
    console.log('Error:', message);
    Deno.exit(1);
}
