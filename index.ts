import { parse } from "https://deno.land/std/flags/mod.ts";
import { walkSync } from "https://deno.land/std/fs/mod.ts";
import { dirname } from "https://deno.land/std/path/mod.ts"
import { TagRepo } from "./src/tagRepo.ts";
import { assertFileOp, assertInitialized, assertUninitialized, fatal } from "./src/util.ts";

const args = parse(Deno.args);

if (!args._ || args._.length != 1) {
    console.log('Usage: deno run tagit.ts -- <command> [options]')
    Deno.exit(1);
}

try {
    const [ command ] = args._;
    // TODO: Check for errant flags for each command.
    switch (command) {
        case 'add': {
            assertFileOp(args);
            const repo = await TagRepo.from('.tag');
            // TODO: Check if the given path is actually a file, and not a directory.
            repo.add(args.f, args.t);
            repo.save();
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
            console.log(repo.toString());
            break;
        }
        case 'remove': {
            assertFileOp(args);
            const repo = await TagRepo.from('.tag');
            repo.remove(args.f, args.t);
            repo.save();
            break;
        }
    }
} catch (error) {
    fatal(error);
}