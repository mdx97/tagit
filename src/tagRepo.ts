import { readLines } from "https://deno.land/std/io/mod.ts";

type TagMapping = Record<string, Array<string>>;

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

        return new TagRepo(file, mappings);
    }

    static mappingToString = (mapping: TagMapping): string => {
        let builder = '';
        for (const [key, values] of Object.entries(mapping)) {
            builder += `${key}\n`;
            for (const value of values) {
                builder += `- ${value}\n`;
            }
            builder += '\n';
        }
        return builder;
    };

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
        if (this.#tagToFile[tag]) {
            this.#tagToFile[tag] = this.#tagToFile[tag].filter(file_ => file != file_);
        }
        if (this.#fileToTag[file]) {
            this.#fileToTag[file] = this.#fileToTag[file].filter(tag_ => tag != tag_);
        }
    }

    save() {
        Deno.writeTextFileSync(this.#file, TagRepo.mappingToString(this.#tagToFile));
    }

    toString(): string {
        if (Object.keys(this.#tagToFile).length == 0) {
            return '';
        }
        return (
            `Tag -> File\n` +
            `-----------\n` +
            `${TagRepo.mappingToString(this.#tagToFile)}\n` +
            `File -> Tag\n` +
            `-----------\n` +
            `${TagRepo.mappingToString(this.#fileToTag)}`
        );
    }
}