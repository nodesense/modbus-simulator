export class ResponseFrame {
    id: number;
    func: number;
    address?: number;
    quantity?: number;
    byteCount: number;
    data: Buffer;
    crc: number;
}