# Sub-Processors for No-as-a-Service Slack App

**Last Updated: January 9, 2026**

This document lists the third-party sub-processors that No-as-a-Service uses to process data.

## Active Sub-Processors

### Supabase Inc.
- **Service**: Cloud infrastructure and database hosting
- **Data Processed**: 
  - Workspace/team IDs
  - Bot authentication tokens
  - Response database content
- **Purpose**: Application hosting, database storage, and edge function execution
- **Location**: Configurable (US East, EU, or other regions based on deployment)
- **Website**: https://supabase.com
- **Privacy Policy**: https://supabase.com/privacy
- **Security**: SOC 2 Type II compliant, GDPR compliant
- **Data Protection Agreement**: Available through Supabase's Terms of Service

### Infrastructure Sub-Processors (via Supabase)

Supabase uses the following infrastructure providers:

#### Amazon Web Services (AWS)
- **Service**: Cloud infrastructure
- **Purpose**: Database and compute resources
- **Location**: Multiple regions globally
- **Website**: https://aws.amazon.com
- **Compliance**: SOC, ISO 27001, GDPR, HIPAA

## Data Flow

1. **User Action** → Slack workspace
2. **Slack** → No-as-a-Service (Supabase Edge Functions)
3. **Processing** → Supabase PostgreSQL Database
4. **Response** → Slack workspace

## No Data Sharing

We do not share user data with any other third parties beyond the sub-processors listed above. All sub-processors are bound by strict data protection agreements.

## Changes to Sub-Processors

We will update this document when:
- Adding new sub-processors
- Removing sub-processors
- Changing how sub-processors handle data

Users will be notified of material changes through our GitHub repository and documentation updates.

## Contact

For questions about our sub-processors:
- **GitHub Issues**: https://github.com/pro100svitlo/no-as-a-service-slack-app/issues
- **Email**: [Your contact email]

---

## Summary

**Primary Sub-Processor**: Supabase (for all data processing and storage)

**What they access**: Workspace IDs, bot tokens, response database (no personal user messages or conversation data)

**Why we use them**: To provide the core functionality of the Slack app
