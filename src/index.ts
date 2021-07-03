import { parse } from "https://deno.land/std@0.100.0/flags/mod.ts";
import { existsSync, walkSync } from "https://deno.land/std@0.100.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.100.0/path/mod.ts"
import { TagRepo } from "./tagRepo.ts";
import { assertInitialized, assertUninitialized, displayHelpMenu, fatal } from "./util.ts";
import { VERSION } from "./constants.ts";

const args = parse(Deno.args);

if (args.h || args.help) {
    displayHelpMenu();
    Deno.exit(0);
}

if (args.v || args.version) {
    console.log(VERSION);
    Deno.exit(0);
}

if (!args._ || args._.length != 1) {
    console.log('Usage: deno run index.ts <command> [options]')
    Deno.exit(1);
}

try {
    const [ command ] = args._;
    // TODO: Check for errant flags for each command.
    switch (command) {
        case 'add': {
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
            break;
        }
        case 'help': {
            displayHelpMenu();
            break;
        }
        case 'init': {
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
            break;
        }
        case 'list': {
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

            break;
        }
        case 'remove': {
            assertInitialized();
            if (args.f && !(args.t || args.all)) {
                fatal('Tag not specified, please use -t <tag> or --all!');
            }
            if (args.t && !(args.f || args.all)) {
                fatal('File not specified, please use -f <file> or --all!');
            }

            const repo = await TagRepo.from('.tag');

            // TODO: Actually check if said mapping exists.
            if (args.t && args.f) {
                repo.remove(args.f, args.t);
            } else if (args.all && args.t) {
                repo.removeAllFiles(args.t);
            } else if (args.all && args.f) {
                repo.removeAllTags(args.t);
            } else {
                fatal('Invalid use of remove command!');
            }

            repo.save();
            break;
        }
        case 'version': {
            console.log(VERSION);
            break;
        }
    }
} catch (error) {
    fatal(error);
}