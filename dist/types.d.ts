import { AutocompleteInteraction, ButtonInteraction, Channel, ChannelSelectMenuInteraction, ChatInputCommandInteraction, ClientEvents, ContextMenuCommandBuilder as djsContextMenuCommandBuilder, ContextMenuCommandInteraction, GuildMember, Interaction, MentionableSelectMenuInteraction, Message, ModalSubmitInteraction, Role, RoleSelectMenuInteraction, SlashCommandBuilder as djsSlashCommandBuilder, StringSelectMenuInteraction, User, UserSelectMenuInteraction, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Client } from '.';
export type EventFile<Event extends keyof ClientEvents> = {
    name: Event;
    once?: boolean;
    code: (client: Client, ...args: ClientEvents[Event]) => void | Promise<void>;
};
export declare enum InteractionType {
    All = "All",
    Modal = "Modal",
    Button = "Button",
    AutoComplete = "AutoComplete",
    RoleSelectMenu = "RoleSelectMenu",
    UserSelectMenu = "UserSelectMenu",
    StringSelectMenu = "StringSelectMenu",
    ChannelSelectMenu = "ChannelSelectMenu",
    MentionableSelectMenu = "MentionableSelectMenu"
}
export type InteractionCommandData = {
    name?: string;
    type: InteractionType;
};
export declare class InteractionCommandBuilder<T extends InteractionType = InteractionType.All> {
    name?: string;
    type: T;
    constructor(data?: InteractionCommandData & {
        type: T;
    });
    setName(name: string): this;
    setType<U extends InteractionType>(type: U): InteractionCommandBuilder<U>;
    toJSON(): {
        name: string | undefined;
        type: T;
    };
}
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
export declare class SlashCommandBuilder extends djsSlashCommandBuilder {
    guilds?: string[];
    onlyForGuilds(...guilds: string[]): this;
    getJSON(): {
        guilds: string[] | undefined;
        type?: import("discord.js").ApplicationCommandType.ChatInput | undefined;
        description: string;
        name: string;
        name_localizations?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Record<import("discord.js").Locale, string | null>> | null | undefined>;
        description_localizations?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Record<import("discord.js").Locale, string | null>> | null | undefined>;
        options?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").APIApplicationCommandOption[] | undefined>;
        dm_permission?: boolean | undefined;
        default_permission?: boolean | undefined;
        nsfw?: boolean | undefined;
        handler?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").EntryPointCommandHandlerType | undefined>;
        contexts?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").InteractionContextType[] | undefined>;
        default_member_permissions?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<string | null | undefined>;
        integration_types?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").ApplicationIntegrationType[] | undefined>;
    };
}
export declare class ContextMenuCommandBuilder extends djsContextMenuCommandBuilder {
    guilds?: string[];
    onlyForGuilds(...guilds: string[]): this;
    getJSON(): {
        guilds: string[] | undefined;
        type: import("discord.js").ApplicationCommandType.Message | import("discord.js").ApplicationCommandType.User;
        name: string;
        name_localizations?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Record<import("discord.js").Locale, string | null>> | null | undefined>;
        description_localizations?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<Partial<Record<import("discord.js").Locale, string | null>> | null | undefined>;
        options?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").APIApplicationCommandOption[] | undefined>;
        dm_permission?: boolean | undefined;
        default_permission?: boolean | undefined;
        nsfw?: boolean | undefined;
        handler?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").EntryPointCommandHandlerType | undefined>;
        contexts?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").InteractionContextType[] | undefined>;
        default_member_permissions?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<string | null | undefined>;
        integration_types?: import("discord.js")._AddUndefinedToPossiblyUndefinedPropertiesOfInterface<import("discord.js").ApplicationIntegrationType[] | undefined>;
    };
}
export type SlashCommandFile = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    code: (ctx: {
        client: Client;
        int: ChatInputCommandInteraction;
    }) => Promise<void> | void;
};
export declare enum ParamType {
    String = "string",
    Number = "number",
    User = "user",
    Member = "member",
    Channel = "channel",
    Role = "role"
}
export type ParamTypeMap = {
    [ParamType.String]: string;
    [ParamType.Number]: number;
    [ParamType.User]: User;
    [ParamType.Member]: GuildMember;
    [ParamType.Channel]: Channel;
    [ParamType.Role]: Role;
};
export type ParamOptions<Type extends ParamType = ParamType, Required extends boolean = boolean, Rest extends boolean = boolean> = {
    name: string;
    description?: string;
    type: Type;
    rest: Rest;
    required?: Required;
    handler?: (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void;
};
export declare class ParamBuilder<Type extends ParamType = ParamType, Required extends boolean = boolean, Rest extends boolean = boolean> {
    name?: string;
    description?: string;
    type: Type;
    rest: Rest;
    required?: Required;
    handler?: (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void;
    constructor(data?: ParamOptions & {
        type: Type;
        required?: Required;
        rest: Rest;
    });
    setName(name: string): this;
    setDescription(description: string): this;
    setRest<R extends boolean>(rest: R): ParamBuilder<Type, Required, R>;
    setErrorHandler(handler: (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void): this;
    setRequired<R extends boolean>(required: R): ParamBuilder<Type, R, Rest>;
    setType<T extends ParamType>(type: T): ParamBuilder<T, Required, Rest>;
    toJSON(): ParamOptions & {
        type: Type;
        required?: Required;
        rest: Rest;
    };
}
export type PrefixCommandData = {
    name?: string;
    aliases?: string[];
    description?: string;
    params?: ParamBuilder[];
    alwaysReply?: boolean;
};
export declare class PrefixedCommandBuilder<Params extends ParamBuilder[] = []> {
    name?: string;
    aliases?: string[];
    description?: string;
    params?: Params;
    alwaysReply?: boolean;
    preRun: (client: Client, msg: Message) => Promise<boolean> | boolean;
    constructor(data?: Partial<PrefixCommandData> & {
        params: Params;
    });
    setName(name: string): this;
    setAliases(...aliases: string[]): this;
    setDescription(description: string): this;
    setParams<P extends ParamBuilder[]>(...params: P): PrefixedCommandBuilder<P>;
    setAlwaysReply(alwaysReply: boolean): this;
    toJSON(): {
        name: string | undefined;
        aliases: string[] | undefined;
        description: string | undefined;
        params: Params | undefined;
        alwaysReply: boolean | undefined;
    };
    validateCmd(handler: (client: Client, msg: Message) => Promise<boolean> | boolean): this;
}
export type ParamRequired<Type extends ParamType, Req extends boolean> = Req extends true ? ParamTypeMap[Type] : ParamTypeMap[Type] | null;
export type ParamReturnType<Type extends ParamType = ParamType, Required extends boolean = boolean, Rest extends boolean = boolean> = Rest extends true ? ParamRequired<Type, true>[] : ParamRequired<Type, Required>;
export type ExtractParams<T extends readonly ParamBuilder[]> = {
    [K in keyof T]: T[K] extends ParamBuilder<infer Type, infer Required, infer Rest> ? ParamReturnType<Type, Required, Rest extends undefined ? false : Rest> : never;
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
export declare function createEvent<Event extends keyof ClientEvents>(data: EventFile<Event>): EventFile<Event>;
export declare function createCommand<T extends InteractionType>(input: InteractionCommandFile<T>): InteractionCommandFile<T>;
export declare function createCommand<T extends ParamBuilder[]>(input: PrefixedCommandFile<T>): PrefixedCommandFile<T>;
export declare function createCommand(input: SlashCommandFile): SlashCommandFile;
export declare function createCommand(input: ContextMenuCommandFile): ContextMenuCommandFile;
export type InteractionCommandFileRaw = {
    type: "interaction";
} & InteractionCommandFile<InteractionType>;
export type PrefixCommandFileRaw = {
    type: "prefix";
} & PrefixedCommandFile<ParamBuilder[]>;
export type SlashCommandFileRaw = {
    type: "slash";
} & SlashCommandFile;
export type ContextCommandFileRaw = {
    type: "context";
} & ContextMenuCommandFile;
export type UnknownCommandFileRaw = {
    type: "unknown";
    [key: string]: unknown;
};
export type CommandFileRaw = InteractionCommandFileRaw | PrefixCommandFileRaw | SlashCommandFileRaw | ContextCommandFileRaw | UnknownCommandFileRaw;
export type CommandFile = typeof createCommand | typeof createCommand[];
