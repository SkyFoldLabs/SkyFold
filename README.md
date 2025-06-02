<p align="center">
  <img src="" alt="SkyFold Asset" width="150"></p>
<h1 align="center">SkyFold</h1>
<p align="center">SkyFold, where discord.js handlers are on another level. The best TypeScript discord.js handlers that are also super light to install.</p>
<br>
<h2>Contents</h2>

1. [Installation](#installation)
2. [Using Commands](#using-commands)
    - [Prefixed Commands](#prefixed-commands)
    - [Slash Commands](#slash-commands)
    - [Interaction Commands](#interaction-commands)
    - [Context Commands](#context-commands)
3. [Using Events](#using-events)
4. [Advanced](#advanced)
5. [Credits](#credits)
6. [Star History](#star-history)
<br><br>

## Installation
Installing the stable version from npm.
```bash
npm i skyfold@latest
```
Or you can use the latest and also the dev version through npm
```bash
npm i github:aggelos-007/skyfold
```
After you installed the package you are ready to start you journey building your discord bot! You can initiate the client like discord.js has!
```ts
import { Client, } from "skyfold";

const client = new Client({
    ...ClientOptions,
});

client.login("TOKEN");
```
<br>

## Using Commands
First of all, we need to load all the commands so in your main file you will have to tell SkyFold where to load commands from like this:
```ts
import { Client, } from "skyfold";

const client = new Client({
    ...ClientOptions,
    prefixes?: string[] //Optional, required only when you want to use prefix commands
});

client.commandLoader("./commands");

client.login("TOKEN");
```
Now that all your commands under `commands` folder will be loaded, it's time to understand how to create them!
<br>First of all, starting with the structure, this is the accepted structure:

```ts
import { createCommand } from "skyfold";

export const data = createCommand | createCommand[]
```
Now gong on based the commands, here is how the createCommand function should be structured as:
<br><br>

### Prefixed Commands<hr>
Here is how the createCommand should look for prefixed commands
```ts
createCommand({
    data: new PrefixedCommandBuilder()
    .setName(string) // Optional only when alwaysReply is set to true
    .setAliases(...string) // Optional
    .setDescription(string) // Optional
    .setParams(...ParamBuilder) // Optional, used only for when you want params
    .setAlwaysReply(boolean); // Optional, used only when you want unprefixed commands that get triggered with any message
    code: (ctx: {
        client: Client;
        msg: Message;
        args: Params[]; // This is based on the params you have put, it returns the right type
    }) => Promise<void> | void;
})
```

Here is how ParamBuilder class is structured and all the available param types:
```ts
new ParamBuilder()
.setName(string) // Optional
.setDescription(string) // Optional
.setRest(boolean) // Required. True = returns an array of the type by getting all the args users provided | False = return the type only
.setRequired(boolean) // Optional
.setType(ParamType) // Required. Need to use ParamType[keyof ParamType]
// Optional. This method is used to handle errors whenever users fail to return a valid type or don't provide a required param
.setErrorHandler( 
    (client: Client, msg: Message, errorType: "missing" | "wrongType") => Promise<void> | void
)

//ParamType Enum
enum ParamType {
    String
    Number
    User
    Member
    Channel
    Role
};
```
<br>

### Slash Commands<hr>
Here is how the createCommand should look for slash commands
```ts
createCommand({
    data: new SlashCommandBuilder() // This is the same with the discord.js builder but with 1 extra method
    .onlyForGuilds(...string) // Optional, makes the slash command guild only and not as global
    code: (ctx: { 
        client: Client;
        int: ChatInputCommandInteraction
    }) => Promise<void> | void;
})
```
<br>

### Interaction Commands<hr>
Here is how the createCommand should look for interaction commands
```ts
createCommand({
    data: new InteractionCommandBuilder()
    .setName(name) // Optional
    .setType(InteractionType) //Optional, default: InteractionType.All. Need to use InteractionType[keyof InteractionType]
    code: (ctx: {
        client: Client;
        int: Interaction; // This interaction type changes to the type you provide in the builder
    }) => Promise<void> | void;
})
```
```ts
// InteractionType enum
enum InteractionType {
    All
    Modal
    Button
    AutoComplete
    RoleSelectMenu
    UserSelectMenu
    StringSelectMenu
    ChannelSelectMenu
    MentionableSelectMenu
};
```
<br>

### Context Commands<hr>
Here is how the createCommand should look for context menu commands
```ts
createCommand({
    data: new ContextMenuCommandBuilder() // This is the same with the discord.js builder but with 1 extra method
    .onlyForGuilds(...string) // Optional, makes the context menu command guild only and not as global
    code: (ctx: {
        client: Client;
        int: ContextMenuCommandInteraction;
    }) => Promise<void> | void;
})
```

<br>

## Using Events
First of all, we need to load all the events so in your main file you will have to tell SkyFold where to load commands from like this:
```ts
import { Client, } from "skyfold";

const client = new Client({
    ...ClientOptions
});

client.eventLoader("./events");

client.login("TOKEN");
```
Now that all your events under `events` folder will be loaded, it's time to understand how to create them!
<br>Here is how you should be aiming to create your events:

```ts
import { createEvent } from "skyfold";

export const data = createEvents({
    name: keyof ClientEvents, // Required
    once: boolean, // Optional, default: true
    code: (client: Client, ...args: ClientEvents[EventName]) => void | Promise<void>; // Required
});
```

<br>

## Advanced
Do you want to change the way all the interactions are handled? Here is everything you need to know about:
```ts
const client = new Client({
    ...ClientOptions,
    customHandlers: {
        prefix?: (client: Client, msg: Message) => Promise<void> | void;
        slash?: (client: Client, int: ChatInputCommandInteraction) => Promise<void> | void;
        interactions?: (client: Client, int: Interaction) => Promise<void> | void;
    };
})
```
<br>

## Credits
This package was made with love by this guy <3 

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/aggelos-007/">
        <img src="https://avatars2.githubusercontent.com/u/104696548?v=41&s=100" width="100px;" alt=""/>
        <br/>
        <sub>
          <b>Agglos-007</b>
        </sub>
        <br/>
    </td>
</table>

## Star History

<a href="https://www.star-history.com/#aggelos-007/SkyFold&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=aggelos-007/SkyFold&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=aggelos-007/SkyFold&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=aggelos-007/SkyFold&type=Date" />
 </picture>
</a>
