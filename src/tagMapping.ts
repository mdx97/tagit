export type TagMapping = Record<string, Array<string>>;

export const tagMappingToString = (mapping: TagMapping): string => {
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