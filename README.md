# No-as-a-Service Slack App

A Slack app that provides creative "no" responses using Supabase Edge Functions.

## Features

- 📣 `/no` slash command with 1055+ creative responses
- 🔄 Regenerate button for new reasons
- 📢 Post publicly to channel
- ⛔ Cancel ephemeral messages
- 🔄 Auto-update reasons weekly from source
- 🗄️ Database-backed with fallback to external API

## Project Structure

```
├── .github/workflows/
│   └── update-reasons.yml          # Weekly auto-update
├── supabase/
│   ├── config.toml                 # Supabase configuration
│   ├── functions/
│   │   ├── _shared/
│   │   │   └── slack-utils.ts      # Shared utilities
│   │   ├── slack-no/               # /no command handler
│   │   ├── slack-no-interactions/  # Button interaction handler
│   │   └── slack-no-update-reasons/ # Weekly update function
│   └── migrations/
│       └── 20260109150515_create_reasons_table.sql
└── README.md
```

## Setup

### 1. Supabase Setup

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations to create reasons table
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

### 2. Environment Variables

Set in Supabase Dashboard > Edge Functions > Manage secrets:

```
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://YOUR_PROJECT.supabase.co/functions/v1/slack-oauth
```

### 3. Slack App Configuration

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create or select your app

#### OAuth & Permissions
- **Redirect URLs**:
  - Add: `https://YOUR_PROJECT.supabase.co/functions/v1/slack-oauth`
- **Bot Token Scopes**:
  - `commands` - Use slash commands
  - `chat:write` - Send messages

#### Slash Commands
- Command: `/no`
- Request URL: `https://YOUR_PROJECT.supabase.co/functions/v1/slack-no`
- Short Description: "Get a creative no response"

#### Interactivity & Shortcuts
- Enable Interactivity
- Request URL: `https://YOUR_PROJECT.supabase.co/functions/v1/slack-no-interactions`

### 4. Initial Data Seed

Run the update function once to populate the database:

```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/slack-no-update-reasons
```

### 5. Installation

To install the app to a workspace, users should visit:
```
https://slack.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&scope=commands,chat:write&redirect_uri=https://YOUR_PROJECT.supabase.co/functions/v1/slack-oauth
```

Or create an "Add to Slack" button on your website.

## Usage

In Slack:

```
/no
```

You'll get:
- A random creative "no" response
- 📣 Post - Share publicly to channel
- 🔄 Another reason - Get a different response
- ⛔ Cancel - Dismiss the message

## Auto-Update

GitHub Actions automatically updates reasons every Monday at 3 AM UTC from the [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service) repository.

## Data Source

Reasons are sourced from [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service) by [hotheadhacker](https://github.com/hotheadhacker).

## License

MIT
