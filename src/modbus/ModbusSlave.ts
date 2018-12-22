
export class ModbusSlave {

    readable()  {
        console.log("readable length ", this.serialPort.readableLength);
        while (this.serialPort.readableLength > 0) {
            //console.log('Data:', this.serialPort.read(1))
            this.read();
        }
    }


  readBytes2(bytes) {
    let n = 0; let res = ''; 
    //let buf = 'xxxxxxxxxxxxxxxxxxxx'; // Should be > 5
    n = this._rd(this.uartNo, this.buf, bytes);
    if (n > 0) {
      res += this.buf.slice(0, n);
    }
    console.log("Read  ", res);
    return res;
  }

  readBytes(bytes) {
    
    return this.serialPort.read(bytes)
 
  }

  readID() {
    this.requestFrame.id = this.readInt8();;
    console.log("*ID=", this.requestFrame.id);
    this.readState = MODBUS_STATE_READ_FUNC;
    this.expected = 1;
  }
   
  readFunc() {
    this.requestFrame.func = this.readInt8();
    console.log("FC", this.requestFrame.func);
    this.readState = MODBUS_STATE_READ_ADDRESS;
    this.expected = 2;
  }
 
  readInt8() {
    let valBuf = this.readBytes(1);
    
    let value = valBuf[0];
    //console.log("value is ", value);
    return value;
  }

  readInt16() {
    let valBuf = this.readBytes(2);
    
    let value = valBuf[0] << 8 | valBuf[1];
   // console.log("value is ", value);
    return value;
  }

  readAddress() {
    this.requestFrame.address = this.readInt16();
    console.log("Addr", this.requestFrame.address);

    if (this.requestFrame.func === MODBUS_FUNC_READ_COILS ||
      this.requestFrame.func === MODBUS_FUNC_READ_DISCRETE_INPUTS ||
      this.requestFrame.func === MODBUS_FUNC_READ_HOLDING_REGISTERS ||
      this.requestFrame.func === MODBUS_FUNC_READ_INPUT_REGISTERS || 
      this.requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_COILS || 
      this.requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_REGISTERS) {
        this.readState = MODBUS_STATE_READ_LENGTH;
        this.expected = 2;
      }

    if (this.requestFrame.func === MODBUS_FUNC_WRITE_SINGLE_COIL ||
        this.requestFrame.func === MODBUS_FUNC_WRITE_SINGLE_REGISTER ) {
      this.readState = MODBUS_STATE_READ_DATA;
      this.expected = 2;
    }
  }
 

  readByteCount() {
    this.requestFrame.byteCount = this.readInt8();
    console.log("BC", this.requestFrame.byteCount);
    this.expected = this.requestFrame.byteCount;
    this.readState = MODBUS_STATE_READ_DATA;
  }

  readLength() {
    this.requestFrame.quantity = this.readInt16();
    console.log("Q", this.requestFrame.quantity);

    if (this.requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_COILS || 
        this.requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_REGISTERS) {
        this.readState = MODBUS_STATE_READ_BYTE_COUNT;
        this.expected = 1;
    } else {
      this.readState = MODBUS_STATE_READ_CRC;
      this.expected = 2;
    }
  }

  readData() {
    let length = 0;

    if (this.requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_COILS || 
        this.requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_REGISTERS) {
      length = this.requestFrame.byteCount;
    }
 
    if (this.requestFrame.func === MODBUS_FUNC_WRITE_SINGLE_COIL ||
        this.requestFrame.func === MODBUS_FUNC_WRITE_SINGLE_REGISTER ) {
          length = 2;
        }

    this.requestFrame.data = this.readBytes(length);

    console.log("DX",     this.requestFrame.data);
 
 
    this.expected = 2;
    this.readState = MODBUS_STATE_READ_CRC;
  }

  readCrc() {
    this.requestFrame.crc = this.readInt16();
    console.log("CRC", this.requestFrame.crc);

    this.readState = MODBUS_STATE_READ_DEVICE_ID;
    this.expected = 1;

    this.checkCrc();
  }

