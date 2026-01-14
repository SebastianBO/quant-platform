declare module '@elasticemail/elasticemail-client' {
  export const ApiClient: {
    instance: {
      authentications: {
        apikey: {
          apiKey: string
        }
      }
    }
  }

  export class EmailsApi {
    emailsPost(
      emailMessageData: EmailMessageData,
      callback: (error: Error | null, data: unknown) => void
    ): void
  }

  export class EmailMessageData {
    static constructFromObject(obj: {
      Recipients: EmailRecipient[]
      Content: {
        Body: BodyPart[]
        Subject: string
        From: string
        FromName?: string
      }
    }): EmailMessageData
  }

  export class EmailRecipient {
    static constructFromObject(obj: { Email: string }): EmailRecipient
  }

  export class BodyPart {
    static constructFromObject(obj: {
      ContentType: string
      Content: string
    }): BodyPart
  }
}
