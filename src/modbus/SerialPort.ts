import SerialPortEx from 'serialport';

export class SerialPort {
    serialPort: SerialPortEx;
    constructor(public port:string,
                public options: any, ) {
        this.serialPort = null;
    }

    connect() {
        this.serialPort = new SerialPort(this.port, this.options);

        this.serialPort.on('open', () => {});
        this.serialPort.on('data', (data: any) => {});
        this.serialPort.on('readable', (err: any) => this.readable());
        this.serialPort.on('close', (err: any) => {});
    }

    readable() {}

    write(buffer: Buffer) {

    }

    disconnect() {

    }


}
