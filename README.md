# No-as-a-Service Slack App

## About

This project is inspired by the hilarious and simple [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service) GitHub project. It's created for fun, to bring a bit more humor to daily work routines. Sometimes you just need a creative way to say "no"! 😄

---

## What It Does

A Slack app that provides creative "no" responses using Supabase Edge Functions. Get access to 1055+ hilarious ways to say "no" right in your Slack workspace!

**Features:**
- 📣 `/no` slash command with 1055+ creative responses
- 🔄 Regenerate button for new reasons
- 📢 Post publicly to channel
- ⛔ Cancel ephemeral messages
- 🔄 Auto-update reasons weekly from the original source

## Installation

Add the app to your Slack workspace using the button below:

[Add to Slack Button Here](https://slack.com/oauth/v2/authorize?client_id=2550998207090.10222067205218&scope=commands,chat:write&user_scope=)

After installation, you'll be redirected to a success page and the app will be ready to use immediately.

## Usage

Simply type `/no` in any Slack channel or direct message.

You'll get:
- A random creative "no" response (shown only to you initially)
- 📣 **Post** - Share publicly to channel
- 🔄 **Another reason** - Get a different response
- ⛔ **Cancel** - Dismiss the message

**Example:**
```
/no
```

Response: _"No, because I'd rather staple my hand to a burning building."_

Then choose to share it with everyone or get another hilarious reason!

---

**Data Source:** Reasons are sourced from [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service) by [hotheadhacker](https://github.com/hotheadhacker).

## License

MIT
