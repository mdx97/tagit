import { parse } from "https://deno.land/std@0.100.0/flags/mod.ts";
import { walkSync } from "https://deno.land/std@0.100.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.100.0/path/mod.ts"
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
            if (!(await Deno.lstat(args.f)).isFile) {
                fatal('Not a file!');
            }
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