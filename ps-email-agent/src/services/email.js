/**
 * EMAIL SERVICE
 * Handles Microsoft 365 email operations via Graph API
 */

const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('isomorphic-fetch');

class EmailService {
  constructor() {
    this.client = null;
    this.msalClient = null;
  }

  /**
   * Initialize the Microsoft Graph client
   */
  async initialize() {
    // MSAL configuration for app-only authentication
    const msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`
      }
    };

    this.msalClient = new ConfidentialClientApplication(msalConfig);

    // Create Graph client with token provider
    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const result = await this.msalClient.acquireTokenByClientCredential({
            scopes: ['https://graph.microsoft.com/.default']
          });
          done(null, result.accessToken);
        } catch (error) {
          done(error, null);
        }
      }
    });

    console.log('Email service initialized');
  }

  /**
   * Get details of a specific email by ID
   */
  async getEmail(messageId) {
    try {
      const message = await this.client
        .api(`/users/${process.env.MICROSOFT_USER_EMAIL}/messages/${messageId}`)
        .select('id,subject,body,bodyPreview,from,toRecipients,ccRecipients,receivedDateTime,conversationId,internetMessageId,hasAttachments')
        .get();

      return this.formatMessage(message);
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  }

  /**
   * Get recent emails (for testing/debugging)
   */
  async getRecentEmails(count = 10) {
    try {
      const messages = await this.client
        .api(`/users/${process.env.MICROSOFT_USER_EMAIL}/mailFolders/inbox/messages`)
        .top(count)
        .orderby('receivedDateTime desc')
        .select('id,subject,bodyPreview,from,receivedDateTime')
        .get();

      return messages.value.map(this.formatMessage);
    } catch (error) {
      console.error('Error getting recent emails:', error);
      throw error;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(to, subject, body, options = {}) {
    try {
      const message = {
        subject: subject,
        body: {
          contentType: options.isHtml ? 'HTML' : 'Text',
          content: body
        },
        toRecipients: Array.isArray(to)
          ? to.map(email => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: to } }]
      };

      // Add CC if provided
      if (options.cc) {
        message.ccRecipients = Array.isArray(options.cc)
          ? options.cc.map(email => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: options.cc } }];
      }

      // Add reply-to header for threading
      if (options.replyTo) {
        message.replyTo = [{ emailAddress: { address: options.replyTo } }];
      }

      // If this is a reply, we need to include conversationId
      if (options.conversationId) {
        message.conversationId = options.conversationId;
      }

      await this.client
        .api(`/users/${process.env.MICROSOFT_USER_EMAIL}/sendMail`)
        .post({ message, saveToSentItems: true });

      console.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Reply to an email
   */
  async replyToEmail(messageId, body, options = {}) {
    try {
      const reply = {
        message: {
          body: {
            contentType: options.isHtml ? 'HTML' : 'Text',
            content: body
          }
        },
        comment: ''  // Empty comment, body contains our reply
      };

      await this.client
        .api(`/users/${process.env.MICROSOFT_USER_EMAIL}/messages/${messageId}/reply`)
        .post(reply);

      console.log(`Reply sent for message ${messageId}`);
      return true;
    } catch (error) {
      console.error('Error replying to email:', error);
      throw error;
    }
  }

  /**
   * Create a draft email (for human review before sending)
   */
  async createDraft(to, subject, body, options = {}) {
    try {
      const message = {
        subject: subject,
        body: {
          contentType: options.isHtml ? 'HTML' : 'Text',
          content: body
        },
        toRecipients: Array.isArray(to)
          ? to.map(email => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: to } }]
      };

      if (options.cc) {
        message.ccRecipients = Array.isArray(options.cc)
          ? options.cc.map(email => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: options.cc } }];
      }

      const draft = await this.client
        .api(`/users/${process.env.MICROSOFT_USER_EMAIL}/messages`)
        .post(message);

      console.log(`Draft created: ${draft.id}`);
      return draft.id;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  }

  /**
   * Setup webhook subscription for new emails
   */
  async createWebhookSubscription(webhookUrl) {
    try {
      const subscription = {
        changeType: 'created',
        notificationUrl: webhookUrl,
        resource: `/users/${process.env.MICROSOFT_USER_EMAIL}/mailFolders/inbox/messages`,
        expirationDateTime: new Date(Date.now() + 4230 * 60 * 1000).toISOString(), // Max ~3 days
        clientState: process.env.WEBHOOK_SECRET
      };

      const result = await this.client
        .api('/subscriptions')
        .post(subscription);

      console.log('Webhook subscription created:', result.id);
      return result;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Renew webhook subscription (must be done before expiration)
   */
  async renewSubscription(subscriptionId) {
    try {
      const result = await this.client
        .api(`/subscriptions/${subscriptionId}`)
        .patch({
          expirationDateTime: new Date(Date.now() + 4230 * 60 * 1000).toISOString()
        });

      console.log('Subscription renewed:', subscriptionId);
      return result;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }

  /**
   * List active subscriptions
   */
  async listSubscriptions() {
    try {
      const result = await this.client.api('/subscriptions').get();
      return result.value;
    } catch (error) {
      console.error('Error listing subscriptions:', error);
      return [];
    }
  }

  /**
   * Format a message from Graph API to our internal format
   */
  formatMessage(message) {
    return {
      id: message.id,
      subject: message.subject || '(No Subject)',
      body: message.body?.content || '',
      bodyPreview: message.bodyPreview || '',
      from: message.from?.emailAddress?.address || '',
      fromName: message.from?.emailAddress?.name || '',
      to: message.toRecipients?.map(r => r.emailAddress.address) || [],
      cc: message.ccRecipients?.map(r => r.emailAddress.address) || [],
      receivedAt: message.receivedDateTime,
      conversationId: message.conversationId,
      internetMessageId: message.internetMessageId,
      hasAttachments: message.hasAttachments || false
    };
  }
}

module.exports = new EmailService();
