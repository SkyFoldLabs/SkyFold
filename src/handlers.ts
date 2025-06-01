import { ChatInputCommandInteraction, Collection, Guild, GuildBasedChannel, GuildMember, Interaction, Message, REST, Role, Routes, User } from "discord.js";
import { Client } from ".";
import { ContextCommandFileRaw, ContextMenuCommandBuilder, InteractionCommandFileRaw, InteractionType, ParamType, PrefixCommandFileRaw, SlashCommandBuilder, SlashCommandFileRaw } from "./types";


async function runCommand(data: { commands: Collection<string, PrefixCommandFileRaw>; client: Client; msg: Message; rawArgs: string[]; }){
    const { client, msg, rawArgs } = data
    for(const cmd of data.commands.values()){
        const { params } = cmd.data;
        const args: any[] = [];
        if(params){
            for(const param of params){
                const { type, handler, required, rest } = param;
                switch(type){
                    case ParamType.String:
                        const str = rest ? rawArgs.splice(0, rawArgs.length) : rawArgs.shift();
                        if(required && str && str.length > 0) args.push(str);
                        else if(required) return handler?.(client, msg, "missing");
                        else args.push(str);
                    break;
                    case ParamType.Number:
                        let dataN = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let numbers: (number | undefined)[] = [];
                        for(const n of dataN){
                            const num = Number(n);
                            if(required && !n) return handler?.(client, msg, "missing");
                            else if(!n && !required) numbers.push(undefined);
                            else if(!isNaN(num)) numbers.push(num);
                            else return handler?.(client, msg, "wrongType");
                        }
                        if(rest && required && numbers.length == 0) return handler?.(client, msg, "missing");
                        else args.push(rest ? numbers : numbers[0]);
                    break;
                    case ParamType.User:
                        let dataU = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let users: (User | undefined)[] = [];
                        for(const m of dataU){
                            if(!m && !required) users.push(undefined)
                            else {
                                if(!msg.guild) return handler?.(client, msg, "wrongType");
                                const user = await fetchUser(client, m);
                                if(!user) return handler?.(client, msg, "wrongType");
                                users.push(user)
                            }
                        }
                        if(rest && required && users.length == 0) return handler?.(client, msg, "missing");
                        else args.push(rest ? users : users[0]);
                    break;
                    case ParamType.Member:
                        let dataM = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let members: (GuildMember | undefined)[] = [];
                        for(const m of dataM){
                            if(!m && !required) members.push(undefined)
                            else {
                                if(!msg.guild) return handler?.(client, msg, "wrongType");
                                const member = await fetchMember(msg.guild, m);
                                if(!member) return handler?.(client, msg, "wrongType");
                                members.push(member)
                            }
                        }
                        if(rest && required && members.length == 0) return handler?.(client, msg, "missing");
                        else args.push(rest ? members : members[0]);
                    break;
                    case ParamType.Channel:
                        let dataC = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let channels: (GuildBasedChannel | undefined)[] = [];
                        for(const c of dataC){
                            if(!c && !required) channels.push(undefined)
                            else {
                                if(!msg.guild) return handler?.(client, msg, "wrongType");
                                const channel = await fetchChannel(msg.guild, c);
                                if(!channel) return handler?.(client, msg, "wrongType");
                                channels.push(channel)
                            }
                        }
                        if(rest && required && channels.length == 0) return handler?.(client, msg, "missing");
                        else args.push(rest ? channels : channels[0]);
                    break;
                    case ParamType.Role:
                        let dataR = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let roles: (GuildBasedChannel | undefined)[] = [];
                        for(const r of dataR){
                            if(!r && !required) roles.push(undefined)
                            else {
                                if(!msg.guild) return handler?.(client, msg, "wrongType");
                                const role = await fetchChannel(msg.guild, r);
                                if(!role) return handler?.(client, msg, "wrongType");
                                roles.push(role)
                            }
                        }
                        if(rest && required && roles.length == 0) return handler?.(client, msg, "missing");
                        else args.push(rest ? roles : roles[0]);
                    break;
                };
            };
        };
        cmd.code({client, msg, args});
    }
};

export async function PrefixCommandsHandler(client: Client, msg: Message){
    if(msg.author.bot) return;
    const rawArgs = msg.content.trim().split(/ +/);
    runCommand({ commands: client.commands.filter(s => s.type =='prefix' && s.data.alwaysReply) as Collection<string, PrefixCommandFileRaw>, client, msg, rawArgs })
    let data = rawArgs.shift()?.toLowerCase();
    const prefixUsed = client.config.prefixes?.find(s => data?.startsWith(s.toLowerCase()));
    if(!data || !prefixUsed || prefixUsed.length == 0) return;
    data = data.slice(prefixUsed.length);
    const commands = client.commands.filter(s => s.type =='prefix' && (s.data.name == data || s.data.aliases?.includes(data))) as Collection<string, PrefixCommandFileRaw>
    runCommand({ commands, client, msg, rawArgs })
};


export async function fetchMember(guild: Guild, identifier?: string): Promise<GuildMember | null> {
    if (!identifier) return null;
    let userId: string | undefined;

    if (identifier.startsWith('<@') && identifier.endsWith('>')) userId = identifier.slice(2, -1).replace('!', '');
    else if (/^\d{17,19}$/.test(identifier)) userId = identifier;

    let member = (userId && guild.members.cache.get(userId)) || guild.members.cache.find(m => m.user.username === identifier || m.user.displayName === identifier ||  m.nickname === identifier);
    if (member) return member;
    try {
        if (userId) member = await guild.members.fetch(userId);
        else member = guild.members.cache.find(m => m.user.username === identifier || m.user.displayName === identifier || m.nickname === identifier);
    } catch {
        return null;
    }
    return member || null;
};


