# EP Helper
EPH (EP Helper) is a fun, utility, and administration bot made for Eternal Paradise on Discord.


## Self Hosting
To host an instance of EPH, first head to the [Discord Developer Portal](https://discord.com/developers/applications)
and create a new app.

Next, you'll need to select a hosting provider. I recommend [Railway](https://railway.com) for ease-of-use.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/WBDHYM?referralCode=xcXfgk)

EPH needs 3 services to function properly:
1. Redis - EPH uses Redis to cache data (like server configs) in memory so commands can run faster.
2. MongoDB - EPH uses MongoDB as a primary database for storing all necessary data.
You can create a free MongoDB instance [here](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).
3. EP Helper App - This project, the core application that connects to Discord and listens to gateway events.

### Local Hosting
To host EPH on your own hardware (Linux, MacOS, or Windows),
run the following commands inside your directory of choice:

```bash
mkdir ep-helper && cd ep-helper
git clone https://github.com/TheFallenSpirit/ep-helper
cp .env.example .env
pnpm install && pnpm build
```

To start EPH, run `pnpm start`.
Before starting, make sure to open the `.env` file and provide your bot token and DB URLs.

If you don't have pnpm or node installed,
I recommend installing [Volta](https://volta.sh), then running `volta install node pnpm`.

### Environment Variables
The following environment variables are required for EPH to start:

- `REDIS_URL` - The connection URL of your running Redis instance.
- `MONGO_URL` - The connection URL of your running MongoDB instance.
- `DISCORD_TOKEN` - Your Discord bot token from the Discord Developer Poral.


## Configuring
After deploying your app, some basic configuration for admins and statuses is needed.

### Managing Admins
First, add yourself as an admin by running `ep admins add @user` in your server.

If you don't add yourself as an admin, you won't be able to use admin commands,
and any user that uses that command first can become an admin.

To manage admins, use the following commands:
- `ep admins add @user`
- `ep admins remove @user`
- `ep admins list`

### Managing Statuses
By default, EPH will display a basic status saying "change me".
You should use `ep statuses remove 1` to remove this status from rotation.

EPH will randomly set one of your provided statuses every 2 minutes.

To manage statues, use the following commands:
- `ep statuses add <online/idle/dnd> <status-message>`
- `ep statuses remove <number>`
- `ep statuses list`

### Managing Whitelisted Servers
By default, whitelisted servers is disabled. This means anyone can add your app to any server and use it.

To enable whitelisted servers and whitelist your server, use `ep wls add <your-server-id>`.
Once enabled, EPH will automatically leave non-whitelisted servers when someone tries to add your bot instance.

To manage whitelisted servers, use the following commands:
- `ep wls add <server-id>`
- `ep wls remove <server-id>`
- `ep wls list`


## Bug Reports & Feature Requests
To report a bug or make a feature request, open a new issue on this repository.
Prefix your issue title with either "Bug report: " or "Feature request: ".

Provide a clear description of your issue or feature request.
For bug reports, explain how to re-produce the bug.
For feature requests, explain how you'd like the feature to work.


## Contributing
Pull requests are always welcome!

Before submitting a pull request, please make sure all of your code is clearly readable,
and follows similar styling as the rest of the project.
