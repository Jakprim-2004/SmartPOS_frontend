/**
 * Simple PromptPay QR Generator (EMVCo standard)
 * @param target - Phone number (08XXXXXXXX) or Tax ID
 * @param amount - Amount to pay
 */
export function generatePromptPayPayload(target: string, amount: number): string {
    // Clean target (remove non-digits)
    const cleanTarget = target.replace(/\D/g, '');

    // Formatting target
    // If phone number, must be 13 chars (prefix 00 + country code 66 + number without first 0)
    // If tax ID, must be 13 chars
    let formattedTarget = cleanTarget;
    if (cleanTarget.length === 10 && cleanTarget.startsWith('0')) {
        formattedTarget = '0066' + cleanTarget.substring(1);
    }

    // EMVCo Static Parts
    const f00 = '000201'; // Payload Format Indicator
    const f01 = '010211'; // Point of Initiation Method (11 = Static, 12 = Dynamic)

    // Merchant Account Information (PromptPay)
    const aid = '0016A000000677010111'; // PromptPay GUID
    const merchantInfo = aid +
        (formattedTarget.length === 13 ? '0113' : '0213') + // 01 for phone, 02 for tax ID (but mostly 13 chars)
        formattedTarget;

    const f29 = '29' + merchantInfo.length.toString().padStart(2, '0') + merchantInfo;

    const f53 = '5303764'; // Transaction Currency (764 = THB)
    const f58 = '5802TH';   // Country Code

    // Amount
    const amountStr = amount.toFixed(2);
    const f54 = '54' + amountStr.length.toString().padStart(2, '0') + amountStr;

    const f63 = '6304'; // Checksum marker

    const payload = f00 + f01 + f29 + f53 + f54 + f58 + f63;

    // Calculate CRC16 CCITT
    const crc = crc16(payload);
    return payload + crc.toUpperCase();
}

/**
 * CRC16 CCITT (XMODEM) implementation
 */
function crc16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xFF;
        x ^= x >> 4;
        crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
    }
    return crc.toString(16).padStart(4, '0');
}