  checkCrc() {
    //TODO: check CRC valid or not
    //console.log("checking crc ..");
    //FIXME: If CRC valid, call this
    this.processRequest();
  }

  readCoils (requestFrame) {
    console.log("readCoils ");
   
    let n = Math.floor(requestFrame.quantity / 8); 

    if (requestFrame.quantity % 8 > 0) {
        n = n +  1;
    }

    console.log("Total bytes to respond", n);
    // TODO: dynamic length
    //this.responseView.setUint8(2, n); // byte count

    this.responseBuffer.writeInt8(2, n) //**
    //ModbusSlave.setInt8(this.dataBuffer, 2, n);

    this.responseLength += 1;
    
    let bitMerge = 0;
    let offset = 0;
    for (let i = 0; i < requestFrame.quantity; i++) {

        let value = this.activeDeviceBuffer.getCoil(requestFrame.address + i);

        bitMerge = bitMerge | (value & 0x01);
        bitMerge = bitMerge << 1;

        if (i !== 0 && i % 8 === 0) {
            //this.responseView.setUint8(3 + offset, bitMerge);
            this.responseBuffer.writeInt8(bitMerge,  3 + offset); //**
            //ModbusSlave.setInt8(this.dataBuffer, 3 + offset, bitMerge);

            this.responseLength += 1;
            bitMerge = 0;
            offset = offset + 1;
        }
    }

    if ( (requestFrame.quantity > 0  && 
          requestFrame.quantity % 8 === 0) ||
          requestFrame.quantity % 8 > 0) {

             //this.responseView.setUint8(3 + offset, bitMerge);
             this.responseBuffer.writeInt8(bitMerge,  3 + offset); //**

            // ModbusSlave.setInt8(this.dataBuffer, 3 + offset, bitMerge);

            this.responseLength += 1;
            bitMerge = 0;
            offset = offset + 1;
    }

}

readDiscreteInputs(requestFrame) {
    console.log("readDiscreteInputs ");

    let n = Math.floor(requestFrame.quantity / 8); 

    if (requestFrame.quantity % 8 > 0) {
        n = n +  1;
    }

    console.log("Total bytes to respond", n);
    // TODO: dynamic length
    // this.responseView.setUint8(2, n); // byte count

    this.responseBuffer.writeInt8(3 + offset, bitMerge); //**
    //ModbusSlave.setInt8(this.dataBuffer, 2, n);

    this.responseLength += 1;
    
    let bitMerge = 0;
    let offset = 0;
    for (let i = 0; i < requestFrame.quantity; i++) {
        let value = this.activeDeviceBuffer.getDiscrete(requestFrame.address + i);
        bitMerge = bitMerge | (value & 0x01);
        bitMerge = bitMerge << 1;

        if (i !== 0 && i % 8 === 0) {
            //this.responseView.setUint8(3 + offset, bitMerge);

            this.responseBuffer.writeInt8(3 + offset, bitMerge); //**
            //ModbusSlave.setInt8(this.dataBuffer, 3 + offset, bitMerge);

            this.responseLength += 1;
            bitMerge = 0;
            offset = offset + 1;
        }
    }

    if ((requestFrame.quantity > 0  && 
        requestFrame.quantity % 8 === 0) ||
        requestFrame.quantity % 8 > 0) {
        //this.responseView.setUint8(3 + offset, bitMerge);

        this.responseBuffer.writeInt8(3 + offset, bitMerge); //**
       // ModbusSlave.setInt8(this.dataBuffer, 3 + offset, bitMerge);

            this.responseLength += 1;
            bitMerge = 0;
            offset = offset + 1;
    }
     
}

readHoldingRegisters(requestFrame) {
    //this.responseView.setUint8(2, requestFrame.quantity * 2); // byte count

    this.responseBuffer.writeUInt8(requestFrame.quantity * 2, 2); //**
    //ModbusSlave.setInt8(this.dataBuffer, 2, requestFrame.quantity * 2);

    this.responseLength += 1;

    console.log("loop start");
    for (let i = 0; i < requestFrame.quantity; i++) {
        let address = (requestFrame.address - 1 ) + (i * 2);
        
        let value = this.activeDeviceBuffer.readHoldingRegistersInt8(address);
        //let value = 0;

        console.log("addr & val", address, value);
        
        //this.responseView.setUint16(3 + (i * 2), value);

        this.responseBuffer.writeInt8(value, 3 + (i * 2)); //**
        //ModbusSlave.setInt8(this.dataBuffer, 3 + (i * 2), value);

        this.responseLength += 2;
    }

    console.log("loop end");
}


readInputRegisters(requestFrame) {
    console.log("readInputRegisters ");

    //this.responseView.setUint8(2, requestFrame.quantity * 2); // byte count

    this.responseBuffer.writeInt8(requestFrame.quantity * 2, 2); //**
    //ModbusSlave.setInt8(this.dataBuffer, 2, requestFrame.quantity * 2);
    this.responseLength += 1;
    
    //TODO: dynamic, based on requested quantity


    console.log("total quantity ", requestFrame.quantity);
     
    //TODO: dynamic, based on requested quantity
    for (let i = 0; i < requestFrame.quantity; i++) {
        console.log("reading input register i ", i);
        let value = this.activeDeviceBuffer.getInputRegisterUint16(requestFrame.address + (i * 2));
        
        //this.responseView.setUint16(3 + (i * 2), value);
        
        this.responseBuffer.writeInt8(value, 3 + (i * 2)); //**
        //ModbusSlave.setInt16(this.dataBuffer, 3 + (i * 2), value);

        this.responseLength += 2;
    }

}


writeSingleCoil(requestFrame) {
    console.log("writeSingleCoil ");

    
    this.responseView.setUint16(2, requestFrame.address); // output address
    this.responseLength += 2;

    // Write to memory setUint8
     let value = requestFrame.dataView.getUint16(0);
     console.log("Value received is ", value);
    if (value === 0) { // off
        this.inputRegisters.setUint8(requestFrame.address,0);
    } else {
        this.inputRegisters.setUint8(requestFrame.address,1);
    }
    
    this.responseView.setUint16(4, value); // output value
    this.responseLength += 2;
}

writeSingleRegister(requestFrame) {
    console.log("writeSingleRegister ");

    this.responseView.setUint16(2, requestFrame.address); // output address
    this.responseLength += 2;
    let value = requestFrame.dataView.getUint16(0);
     console.log("Value received is ", value);
    
     this.holdingRegisters.setUint16(requestFrame.address, value);
     
    this.responseView.setUint16(4, value); // register value
    this.responseLength += 2;
}

_setCoils(address, byteValue, quantity) {
    for (let j = 0; j < quantity; j++) {
        let bitValue = (byteValue & 0x01);
        console.log("_setCoils address ", address + j);
        console.log("_setCoils bitValue ", bitValue);
        console.log("_setCoils byteValue ", byteValue);
        byteValue = byteValue >> 1;

        console.log("_setCoils byteValue >> ", byteValue);
        // this.coils.setUint8(address + j, bitValue);
         
        this.coils.setUint8(address + j, bitValue);
    }
}

writeMultipleCoils(requestFrame) {
    console.log("writeMultipleCoils ");

    this.responseView.setUint16(2, requestFrame.address); // output address
    this.responseLength += 2;

    let address = requestFrame.address;
    
    for (let i = 0; i < requestFrame.byteCount; i++) {
        let value = requestFrame.dataView.getUint8(i);
        console.log("**Value received is ", value);

        let bitsCount = 8;

        // check if last byte, then may have less coils/bit
        if (i === requestFrame.byteCount - 1) {
            bitsCount = requestFrame.quantity % 8;
        }

        address =  address + i * 8;

        this._setCoils(address, value, bitsCount);
       }

    this.responseView.setUint16(4, requestFrame.quantity); // quantity
    this.responseLength += 2;
}

writeMultipleRegisters(requestFrame) {
    console.log("writeMultipleRegisters ");
    
    let address = requestFrame.address;
    
    for (let i = 0; i < requestFrame.quantity; i++) {
        let value = requestFrame.dataView.getUint16(i * 2);
        
        console.log("**Value received is ", value);

        console.log("**Address   is ", address);
        
        this.holdingRegisters.setUint16(address, value);
        address =  address + 2;
    }

    this.responseView.setUint16(2, requestFrame.address); // output address
    this.responseLength += 2;

    this.responseView.setUint16(4, requestFrame.quantity); // quantity
    this.responseLength += 2;
}


