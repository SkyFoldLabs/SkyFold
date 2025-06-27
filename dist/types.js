"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixedCommandBuilder = exports.ParamBuilder = exports.ParamType = exports.ContextMenuCommandBuilder = exports.SlashCommandBuilder = exports.InteractionCommandBuilder = exports.InteractionType = void 0;
exports.createEvent = createEvent;
exports.createCommand = createCommand;
const discord_js_1 = require("discord.js");
var InteractionType;
(function (InteractionType) {
    InteractionType["All"] = "All";
    InteractionType["Modal"] = "Modal";
    InteractionType["Button"] = "Button";
    InteractionType["AutoComplete"] = "AutoComplete";
    InteractionType["RoleSelectMenu"] = "RoleSelectMenu";
    InteractionType["UserSelectMenu"] = "UserSelectMenu";
    InteractionType["StringSelectMenu"] = "StringSelectMenu";
    InteractionType["ChannelSelectMenu"] = "ChannelSelectMenu";
    InteractionType["MentionableSelectMenu"] = "MentionableSelectMenu";
})(InteractionType || (exports.InteractionType = InteractionType = {}));
;
class InteractionCommandBuilder {
    name;
    type = InteractionType.All;
    constructor(data) {
        this.name = data?.name;
        this.type = data?.type ?? InteractionType.All;
    }
    ;
    setName(name) {
        this.name = name;
        return this;
    }
    ;
    setType(type) {
        return new InteractionCommandBuilder({ ...this.toJSON(), type });
    }
    ;
    toJSON() {
        const { name, type } = this;
        return { name, type };
    }
}
exports.InteractionCommandBuilder = InteractionCommandBuilder;
;
class SlashCommandBuilder extends discord_js_1.SlashCommandBuilder {
    guilds;
    onlyForGuilds(...guilds) {
        this.guilds = guilds;
        return this;
    }
    getJSON() {
        return { ...this.toJSON(), guilds: this.guilds };
    }
    ;
}
exports.SlashCommandBuilder = SlashCommandBuilder;
;
class ContextMenuCommandBuilder extends discord_js_1.ContextMenuCommandBuilder {
    guilds;
    onlyForGuilds(...guilds) {
        this.guilds = guilds;
        return this;
    }
    ;
    getJSON() {
        return { ...this.toJSON(), guilds: this.guilds };
    }
    ;
}
exports.ContextMenuCommandBuilder = ContextMenuCommandBuilder;
;
var ParamType;
(function (ParamType) {
    ParamType["String"] = "string";
    ParamType["Number"] = "number";
    ParamType["User"] = "user";
    ParamType["Member"] = "member";
    ParamType["Channel"] = "channel";
    ParamType["Role"] = "role";
})(ParamType || (exports.ParamType = ParamType = {}));
;
class ParamBuilder {
    name;
    description;
    type = ParamType.String;
    rest = false;
    required = false;
    handler;
    constructor(data) {
        this.rest = data?.rest ?? false;
        this.type = data?.type ?? ParamType.String;
        this.name = data?.name;
        this.description = data?.description;
        this.required = data?.required;
        this.handler = data?.handler;
    }
    ;
    setName(name) {
        this.name = name;
        return this;
    }
    ;
    setDescription(description) {
        this.description = description;
        return this;
    }
    ;
    setRest(rest) {
        return new ParamBuilder({ ...this.toJSON(), rest });
    }
    ;
    setErrorHandler(handler) {
        this.handler = handler;
        return this;
    }
    ;
    setRequired(required) {
        return new ParamBuilder({ ...this.toJSON(), required });
    }
    ;
    setType(type) {
        return new ParamBuilder({ ...this.toJSON(), type });
    }
    ;
    toJSON() {
        const { name, description, type, rest, required, handler } = this;
        return { name, description, type, rest, required, handler };
    }
    ;
}
exports.ParamBuilder = ParamBuilder;
;
class PrefixedCommandBuilder {
    name;
    aliases;
    description;
    params;
    alwaysReply;
    preRun = () => true;
    constructor(data = {}) {
        this.name = data.name;
        this.aliases = data.aliases;
        this.description = data.description;
        this.params = data.params;
        this.alwaysReply = data.alwaysReply;
    }
    ;
    setName(name) {
        this.name = name;
        return this;
    }
    ;
    setAliases(...aliases) {
        this.aliases = aliases;
        return this;
    }
    ;
    setDescription(description) {
        this.description = description;
        return this;
    }
    ;
    setParams(...params) {
        return new PrefixedCommandBuilder({ ...this.toJSON(), params });
    }
    ;
    setAlwaysReply(alwaysReply) {
        this.alwaysReply = alwaysReply;
        return this;
    }
    ;
    toJSON() {
        const { name, aliases, description, params, alwaysReply } = this;
        return { name, aliases, description, params, alwaysReply };
    }
    ;
    validateCmd(handler) {
        this.preRun = handler;
        return this;
    }
    ;
}
exports.PrefixedCommandBuilder = PrefixedCommandBuilder;
;
function createEvent(data) { return data; }
;
function createCommand(input) {
    return input;
}
;
