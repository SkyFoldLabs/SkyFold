"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixCommandsHandler = PrefixCommandsHandler;
exports.fetchMember = fetchMember;
exports.fetchUser = fetchUser;
exports.fetchChannel = fetchChannel;
exports.fetchRole = fetchRole;
exports.InteractionsCommandsHandler = InteractionsCommandsHandler;
exports.SlashCommandsHandler = SlashCommandsHandler;
exports.putSlashes = putSlashes;
const discord_js_1 = require("discord.js");
const types_1 = require("./types");
async function runCommand(data) {
    const { client, msg, rawArgs } = data;
    for (const cmd of data.commands.values()) {
        if (!(await cmd.data.preRun(client, msg)))
            continue;
        const { params } = cmd.data;
        const args = [];
        if (params) {
            for (const param of params) {
                const { type, handler, required, rest } = param;
                switch (type) {
                    case types_1.ParamType.String:
                        const str = rest ? rawArgs.splice(0, rawArgs.length) : rawArgs.shift();
                        if (required && str && str.length > 0)
                            args.push(str);
                        else if (required)
                            return handler?.(client, msg, "missing");
                        else
                            args.push(str);
                        break;
                    case types_1.ParamType.Number:
                        let dataN = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let numbers = [];
                        for (const n of dataN) {
                            const num = Number(n);
                            if (required && !n)
                                return handler?.(client, msg, "missing");
                            else if (!n && !required)
                                numbers.push(undefined);
                            else if (!isNaN(num))
                                numbers.push(num);
                            else
                                return handler?.(client, msg, "wrongType");
                        }
                        if (rest && required && numbers.length == 0)
                            return handler?.(client, msg, "missing");
                        else
                            args.push(rest ? numbers : numbers[0]);
                        break;
                    case types_1.ParamType.User:
                        let dataU = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let users = [];
                        for (const m of dataU) {
                            if (!m && !required)
                                users.push(undefined);
                            else {
                                if (!msg.guild)
                                    return handler?.(client, msg, "wrongType");
                                const user = await fetchUser(client, m);
                                if (!user)
                                    return handler?.(client, msg, "wrongType");
                                users.push(user);
                            }
                        }
                        if (rest && required && users.length == 0)
                            return handler?.(client, msg, "missing");
                        else
                            args.push(rest ? users : users[0]);
                        break;
                    case types_1.ParamType.Member:
                        let dataM = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let members = [];
                        for (const m of dataM) {
                            if (!m && !required)
                                members.push(undefined);
                            else {
                                if (!msg.guild)
                                    return handler?.(client, msg, "wrongType");
                                const member = await fetchMember(msg.guild, m);
                                if (!member)
                                    return handler?.(client, msg, "wrongType");
                                members.push(member);
                            }
                        }
                        if (rest && required && members.length == 0)
                            return handler?.(client, msg, "missing");
                        else
                            args.push(rest ? members : members[0]);
                        break;
                    case types_1.ParamType.Channel:
                        let dataC = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let channels = [];
                        for (const c of dataC) {
                            if (!c && !required)
                                channels.push(undefined);
                            else {
                                if (!msg.guild)
                                    return handler?.(client, msg, "wrongType");
                                const channel = await fetchChannel(msg.guild, c);
                                if (!channel)
                                    return handler?.(client, msg, "wrongType");
                                channels.push(channel);
                            }
                        }
                        if (rest && required && channels.length == 0)
                            return handler?.(client, msg, "missing");
                        else
                            args.push(rest ? channels : channels[0]);
                        break;
                    case types_1.ParamType.Role:
                        let dataR = rest ? rawArgs.splice(0, rawArgs.length) : [rawArgs.shift()];
                        let roles = [];
                        for (const r of dataR) {
                            if (!r && !required)
                                roles.push(undefined);
                            else {
                                if (!msg.guild)
                                    return handler?.(client, msg, "wrongType");
                                const role = await fetchChannel(msg.guild, r);
                                if (!role)
                                    return handler?.(client, msg, "wrongType");
                                roles.push(role);
                            }
                        }
                        if (rest && required && roles.length == 0)
                            return handler?.(client, msg, "missing");
                        else
                            args.push(rest ? roles : roles[0]);
                        break;
                }
                ;
            }
            ;
        }
        ;
        cmd.code({ client, msg, args });
    }
}
;
async function PrefixCommandsHandler(client, msg) {
    if (msg.author.bot)
        return;
    const rawArgs = msg.content.trim().split(/ +/);
    runCommand({ commands: client.commands.filter(s => s.type == 'prefix' && s.data.alwaysReply), client, msg, rawArgs });
    let data = rawArgs.shift()?.toLowerCase();
    const prefixUsed = client.config.prefixes?.find(s => data?.startsWith(s.toLowerCase()));
    if (!data || !prefixUsed || prefixUsed.length == 0)
        return;
    data = data.slice(prefixUsed.length);
    const commands = client.commands.filter(s => s.type == 'prefix' && (s.data.name == data || s.data.aliases?.includes(data)));
    runCommand({ commands, client, msg, rawArgs });
}
;
async function fetchMember(guild, identifier) {
    if (!identifier)
        return null;
    let userId;
    if (identifier.startsWith('<@') && identifier.endsWith('>'))
        userId = identifier.slice(2, -1).replace('!', '');
    else if (/^\d{17,19}$/.test(identifier))
        userId = identifier;
    let member = (userId && guild.members.cache.get(userId)) || guild.members.cache.find(m => m.user.username === identifier || m.user.displayName === identifier || m.nickname === identifier);
    if (member)
        return member;
    try {
        if (userId)
            member = await guild.members.fetch(userId);
        else
            member = guild.members.cache.find(m => m.user.username === identifier || m.user.displayName === identifier || m.nickname === identifier);
    }
    catch {
        return null;
    }
    return member || null;
}
;
async function fetchUser(client, identifier) {
    if (!identifier)
        return null;
    let userId;
    if (identifier.startsWith('<@') && identifier.endsWith('>'))
        userId = identifier.slice(2, -1).replace('!', '');
    else if (/^\d{17,19}$/.test(identifier))
        userId = identifier;
    let user = (userId && client.users.cache.get(userId)) || client.users.cache.find(user => user.username === identifier || user.displayName === identifier);
    if (user)
        return user;
    try {
        if (userId)
            user = await client.users.fetch(userId);
    }
    catch {
        return null;
    }
    return user || null;
}
;
async function fetchChannel(guild, identifier) {
    if (!identifier)
        return null;
    let channelId;
    if (identifier.startsWith('<#') && identifier.endsWith('>'))
        channelId = identifier.slice(2, -1);
    else if (/^\d{17,19}$/.test(identifier))
        channelId = identifier;
    let channel = (channelId && guild.channels.cache.get(channelId)) || guild.channels.cache.find(c => c.name === identifier) || null;
    if (channel)
        return channel;
    try {
        if (channelId)
            channel = await guild.channels.fetch(channelId);
        else {
            channel = guild.channels.cache.find(c => c?.name === identifier) || null;
        }
    }
    catch {
        return null;
    }
    ;
    return channel;
}
;
async function fetchRole(guild, identifier) {
    if (!identifier)
        return null;
    let roleId;
    if (identifier.startsWith('<@&') && identifier.endsWith('>'))
        roleId = identifier.slice(3, -1);
    else if (/^\d{17,19}$/.test(identifier))
        roleId = identifier;
    let role = (roleId && guild.roles.cache.get(roleId)) || guild.roles.cache.find(c => c.name === identifier) || null;
    if (role)
        return role;
    try {
        if (roleId)
            role = await guild.roles.fetch(roleId);
        else {
            role = guild.roles.cache.find(c => c?.name === identifier) || null;
        }
    }
    catch {
        return null;
    }
    ;
    return role;
}
;
async function InteractionsCommandsHandler(client, int) {
    const filter = (condition) => client.commands.filter(s => s.type == 'interaction' && condition(s));
    for (const cmd of filter(s => s.data.type == types_1.InteractionType.All).values()) {
        cmd.code({ client, int });
    }
    if (int.isButton()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.Button && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    if (int.isModalSubmit()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.Modal && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isAutocomplete()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.AutoComplete && ((s.data.name && s.data.name == int.commandName) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isRoleSelectMenu()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.RoleSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isUserSelectMenu()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.UserSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isStringSelectMenu()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.StringSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isChannelSelectMenu()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.ChannelSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isMentionableSelectMenu()) {
        for (const cmd of filter(s => s.data.type == types_1.InteractionType.MentionableSelectMenu && ((s.data.name && s.data.name == int.customId) || !s.data.name)).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
    if (int.isContextMenuCommand()) {
        for (const cmd of client.commands.filter(s => s.type == "context" && s.data.name == int.commandName).values()) {
            cmd.code({ client, int });
        }
        ;
    }
    ;
}
;
async function SlashCommandsHandler(client, int) {
    const commands = client.commands.filter(s => s.type == "slash" && s.data.name == int.commandName);
    for (const command of commands.values()) {
        command.code({ client, int });
    }
}
;
async function putSlashes(client) {
    const commands = client.commands.filter(s => s.type == "slash" || s.type == "context");
    const globalCmds = [];
    const guildCmds = [];
    for (const cmd of commands.values()) {
        const data = cmd.data.getJSON();
        if (!data.guilds)
            globalCmds.push(data);
        else {
            for (const guild of data.guilds) {
                guildCmds.find(s => s.guild == guild)?.data.push(data)
                    || guildCmds.push({ guild, data: [data] });
            }
            ;
        }
        ;
    }
    ;
    const rest = new discord_js_1.REST().setToken(client.token);
    if (globalCmds.length > 0) {
        await rest.put(discord_js_1.Routes.applicationCommands(client.user.id), { body: globalCmds });
    }
    ;
    if (guildCmds.length > 0) {
        for (const guildData of guildCmds) {
            const { data, guild } = guildData;
            await rest.put(discord_js_1.Routes.applicationGuildCommands(client.user.id, guild), { body: data });
        }
        ;
    }
    ;
}
;
