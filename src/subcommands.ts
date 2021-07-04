import { Args } from "https://deno.land/std@0.100.0/flags/mod.ts";
import { existsSync, walkSync } from "https://deno.land/std@0.100.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.100.0/path/mod.ts"
import { TagRepo } from "./tagRepo.ts";
import { assertInitialized, assertUninitialized, fatal } from "./util.ts";
import { SUBCOMMAND_TABLE, VERSION } from "./constants.ts";

export const subcommandAdd = async (args: Args) => {
    assertInitialized();
    if (!args.f) {
        fatal('File not specified, please use -f <file>!');
    }
    if (!args.t) {
        fatal('Tag not specified, please use -t <tag>!');
    }

    const repo = await TagRepo.from('.tag');
    const files = args.f.split(',');
    const tags = args.t.split(',');

    for (const tag of tags) {
        for (const file of files) {
            if (!existsSync(file)) {
                fatal(`${file} not found!`);
            }
            if (!(await Deno.lstat(file)).isFile) {
                fatal(`${file} is not a file!`);
            }
            repo.add(file, tag);
        }
    }

    repo.save();
};

export const subcommandHelp = (_args: Args) => {
    console.log(
        `TagIt v${VERSION}\n` +
        `author: Mathew Horner <mathewhorner456@gmail.com>\n\n` +
        `Subcommands\n` +
        `-----------`
    );
    const maxSubcommandLength = (
        Object.keys(SUBCOMMAND_TABLE)
            .sort((a, b) => (a.length > b.length) ? 1 : 0)
            .slice(-1)[0]
            .length
    );
    for (const [command, metadata] of Object.entries(SUBCOMMAND_TABLE)) {
        // The +3 here has no real significance, it's just an arbitrary visual adjustment.
        console.log(`${command.padEnd(maxSubcommandLength + 3, ' ')}${metadata.help}`);
    }
};

export const subcommandInit = (args: Args) => {
    assertUninitialized();
    const repo = new TagRepo('.tag', {});

    if (args["infer-tags"]) {
        for (const entry of walkSync('.')) {
            if (entry.isFile && !dirname(entry.path).includes('.')) {
                // TODO: Don't think this is cross-platform.
                const tokens = dirname(entry.path).split('\\');
                repo.add(entry.path, tokens[tokens.length - 1]);
            }
        }
    }

    repo.save();
};

export const subcommandList = async (args: Args) => {
    assertInitialized();
    const repo = await TagRepo.from('.tag');

    if (args.t && args.f) {
        fatal('Only specify one of -t or -f!');
    } else if (args.t) {
        console.log(repo.getFiles(args.t).join('\n'));
    } else if (args.f) {
        // TODO: Make this work cross-platform with paths. Currently, on Windows you need to type directories like: path\\to\\file.txt
        console.log(repo.getTags(args.f).join('\n'));
    } else {
        console.log(repo.toString());
    }
};

export const subcommandRemove = async (args: Args) => {
    // TODO: We should also probably check for file existence here too...
    assertInitialized();
    if (args.f && !(args.t || args.all)) {
        fatal('Tag not specified, please use -t <tag> or --all!');
    }
    if (args.t && !(args.f || args.all)) {
        fatal('File not specified, please use -f <file> or --all!');
    }

    const repo = await TagRepo.from('.tag');

    // TODO: Disallow --all when -t and -f are specified.
    // Not really a huge deal since it shouldn't do anything anyways.
    if (args.t && args.f) {
        if (!repo.getTags(args.f).includes(args.t)) {
            fatal('That file does not have that tag!');
        }
        repo.remove(args.f, args.t);

    } else if (args.all && args.t) {
        if (repo.getFiles(args.t).length == 0) {
            fatal('Tag does not exist!')
        }
        repo.removeAllFiles(args.t);

    } else if (args.all && args.f) {
        if (repo.getTags(args.f).length == 0) {
            fatal('File has no tags!');
        }
        repo.removeAllTags(args.t);

    } else {
        fatal('Invalid use of remove command!');
    }

    repo.save();
};

export const subcommandVersion = (_args: Args) => {
    console.log(VERSION);
};