import { readLines } from "https://deno.land/std@0.100.0/io/mod.ts";
import { TagMapping, tagMappingToString } from "./tagMapping.ts";

export class TagRepo {
    #file: string;
    #tagToFile: TagMapping;
    #fileToTag: TagMapping;

    constructor(file: string, tagToFile: TagMapping) {
        this.#file = file;
        this.#tagToFile = { ...tagToFile };
        this.#fileToTag = {};

        for (const [tag, files] of Object.entries(this.#tagToFile)) {
            for (const file of files) {
                this.#fileToTag[file] = (this.#fileToTag[file] || []).concat(tag);
            }
        }
    }

    static async from(file: string): Promise<TagRepo> {
        const mappings: TagMapping = {};
        const reader = await Deno.open(file);
        let currentTag = '';

        for await (const line of readLines(reader)) {
            if (!currentTag) {
                currentTag = line;
            } else if (!line) {
                currentTag = '';
            } else if (line[0] == '-') {
                mappings[currentTag] = (mappings[currentTag] || []).concat(line.slice(2));
            } else {
                // TODO: Improve this error message?
                throw new Error('invalid line encountered!');
            }
        }

        Deno.close(reader.rid);
        return new TagRepo(file, mappings);
    }

    add(file: string, tag: string) {
        this.#tagToFile[tag] = (this.#tagToFile[tag] || []).concat(file);
        this.#fileToTag[file] = (this.#fileToTag[file] || []).concat(tag);
    }

    getFiles(tag: string): Array<string> {
        return this.#tagToFile[tag] || [];
    }

    getTags(file: string): Array<string> {
        return this.#fileToTag[file] || [];
    }

    remove(file: string, tag: string) {
        // TODO: Is there a more performant way to do this?
        if (this.#tagToFile[tag]) {
            this.#tagToFile[tag] = this.#tagToFile[tag].filter(file_ => file != file_);
        }
        if (this.#fileToTag[file]) {
            this.#fileToTag[file] = this.#fileToTag[file].filter(tag_ => tag != tag_);
        }
    }

    removeAllFiles(tag: string) {
        // TODO: Is there a more performant way to do this?
        for (const file of this.#tagToFile[tag]) {
            this.remove(file, tag);
        }
    }

    removeAllTags(file: string) {
        // TODO: Is there a more performant way to do this?
        // TODO: Why is this not working?
        for (const tag of this.#fileToTag[file]) {
            this.remove(file, tag);
        }
    }

    reset() {
        this.#tagToFile = {};
        this.#fileToTag = {};
    }

    save() {
        Deno.writeTextFileSync(this.#file, tagMappingToString(this.#tagToFile));
    }

    toString(): string {
        if (Object.keys(this.#tagToFile).length == 0) {
            return '';
        }
        return (
            `Tag -> File\n` +
            `-----------\n` +
            `${tagMappingToString(this.#tagToFile)}\n` +
            `File -> Tag\n` +
            `-----------\n` +
            `${tagMappingToString(this.#fileToTag)}`
        );
    }
}