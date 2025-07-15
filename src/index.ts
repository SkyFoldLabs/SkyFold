import * as d from "discord.js";
import { CommandFileRaw, ContextMenuCommandBuilder, createCommand, InteractionCommandBuilder, PrefixedCommandBuilder, SlashCommandBuilder } from './types'
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { InteractionsCommandsHandler, PrefixCommandsHandler, putSlashes, SlashCommandsHandler } from "./handlers";

export type ClientOptions = d.ClientOptions  & {
    prefixes?: string[];
    customHandlers?: {
        prefix?: (client: Client, msg: d.Message) => Promise<void> | void;
        slash?: (client: Client, int: d.ChatInputCommandInteraction) => Promise<void> | void;
        interactions?: (client: Client, int: d.Interaction) => Promise<void> | void;
    };
};

export class Client extends d.Client<true> {
    public commands = new d.Collection<string, CommandFileRaw>();
    public logger = {
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

    noop(...args: any[]){ return null; }

    constructor(public config: ClientOptions){
        super(config);
    };

    private handlers(){
        const { prefix, slash, interactions } = {
            prefix: this.config.customHandlers?.prefix ?? PrefixCommandsHandler,
            slash: this.config.customHandlers?.slash ?? SlashCommandsHandler,
            interactions: this.config.customHandlers?.interactions ?? InteractionsCommandsHandler,
        }
        this.on("messageCreate", (msg) => prefix(this, msg));
        this.on("interactionCreate", (int) => { if(int.isChatInputCommand()) slash(this, int) });
        this.on("interactionCreate", (int) => interactions(this, int));
        this.once("ready", () => putSlashes(this))
    }

    public async eventLoader(...dir: string[]){
        const eventNames = new Set<keyof d.ClientEvents>();
        const events: { name: keyof d.ClientEvents, code: any }[] = [];
        this.removeAllListeners();
        this.handlers()

        this.loader((event) =>  {
            if(event.once) return this.once(event.name, (...args: any) => event.code(this, ...args));
            const { name, code } = event;
            eventNames.add(name);
            events.push({name, code});
        }, ...dir);

        for(const name of eventNames){
            const codes = events.filter(s => s.name == name);
            this.on(name, (...args: any) => {
                for(const event of codes){
                    event.code(this, ...args);
                };
            });
        };
    };

    public async commandLoader(...dir: string[]){
        this.commands.clear();

        this.loader((data: ReturnType<typeof createCommand> | ReturnType<typeof createCommand>[], path) => {
            data = Array.isArray(data) ? data : [data];
            let i = 0;
            for(const command of data){
                const { data, code } = command
                let type: "prefix" | "slash" | "interaction" | "context" | "unknown" | null = null;
                if(data instanceof PrefixedCommandBuilder) type = "prefix";
                else if(data instanceof SlashCommandBuilder) type = "slash";
                else if(data instanceof InteractionCommandBuilder) type = "interaction";
                else if(data instanceof ContextMenuCommandBuilder) type = "context";
                else type = "unknown";
                this.commands.set(`${path}(${i})`, {data, code, type} as any); i++;
            };
        }, ...dir);
    };

    private loader(code: (data: any, path?:string) => Promise<any> | any, ...dir: string[]) {
        const files = readdirSync(join(...dir));
        for (const file of files){
            try {
            
                const stat = lstatSync(join(...dir, file));
                
                if(stat.isDirectory()) this.loader(code, join(...dir, file));
            else if(this.isValidFile(file)){
                    delete require.cache[require.resolve(join(...dir, file))];
                    code(require(join(...dir, file)).data, join(...dir, file));
            };
            } catch(_){ this.logger.warn("Failed to load", join(...dir, file)) }
        };
    };

    private isValidFile = (file: string) => file.endsWith('.js');
}

export * from './handlers';
export * from './types';