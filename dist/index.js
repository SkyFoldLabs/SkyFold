"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const d = __importStar(require("discord.js"));
const types_1 = require("./types");
const fs_1 = require("fs");
const path_1 = require("path");
const handlers_1 = require("./handlers");
class Client extends d.Client {
    config;
    commands = new d.Collection();
    logger = {
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    noop(...args) { return null; }
    constructor(config) {
        super(config);
        this.config = config;
    }
    ;
    handlers() {
        const { prefix, slash, interactions } = {
            prefix: this.config.customHandlers?.prefix ?? handlers_1.PrefixCommandsHandler,
            slash: this.config.customHandlers?.slash ?? handlers_1.SlashCommandsHandler,
            interactions: this.config.customHandlers?.interactions ?? handlers_1.InteractionsCommandsHandler,
        };
        if (this.options.intents.has("MessageContent"))
            this.on("messageCreate", (msg) => prefix(this, msg));
        this.on("interactionCreate", (int) => { if (int.isChatInputCommand())
            slash(this, int);
        else
            interactions(this, int); });
        this.once("clientReady", () => (0, handlers_1.putSlashes)(this));
    }
    async eventLoader(...dir) {
        const eventNames = new Set();
        const events = [];
        this.removeAllListeners();
        this.handlers();
        this.loader((event) => {
            if (event.once)
                return this.once(event.name, (...args) => event.code(this, ...args));
            const { name, code } = event;
            eventNames.add(name);
            events.push({ name, code });
        }, ...dir);
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
    async commandLoader(...dir) {
        this.commands.clear();
        this.loader((data, path) => {
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
        }, ...dir);
    }
    ;
    loader(code, ...dir) {
        const files = (0, fs_1.readdirSync)((0, path_1.join)(...dir));
        for (const file of files) {
            try {
                const stat = (0, fs_1.lstatSync)((0, path_1.join)(...dir, file));
                if (stat.isDirectory())
                    this.loader(code, (0, path_1.join)(...dir, file));
                else if (this.isValidFile(file)) {
                    delete require.cache[require.resolve((0, path_1.join)(...dir, file))];
                    code(require((0, path_1.join)(...dir, file)).data, (0, path_1.join)(...dir, file));
                }
                ;
            }
            catch (_) {
                this.logger.warn("Failed to load", (0, path_1.join)(...dir, file));
            }
        }
        ;
    }
    ;
    isValidFile = (file) => file.endsWith('.js');
}
exports.Client = Client;
__exportStar(require("./handlers"), exports);
__exportStar(require("./types"), exports);
