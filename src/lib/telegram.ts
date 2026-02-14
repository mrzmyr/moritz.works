/**
 * Send a photo to a Telegram chat via the Bot API.
 *
 * @param png - PNG image buffer
 * @param caption - Optional message caption (max 1024 chars)
 */
export async function sendTelegramPhoto({
  png,
  caption,
}: {
  png: Buffer;
  caption?: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is not set");

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append(
    "photo",
    new Blob([new Uint8Array(png)], { type: "image/png" }),
    "canvas.png",
  );

  if (caption) {
    form.append("caption", caption.slice(0, 1024));
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendPhoto`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${body}`);
  }
}
