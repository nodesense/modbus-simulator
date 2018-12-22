export class RequestFrame  {
    id: number;
    func: number;
    address: number;
    quantity: number;
    data: Buffer;
    byteCount: number;
    crc: number;
  };