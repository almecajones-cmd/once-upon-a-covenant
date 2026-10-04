export const paymentConfig = {
  pushPayUrl: "https://ppay.co/mJyvth1Pp-Y",
  pushPayQrUrl: process.env.NEXT_PUBLIC_PUSHPAY_QR_URL || "https://res.cloudinary.com/v78xwhwr/image/upload/v1791132434/IMG_6382_p7c7wl.jpg",
  zelleRecipient: "mbankhead@myeccoc.com",
  zelleQrUrl: process.env.NEXT_PUBLIC_ZELLE_QR_URL || "https://res.cloudinary.com/v78xwhwr/image/upload/v1791132434/IMG_6381_jjx92g.jpg",
} as const;
