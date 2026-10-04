export const paymentConfig = {
  pushPayUrl: "https://ppay.co/mJyvth1Pp-Y",
  pushPayQrUrl: process.env.NEXT_PUBLIC_PUSHPAY_QR_URL || "",
  zelleRecipient: "mbankhead@myeccoc.com",
  zelleQrUrl: process.env.NEXT_PUBLIC_ZELLE_QR_URL || "",
} as const;
