"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandBuilder = exports.ContextMenuCommandBuilder = exports.InteractionCommandBuilder = exports.PrefixedCommandBuilder = exports.Client = exports.createEvent = exports.createCommand = void 0;
const discord_js_1 = require("discord.js");
const types_1 = require("./types");
Object.defineProperty(exports, "ContextMenuCommandBuilder", { enumerable: true, get: function () { return types_1.ContextMenuCommandBuilder; } });
Object.defineProperty(exports, "createCommand", { enumerable: true, get: function () { return types_1.createCommand; } });
Object.defineProperty(exports, "createEvent", { enumerable: true, get: function () { return types_1.createEvent; } });
Object.defineProperty(exports, "InteractionCommandBuilder", { enumerable: true, get: function () { return types_1.InteractionCommandBuilder; } });
Object.defineProperty(exports, "PrefixedCommandBuilder", { enumerable: true, get: function () { return types_1.PrefixedCommandBuilder; } });
Object.defineProperty(exports, "SlashCommandBuilder", { enumerable: true, get: function () { return types_1.SlashCommandBuilder; } });
const fs_1 = require("fs");
const path_1 = require("path");
const handlers_1 = require("./handlers");
const process_1 = require("process");
class Client extends discord_js_1.Client {
    config;
    commands = new discord_js_1.Collection();
    constructor(config) {
        super(config);
        this.config = config;
        const { prefix, slash, interactions } = {
            prefix: config.customHandlers?.prefix ?? handlers_1.PrefixCommandsHandler,
            slash: config.customHandlers?.slash ?? handlers_1.SlashCommandsHandler,
            interactions: config.customHandlers?.interactions ?? handlers_1.InteractionsCommandsHandler,
        };
        this.on("messageCreate", (msg) => prefix(this, msg));
        this.on("interactionCreate", (int) => { if (int.isChatInputCommand())
            slash(this, int); });
        this.on("interactionCreate", (int) => interactions(this, int));
        this.on("ready", () => (0, handlers_1.putSlashes)(this));
    }
    ;
    async eventLoader(dir) {
        const eventNames = new Set();
        const events = [];
        this.removeAllListeners();
        this.loader(dir, (event) => {
            if (event.once)
                return this.once(event.name, (...args) => event.code(this, ...args));
            const { name, code } = event;
            eventNames.add(name);
            events.push({ name, code });
        });
        for (const name of eventNames) {
            const codes = events.filter(s => s.name == name);
            this.on(name, (...args) => {
                for (const event of codes) {
                    event.code(this, ...args);
                }
                ;
            });
        }
        ;
    }
    ;
    async commandLoader(dir) {
        this.commands.clear();
        this.loader(dir, (data, path) => {
            data = Array.isArray(data) ? data : [data];
            let i = 0;
            for (const command of data) {
                const { data, code } = command;
                let type = null;
                if (data instanceof types_1.PrefixedCommandBuilder)
                    type = "prefix";
                else if (data instanceof types_1.SlashCommandBuilder)
                    type = "slash";
                else if (data instanceof types_1.InteractionCommandBuilder)
                    type = "interaction";
                else if (data instanceof types_1.ContextMenuCommandBuilder)
                    type = "context";
                else
                    type = "unknown";
                this.commands.set(`${path}(${i})`, { data, code, type });
                i++;
            }
            ;
        });
    }
    ;
    loader(dir, code) {
        const root = (0, process_1.cwd)(), files = (0, fs_1.readdirSync)((0, path_1.join)(root, dir));
        for (const file of files) {
            const stat = (0, fs_1.lstatSync)((0, path_1.join)(root, dir, file));
            if (stat.isDirectory())
                this.loader((0, path_1.join)(dir, file), code);
            else if (this.isValidFile(file)) {
                delete require.cache[require.resolve((0, path_1.join)(root, dir, file))];
                code(require((0, path_1.join)(root, dir, file)).data, (0, path_1.join)(root, dir, file));
            }
            ;
        }
        ;
    }
    ;
    isValidFile = (file) => file.endsWith('.js');
    static AntiCrash() {
        process.on('uncaughtException', (err) => {
            console.error('An uncaught exception occurred:', err);
        });
        process.on('unhandledRejection', (reason) => {
            console.error('An unhandled promise rejection occurred:', reason);
        });
    }
    ;
}
exports.Client = Client;
;