export async function fetchUser(client: Client, identifier?: string): Promise<User | null> {
    if (!identifier) return null;
    let userId: string | undefined;

    if (identifier.startsWith('<@') && identifier.endsWith('>')) userId = identifier.slice(2, -1).replace('!', '');
    else if (/^\d{17,19}$/.test(identifier)) userId = identifier;

    let user = (userId && client.users.cache.get(userId)) || client.users.cache.find(user => user.username === identifier || user.displayName === identifier);
    if (user) return user;
    try {
        if (userId) user = await client.users.fetch(userId);
    } catch {
        return null;
    }
    return user || null;
};


export async function fetchChannel(guild: Guild, identifier?: string): Promise<GuildBasedChannel | null> {
    if (!identifier) return null;

    let channelId: string | undefined;

    if (identifier.startsWith('<#') && identifier.endsWith('>')) channelId = identifier.slice(2, -1);
    else if (/^\d{17,19}$/.test(identifier)) channelId = identifier;

    let channel = (channelId && guild.channels.cache.get(channelId)) || guild.channels.cache.find(c => c.name === identifier) || null;

    if (channel) return channel;
    try {
        if (channelId) channel = await guild.channels.fetch(channelId);
        else {
            channel = guild.channels.cache.find(c => c?.name === identifier) || null;
        }
    } catch { return null; };
    return channel;
};

export async function fetchRole(guild: Guild, identifier?: string): Promise<Role | null> {
    if (!identifier) return null;

    let roleId: string | undefined;

    if (identifier.startsWith('<@&') && identifier.endsWith('>')) roleId = identifier.slice(3, -1);
    else if (/^\d{17,19}$/.test(identifier)) roleId = identifier;

    let role = (roleId && guild.roles.cache.get(roleId)) || guild.roles.cache.find(c => c.name === identifier) || null;

    if (role) return role;
    try {
        if (roleId) role = await guild.roles.fetch(roleId);
        else {
            role = guild.roles.cache.find(c => c?.name === identifier) || null;
        }
    } catch { return null; };
    return role;
};

export async function InteractionsCommandsHandler(client: Client, int: Interaction) {
    const filter = (condition: (c: InteractionCommandFileRaw) => boolean) => client.commands.filter(s => s.type == 'interaction' && condition(s)) as Collection<string, InteractionCommandFileRaw>
    for(const cmd of filter(s => s.data.type == InteractionType.All).values()){
        cmd.code({client, int})
    }
    if(int.isButton()){ 
        for(const cmd of filter(s => s.data.type == InteractionType.Button && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    }
    if(int.isModalSubmit()){
        for(const cmd of filter(s => s.data.type == InteractionType.Modal && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isAutocomplete()){
        for(const cmd of filter(s => s.data.type == InteractionType.AutoComplete && ((s.data.name && s.data.name == int.commandName) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isRoleSelectMenu()){
        for(const cmd of filter(s => s.data.type == InteractionType.RoleSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isUserSelectMenu()){
        for(const cmd of filter(s => s.data.type == InteractionType.UserSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isStringSelectMenu()){
        for(const cmd of filter(s => s.data.type == InteractionType.StringSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isChannelSelectMenu()){
        for(const cmd of filter(s => s.data.type == InteractionType.ChannelSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isMentionableSelectMenu()){
        for(const cmd of filter(s => s.data.type == InteractionType.MentionableSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()){
            cmd.code({client, int});
        };
    };
    if(int.isContextMenuCommand()){
        for(const cmd of (client.commands.filter(s => s.type == "context" && s.data.name == int.commandName) as Collection<string, ContextCommandFileRaw>).values()){
            cmd.code({client, int});
        };
    };
};

export async function SlashCommandsHandler(client: Client, int: ChatInputCommandInteraction){
    const commands = client.commands.filter(s => s.type == "slash" && s.data.name == int.commandName) as Collection<string, SlashCommandFileRaw>
    for(const command of commands.values()){
        command.code({client, int})
    }
};

export async function putSlashes(client: Client) {
    const commands = client.commands.filter(s => s.type == "slash" || s.type == "context");
    const globalCmds: (ReturnType<SlashCommandBuilder['getJSON']> | ReturnType<ContextMenuCommandBuilder['getJSON']>)[] = [];
    const guildCmds: { guild: string; data: (ReturnType<SlashCommandBuilder['getJSON']> | ReturnType<ContextMenuCommandBuilder['getJSON']>)[] }[] = [];
    for(const cmd of commands.values()){
        const data = cmd.data.getJSON();
        if(!data.guilds) globalCmds.push(data);
        else {
            for(const guild of data.guilds){
                guildCmds.find(s => s.guild == guild)?.data.push(data)
                || guildCmds.push({guild, data: [data]});
            };
        };
    };
    const rest = new REST().setToken(client.token);
    if(globalCmds.length > 0){ 
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: globalCmds }
        );
    };
    if(guildCmds.length > 0){
        for(const guildData of guildCmds){
            const { data, guild } = guildData;
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guild),
                { body: data }
            );
        };
    };
};