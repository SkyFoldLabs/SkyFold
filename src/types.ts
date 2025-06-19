import { AutocompleteInteraction, ButtonInteraction, Channel, ChannelSelectMenuInteraction, ChatInputCommandInteraction, ClientEvents, ContextMenuCommandBuilder as djsContextMenuCommandBuilder, ContextMenuCommandInteraction, GuildMember, Interaction, MentionableSelectMenuInteraction, Message, ModalSubmitInteraction, Role, RoleSelectMenuInteraction, SlashCommandBuilder as djsSlashCommandBuilder, StringSelectMenuInteraction, User, UserSelectMenuInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Client } from '.';

export type EventFile<Event extends keyof ClientEvents> = {
    name: Event;
    once?: boolean;
    code: (client: Client, ...args: ClientEvents[Event]) => void | Promise<void>;
};

export enum InteractionType {
    All = "All",
    Modal = "Modal",
    Button = "Button",
    AutoComplete = "AutoComplete",
    RoleSelectMenu = "RoleSelectMenu",
    UserSelectMenu = "UserSelectMenu",
    StringSelectMenu = "StringSelectMenu",
    ChannelSelectMenu = "ChannelSelectMenu",
    MentionableSelectMenu = "MentionableSelectMenu"
};

export type InteractionCommandData = {
    name?: string;
    type: InteractionType;
};

export class InteractionCommandBuilder<T extends InteractionType = InteractionType.All> {
    public name?: string;
    public type: T = InteractionType.All as T;
    constructor(data?: InteractionCommandData & { type: T }) {
        this.name = data?.name
        this.type = data?.type ?? InteractionType.All as T
    };
    setName(name: string): this {
        this.name = name;
        return this;
    };
    setType<U extends InteractionType>(type: U): InteractionCommandBuilder<U> {
        return new InteractionCommandBuilder<U>({ ...this.toJSON(), type });
    };
    toJSON(){
        const { name, type } = this
        return { name, type }
    }
};

export type InteractionTypeMap = {
    [InteractionType.All]: Interaction;
    [InteractionType.Modal]: ModalSubmitInteraction;
    [InteractionType.Button]: ButtonInteraction;
    [InteractionType.AutoComplete]: AutocompleteInteraction;
    [InteractionType.RoleSelectMenu]: RoleSelectMenuInteraction;
    [InteractionType.UserSelectMenu]: UserSelectMenuInteraction;
    [InteractionType.StringSelectMenu]: StringSelectMenuInteraction;
    [InteractionType.ChannelSelectMenu]: ChannelSelectMenuInteraction;
    [InteractionType.MentionableSelectMenu]: MentionableSelectMenuInteraction;
};

export type InteractionCommandFile<T extends InteractionType> = {
    data: InteractionCommandBuilder<T>;
    code: (ctx: {
        client: Client;
        int: InteractionTypeMap[T];
    }) => Promise<void> | void;
};


export class SlashCommandBuilder extends djsSlashCommandBuilder {
    public guilds?: string[]
    onlyForGuilds(...guilds: string[]){
        this.guilds = guilds
        return this;
    }

    getJSON(){
        return { ...this.toJSON(), guilds: this.guilds };
    };
};

export class ContextMenuCommandBuilder extends djsContextMenuCommandBuilder {
    public guilds?: string[]
    onlyForGuilds(...guilds: string[]){
        this.guilds = guilds;
        return this;
    };

    getJSON(){
        return { ...this.toJSON(), guilds: this.guilds };
    };
};

export type SlashCommandFile = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    code: (ctx: { 
        client: Client;
        int: ChatInputCommandInteraction
    }) => Promise<void> | void ;
};

export enum ParamType {
    String = "string",
    Number = "number",
    User = "user",
    Member = "member",
    Channel = "channel",
    Role = "role"
};

export type ParamTypeMap = {
    [ParamType.String]: string,
    [ParamType.Number]: number,
    [ParamType.User]: User,
    [ParamType.Member]: GuildMember,
    [ParamType.Channel]: Channel,
    [ParamType.Role]: Role
};

