import * as d from "discord.js";
import { CommandFileRaw } from './types';
export type ClientOptions = d.ClientOptions & {
    prefixes?: string[];
    customHandlers?: {
        prefix?: (client: Client, msg: d.Message) => Promise<void> | void;
        slash?: (client: Client, int: d.ChatInputCommandInteraction) => Promise<void> | void;
        interactions?: (client: Client, int: d.Interaction) => Promise<void> | void;
    };
};
export declare class Client extends d.Client<true> {
    config: ClientOptions;
    commands: d.Collection<string, CommandFileRaw>;
    logger: {
        info: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        warn: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        error: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
        debug: {
            (...data: any[]): void;
            (message?: any, ...optionalParams: any[]): void;
        };
    };
    noop(...args: any[]): null;
    constructor(config: ClientOptions);
    private handlers;
    eventLoader(...dir: string[]): Promise<void>;
    commandLoader(...dir: string[]): Promise<void>;
    private loader;
    private isValidFile;
}
export * from './handlers';
export * from './types';
