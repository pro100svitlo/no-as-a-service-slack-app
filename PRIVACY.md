# Privacy Policy for No-as-a-Service Slack App

**Last Updated: January 9, 2026**

## Introduction

No-as-a-Service ("the App") is a Slack application that provides creative "no" responses to users. This Privacy Policy explains how we collect, use, and protect information when you use our App.

## Information We Collect

### 1. Slack Workspace Information
When you install and use the App, we collect:
- **User Information**: Slack user IDs, usernames, and display names for users who interact with the App
- **Workspace Information**: Slack workspace/team ID and channel IDs where the App is used
- **Command Data**: Records of `/no` command usage (timestamp and user)

### 2. Interaction Data
We process the following interaction data:
- Button clicks (Post, Another reason, Cancel)
- Message timestamps for updating or deleting messages
- Channel information when posting public messages

### 3. Technical Data
- Request signatures and timestamps for security verification
- Error logs for troubleshooting and service improvement

## How We Use Your Information

We use the collected information solely to:

1. **Provide Service Functionality**
   - Process `/no` slash commands
   - Generate and display creative "no" responses
   - Handle button interactions (regenerate, post publicly, cancel)
   - Deliver responses to the appropriate user or channel

2. **Maintain Security**
   - Verify that requests are legitimately from Slack
   - Prevent unauthorized access and abuse

3. **Improve Service**
   - Monitor for errors and performance issues
   - Maintain service reliability

## Data Storage and Retention

### What We Store
- **Response Database**: A database of creative "no" responses (sourced from [no-as-a-service](https://github.com/hotheadhacker/no-as-a-service))
- **No Personal Data Storage**: We do **not** permanently store any user information, workspace data, or usage logs

### Data Processing
- All user and workspace data is processed in real-time and is not retained after the request is completed
- Slack user IDs and channel IDs are used only during the request lifecycle to deliver responses
- Temporary logs may be kept for up to 7 days for error debugging purposes

## Data Sharing and Third Parties

### We Do Not Sell Your Data
We do not sell, rent, or trade any user information to third parties.

### Third-Party Services
The App uses the following third-party services:

1. **Supabase** (Infrastructure Provider)
   - Hosts our Edge Functions and database
   - Subject to [Supabase Privacy Policy](https://supabase.com/privacy)
   - Data Location: Depends on your Supabase region selection

2. **Slack** (Platform Provider)
   - The App operates within Slack's ecosystem
   - Subject to [Slack Privacy Policy](https://slack.com/privacy-policy)

3. **GitHub** (Data Source)
   - "No" responses are sourced from the public [no-as-a-service repository](https://github.com/hotheadhacker/no-as-a-service)
   - Automated weekly updates fetch new responses

## Data Security

We implement security measures to protect your information:

- **Request Verification**: All Slack requests are verified using cryptographic signatures
- **HTTPS Encryption**: All data transmission occurs over encrypted HTTPS connections
- **Access Control**: Only authorized functions can access our database
- **Environment Variables**: Sensitive credentials are stored securely as environment secrets

## Your Rights and Choices

### Access and Control
Since we don't permanently store personal data, there is no personal data to access or delete. Each interaction is processed and discarded.

### Uninstalling the App
You can remove the App from your Slack workspace at any time:
1. Go to your Slack workspace settings
2. Navigate to Apps
3. Find "No-as-a-Service" and click Remove

Once removed, the App will no longer have access to your workspace.

## Slack Permissions

The App requests the following Slack permissions:

### Commands
- `commands`: To register and handle the `/no` slash command

### Scopes (OAuth Permissions)
- `commands`: Allows the app to receive and respond to `/no` commands
- `chat:write`: Enables posting messages to channels (when you click "Post")

The App operates on an **ephemeral-first** basis - responses are initially visible only to you unless you explicitly choose to post them publicly.

## Children's Privacy

The App is not directed to children under the age of 13. We do not knowingly collect information from children under 13. If you believe a child has used our App, please contact us.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last Updated" date at the top of this policy. We encourage you to review this policy periodically.

Significant changes will be communicated through:
- Updates to this document in our repository
- Notices in our README or documentation

## Data Processing Location

Data is processed in the cloud region where your Supabase instance is deployed. You can verify this in your Supabase project settings.

## Contact Information

If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

- **GitHub Issues**: [Open an issue on GitHub](https://github.com/YOUR_USERNAME/no-as-a-service-slack-app/issues)
- **Email**: [Your contact email]

## Open Source

This App is open source. You can review the complete source code and implementation at:
[https://github.com/YOUR_USERNAME/no-as-a-service-slack-app](https://github.com/YOUR_USERNAME/no-as-a-service-slack-app)

## Compliance

### GDPR Compliance (EU Users)
If you are located in the European Economic Area (EEA):
- **Legal Basis**: We process data based on legitimate interest (providing the service you requested)
- **Data Minimization**: We collect only essential data to operate the App
- **Right to Object**: You can stop using the App at any time

### CCPA Compliance (California Users)
California residents have the right to:
- Know what personal information is collected (see "Information We Collect")
- Request deletion of personal information (we don't store personal data beyond processing)
- Opt-out of sale of personal information (we never sell data)

## Cookies and Tracking

The App does not use cookies or tracking technologies. All functionality is command-based through Slack.

## Summary

**In Plain English:**
- We process your Slack user info only to deliver "no" responses to you
- We don't store your personal information
- We don't sell any data
- You can remove the App anytime
- Messages are private unless you choose to post them publicly

---

By using No-as-a-Service, you acknowledge that you have read and understood this Privacy Policy.