export type ParamOptions<Type extends ParamType = ParamType, Required extends boolean = boolean, Rest extends boolean = boolean> = {
    name: string;
    description?: string;
    type: Type;
    rest: Rest;
    required?: Required;
    handler?: (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void;
};

export class ParamBuilder<Type extends ParamType = ParamType, Required extends boolean = boolean, Rest extends boolean = boolean>{
    public name?: string;
    public description?: string;
    public type: Type = ParamType.String as Type;
    public rest: Rest = false as Rest;
    public required?: Required = false as Required;
    public handler?: (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void;

    constructor(data?: ParamOptions & { type: Type; required?: Required; rest: Rest }){
        this.rest = data?.rest ?? false as Rest;
        this.type = data?.type ?? ParamType.String as Type;
        this.name = data?.name;
        this.description = data?.description;
        this.required = data?.required;
        this.handler = data?.handler;
    };

    setName(name: string) {
        this.name = name;
        return this;
    };
    setDescription(description: string) {
        this.description = description;
        return this;
    };
    setRest<R extends boolean>(rest: R) {
        return new ParamBuilder<Type, Required, R>({ ...this.toJSON(), rest });
    };
    setErrorHandler(handler: (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void) {
        this.handler = handler;
        return this;
    };
    setRequired<R extends boolean>(required: R) {
        return new ParamBuilder<Type, R, Rest>({ ...this.toJSON(), required });
    };
    setType<T extends ParamType>(type: T) {
        return new ParamBuilder<T, Required, Rest>({ ...this.toJSON(), type })
    };

    toJSON() {
        const { name, description, type, rest, required, handler } = this;
        return { name, description, type, rest, required, handler } as ParamOptions & { type: Type; required?: Required; rest: Rest };
    };
};

export type  PrefixCommandData = {
    name?: string;
    aliases?: string[];
    description?: string;
    params?: ParamBuilder[];
    alwaysReply?: boolean;
};

export class PrefixedCommandBuilder<Params extends ParamBuilder[] = []> {
    public name?: string;
    public aliases?: string[];
    public description?: string;
    public params?: Params;
    public alwaysReply?: boolean;

    constructor(data: Partial<PrefixCommandData> & { params: Params } = {} as any) {
        this.name = data.name;
        this.aliases = data.aliases;
        this.description = data.description;
        this.params = data.params;
        this.alwaysReply = data.alwaysReply;
    };
    setName(name: string) {
        this.name = name;
        return this;
    };
    setAliases(...aliases: string[]) {
        this.aliases = aliases;
        return this;
    };
    setDescription(description: string) {
        this.description = description;
        return this;
    };
    setParams<P extends ParamBuilder[]>(...params: P) {
        return new PrefixedCommandBuilder<P>({ ...this.toJSON(), params});
    };
    setAlwaysReply(alwaysReply: boolean) {
        this.alwaysReply = alwaysReply;
        return this;
    };
    toJSON(){
        const { name, aliases, description, params, alwaysReply } = this;
        return { name, aliases, description, params, alwaysReply };
    };
};

export type ParamRequired<Type extends ParamType, Req extends boolean> = Req extends true ? ParamTypeMap[Type] : ParamTypeMap[Type] | null;
export type ParamReturnType<Type extends ParamType = ParamType, Required extends boolean = boolean, Rest extends boolean = boolean> = Rest extends true ? ParamRequired<Type, true>[] : ParamRequired<Type, Required>;

export type ExtractParams<T extends readonly ParamBuilder[]> = {
    [K in keyof T]: T[K] extends ParamBuilder<infer Type, infer Required, infer Rest>
    ? ParamReturnType<Type, Required, Rest extends undefined ? false : Rest>
    : never;
};

export type PrefixedCommandFile<T extends ParamBuilder[]> = {
    data: PrefixedCommandBuilder<T>;
    code: (ctx: {
        client: Client;
        msg: Message;
        args: ExtractParams<T>;
    }) => Promise<void> | void;
};

export type ContextMenuCommandFile = {
    data: ContextMenuCommandBuilder;
    code: (ctx: {
        client: Client;
        int: ContextMenuCommandInteraction;
    }) => Promise<void> | void;
};

export function createEvent<Event extends keyof ClientEvents>(data: EventFile<Event>): EventFile<Event> { return data; };

export function createCommand<T extends InteractionType>(input: InteractionCommandFile<T>): InteractionCommandFile<T>;
export function createCommand<T extends ParamBuilder[]>(input: PrefixedCommandFile<T>): PrefixedCommandFile<T>;
export function createCommand(input: SlashCommandFile): SlashCommandFile;
export function createCommand(input: ContextMenuCommandFile): ContextMenuCommandFile;
export function createCommand(input: any): any {
    return input;
};

export type InteractionCommandFileRaw = { type: "interaction" } & InteractionCommandFile<InteractionType>;
export type PrefixCommandFileRaw = { type: "prefix" } & PrefixedCommandFile<ParamBuilder[]>;
export type SlashCommandFileRaw = { type: "slash" } & SlashCommandFile;
export type ContextCommandFileRaw = { type: "context" } & ContextMenuCommandFile;
export type UnknownCommandFileRaw = { type: "unknown"; [key: string]: unknown };
export type CommandFileRaw = InteractionCommandFileRaw | PrefixCommandFileRaw | SlashCommandFileRaw | ContextCommandFileRaw | UnknownCommandFileRaw;

export type CommandFile = typeof createCommand | typeof createCommand[];