    processRequest() {
    const requestFrame = this.requestFrame;
    if (requestFrame.id < 1 || requestFrame.id > 247) {
        console.log('error, slave id out of bound');
        return;
    }

    this.activeDeviceBuffer =  this.deviceBuffers[requestFrame.id];

    if (!this.activeDeviceBuffer || this.activeDeviceBuffer === null) {
        console.log("Slave not found",  requestFrame.id);
        return;
    }
    
    this.responseBuffer.writeInt8(requestFrame.id, 0); //**
//    ModbusSlave.setInt8(this.dataBuffer, 0, requestFrame.id);
    
 
    this.responseBuffer.writeInt8(requestFrame.func, 1); //**
    //ModbusSlave.setInt8(this.dataBuffer, 1, requestFrame.func);

    this.responseLength = 2;

    if (requestFrame.func === MODBUS_FUNC_READ_COILS) {
        this.readCoils(requestFrame);
    }

    if (requestFrame.func === MODBUS_FUNC_READ_DISCRETE_INPUTS) {
        this.readDiscreteInputs(requestFrame);   
    }

    if (requestFrame.func === MODBUS_FUNC_READ_HOLDING_REGISTERS) {
        this.readHoldingRegisters(requestFrame)
    }

    if (requestFrame.func === MODBUS_FUNC_READ_INPUT_REGISTERS) {
        this.readInputRegisters(requestFrame);
    }

    if (requestFrame.func === MODBUS_FUNC_WRITE_SINGLE_COIL) {
        this.writeSingleCoil(requestFrame);
    }

    if (requestFrame.func === MODBUS_FUNC_WRITE_SINGLE_REGISTER) {
        this.writeSingleRegister(requestFrame);
    }

    if (requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_COILS) {
        this.writeMultipleCoils(requestFrame);
    }

    if (requestFrame.func === MODBUS_FUNC_WRITE_MULTIPLE_REGISTERS) {
        this.writeMultipleRegisters(requestFrame);
    }

    console.log("before crc res length", this.responseLength);

    const crcBuffer = Buffer.alloc(this.responseLength)

    this.responseBuffer.copy(crcBuffer, 0, 0, this.responseLength);
 
    let crc =  crc16modbus(crcBuffer);
    console.log("CRC is ", crc);

    this.responseBuffer.writeUInt8((crc  & 0xff), this.responseLength); //**
    this.responseBuffer.writeUInt8((crc >> 8) & 0xff, this.responseLength + 1); //**
    
    console.log("res buffer ", this.responseBuffer);

    this.responseLength += 2;
 
    const response = Buffer.alloc(this.responseLength)

    this.responseBuffer.copy(response, 0, 0, this.responseLength);
 
    console.log(">>", response);
    //this.serial.write(s, this.responseLength);
    this.serialPort.write(response)

    // TODO: respond with unsupported code

} 

  read() {
    if (this.readState === MODBUS_STATE_READ_DEVICE_ID) {
      return this.readID();
    }

    if (this.readState === MODBUS_STATE_READ_FUNC) {
      return this.readFunc();
    }

    if (this.readState === MODBUS_STATE_READ_ADDRESS) {
      return this.readAddress();
    }

    if (this.readState === MODBUS_STATE_READ_LENGTH) {
      return this.readLength();
    }

    if (this.readState === MODBUS_STATE_READ_BYTE_COUNT) {
      return this.readByteCount();
    }

    if (this.readState === MODBUS_STATE_READ_DATA) {
      return this.readData();
    } 

    if (this.readState === MODBUS_STATE_READ_CRC) {
      return this.readCrc();
    }
   
  }
}