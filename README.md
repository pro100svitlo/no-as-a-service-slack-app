# No-as-a-Service Slack App

## About

This project is inspired by the hilarious and simple [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service) GitHub project. It's created for fun, to bring a bit more humor to daily work routines. Sometimes you just need a creative way to say "no"! 😄

---

## What It Does

A Slack app that provides creative "no" responses using Supabase Edge Functions. Get access to 1055+ hilarious ways to say "no" right in your Slack workspace!

**Features:**
- 📣 `/no` slash command with 1055+ creative responses
- � Get 3 random "no" reasons at once
- 1️⃣ 2️⃣ 3️⃣ Quick selection with emoji buttons
- 🔄 Regenerate button for 3 new reasons
- 📢 Post selected reason publicly to channel
- ⛔ Cancel ephemeral messages
- 🔄 Auto-update reasons weekly from the original source

## Installation

Add the app to your Slack workspace using the button below:

[Add to Slack Button Here](https://slack.com/oauth/v2/authorize?client_id=2550998207090.10222067205218&scope=commands,chat:write&user_scope=)

After installation, you'll be redirected to a success page and the app will be ready to use immediately.

## Usage

Simply type `/no` in any Slack channel or direct message.

You'll get:
- 3 random creative "no" responses (shown only to you initially)
- 1️⃣ 2️⃣ 3️⃣ **Select** - Choose which reason to share publicly
- 🔄 **Another reason** - Get 3 different responses
- ⛔ **Cancel** - Dismiss the message

**Example:**
```
/no
```

Response: 
```
1️⃣ No, because I'd rather staple my hand to a burning building.

2️⃣ No, because I have better things to do with my time.

3️⃣ No, because that sounds like a terrible idea.
```

Then choose which one to share with everyone or get 3 new reasons!

---

**Data Source:** Reasons are sourced from [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service) by [hotheadhacker](https://github.com/hotheadhacker).

**Last reasons update:** March 30, 2026

## License

MIT
