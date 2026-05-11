// İyzico ödeme entegrasyonu — Node.js runtime'ına özel, Edge'de çalışmaz

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require("iyzipay");

function getClient() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || "",
    secretKey: process.env.IYZICO_SECRET_KEY || "",
    uri:
      process.env.NODE_ENV === "production"
        ? "https://api.iyzipay.com"
        : "https://sandbox-api.iyzipay.com",
  });
}

export type IyzicoResult = Record<string, unknown>;

export function checkoutFormInitialize(
  request: Record<string, unknown>
): Promise<IyzicoResult> {
  const client = getClient();
  return new Promise((resolve, reject) => {
    client.checkoutFormInitialize.create(
      request,
      (err: Error | null, result: IyzicoResult) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export function checkoutFormRetrieve(request: {
  locale: string;
  conversationId: string;
  token: string;
}): Promise<IyzicoResult> {
  const client = getClient();
  return new Promise((resolve, reject) => {
    client.checkoutForm.retrieve(
      request,
      (err: Error | null, result: IyzicoResult) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
}

export const LOCALE = "tr";
export const CURRENCY = "TRY";
export const BASKET_ITEM_TYPE = "VIRTUAL";
