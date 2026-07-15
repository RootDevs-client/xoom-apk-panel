import type { AuthenticationCreds, SignalDataTypeMap } from "@whiskeysockets/baileys";
import { BufferJSON, initAuthCreds } from "@whiskeysockets/baileys";
import { WhatsAppSession } from "@/model/WhatsAppSession";

export async function useMongoDBAuthState(
  sessionId: string
): Promise<{
  state: {
    creds: AuthenticationCreds;
    keys: {
      get: <T extends keyof SignalDataTypeMap>(
        type: T,
        ids: string[]
      ) => Promise<{ [id: string]: SignalDataTypeMap[T] }>;
      set: (data: Record<string, SignalDataTypeMap[keyof SignalDataTypeMap] | null>) => Promise<void>;
    };
  };
  saveCreds: () => Promise<void>;
}> {
  const sessionDoc = await WhatsAppSession.findById(sessionId);
  let creds: AuthenticationCreds;

  if (sessionDoc?.authCreds) {
    creds = JSON.parse(JSON.stringify(sessionDoc.authCreds), BufferJSON.reviver);
  } else {
    creds = initAuthCreds();
    await WhatsAppSession.findByIdAndUpdate(sessionId, {
      $set: {
        authCreds: JSON.parse(JSON.stringify(creds, BufferJSON.replacer)),
      },
    });
  }

  const keysData: Record<string, SignalDataTypeMap[keyof SignalDataTypeMap]> =
    sessionDoc?.authKeys
      ? JSON.parse(JSON.stringify(sessionDoc.authKeys), BufferJSON.reviver)
      : {};

  const saveCreds = async () => {
    await WhatsAppSession.findByIdAndUpdate(sessionId, {
      $set: {
        authCreds: JSON.parse(JSON.stringify(creds, BufferJSON.replacer)),
      },
    });
  };

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[]
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
          const data: { [id: string]: SignalDataTypeMap[T] } = {};
          for (const id of ids) {
            const key = `${type}-${id}`;
            if (keysData[key] !== undefined) {
              data[id] = keysData[key] as SignalDataTypeMap[T];
            }
          }
          return data;
        },
        set: async (
          data: Record<string, SignalDataTypeMap[keyof SignalDataTypeMap] | null>
        ): Promise<void> => {
          for (const key in data) {
            if (data[key] === null || data[key] === undefined) {
              delete keysData[key];
            } else {
              keysData[key] = data[key] as SignalDataTypeMap[keyof SignalDataTypeMap];
            }
          }
          await WhatsAppSession.findByIdAndUpdate(sessionId, {
            $set: {
              authKeys: JSON.parse(JSON.stringify(keysData, BufferJSON.replacer)),
            },
          });
        },
      },
    },
    saveCreds,
  };
}
