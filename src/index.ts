import { Client as DjsClient, Collection, ClientOptions as DjsClientOptions, ClientEvents, Message, ChatInputCommandInteraction, Interaction } from "discord.js";
import { CommandFileRaw, ContextMenuCommandBuilder, createCommand, createEvent, InteractionCommandBuilder, PrefixedCommandBuilder, SlashCommandBuilder } from './types'
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { InteractionsCommandsHandler, PrefixCommandsHandler, putSlashes, SlashCommandsHandler } from "./handlers";
import { cwd } from "process";

type ClientOptions = DjsClientOptions  & {
    prefixes?: string[];
    customHandlers?: {
        prefix?: (client: Client, msg: Message) => Promise<void> | void;
        slash?: (client: Client, int: ChatInputCommandInteraction) => Promise<void> | void;
        interactions?: (client: Client, int: Interaction) => Promise<void> | void;
    };
};

class Client extends DjsClient<true> {
    public commands = new Collection<string, CommandFileRaw>();

    constructor(public config: ClientOptions){
        super(config);
        const { prefix, slash, interactions } = {
            prefix: config.customHandlers?.prefix ?? PrefixCommandsHandler,
            slash: config.customHandlers?.slash ?? SlashCommandsHandler,
            interactions: config.customHandlers?.interactions ?? InteractionsCommandsHandler,
        }
        this.on("messageCreate", (msg) => prefix(this, msg));
        this.on("interactionCreate", (int) => { if(int.isChatInputCommand()) slash(this, int) });
        this.on("interactionCreate", (int) => interactions(this, int));
        this.on("ready", () => putSlashes(this))
    };

    public async eventLoader(dir:string){
        const eventNames = new Set<keyof ClientEvents>();
        const events: { name: keyof ClientEvents, code: any }[] = [];
        this.removeAllListeners();

        this.loader(dir, (event) =>  {
            if(event.once) return this.once(event.name, (...args: any) => event.code(this, ...args));
            const { name, code } = event;
            eventNames.add(name);
            events.push({name, code});
        });

        for(const name of eventNames){
            const codes = events.filter(s => s.name == name);
            this.on(name, (...args: any) => {
                for(const event of codes){
                    event.code(this, ...args);
                };
            });
        };
    };

    public async commandLoader(dir:string){
        this.commands.clear();

        this.loader(dir, (data: ReturnType<typeof createCommand> | ReturnType<typeof createCommand>[], path) => {
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
        });
    };

    private loader(dir: string, code: (data: any, path?:string) => Promise<any> | any) {
        const root = cwd(),
        files = readdirSync(join(root, dir));
        for (const file of files){
            const stat = lstatSync(join(root, dir, file));
            
            if(stat.isDirectory()) this.loader(join(dir, file), code);
            else if(this.isValidFile(file)){
                delete require.cache[require.resolve(join(root, dir, file))];
                code(require(join(root, dir, file)).data, join(root, dir, file));
            };
        };
    };

    private isValidFile = (file: string) => file.endsWith('.js');

    public static AntiCrash(){
        process.on('uncaughtException', (err) => {
            console.error('An uncaught exception occurred:', err);
        });

        process.on('unhandledRejection', (reason) => {
            console.error('An unhandled promise rejection occurred:', reason);
        });
    };
};

export { createCommand, createEvent, Client, PrefixedCommandBuilder, InteractionCommandBuilder, ContextMenuCommandBuilder, SlashCommandBuilder, ClientOptions };