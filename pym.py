import pymodbus
import serial
import time
from pymodbus.pdu import ModbusRequest
from pymodbus.client.sync import ModbusSerialClient as ModbusClient #initialize a serial RTU client instance
from pymodbus.transaction import ModbusRtuFramer

import logging
logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.DEBUG)

#count= the number of registers to read
#unit= the slave unit this request is targeting
#address= the starting address to read from

PORT= "/dev/ttys003"

client= ModbusClient(method = "rtu", port=PORT, 
                                     stopbits = 1, 
                                     bytesize = 8, 
                                     parity = 'N',
                                     baudrate= 115200,
                                     timeout = 10)

#Connect to the serial modbus server
connection = client.connect()
print( connection)

#Starting add, num of reg to read, slave unit.
# result= client.read_holding_registers(0x00, 5 ,unit= 0x01)
# print(result)

#Starting add, num of reg to read, slave unit.
t1 = time.perf_counter()
for x in range(1, 1000):
    #print ("sending..")
    #time.sleep(1)
    result= client.read_holding_registers(1, 100 ,unit= 1)
    #print(result)
t2 = time.perf_counter()

print('Time %f' % (t2 - t1))

# result= client.read_holding_registers(1, 10 ,unit= 0x0a)
# print(result)
#rr = client.read_discrete_inputs(1, 1, unit=0x01)
#print(rr)

# client.write_coil(0x00, True, unit= 0x01)

# client.write_coils(0x00, [True, False, True, True, False], unit= 0x01)

#result= client.read_coils(0x00, 5 ,unit= 0x01)
#print(result)

# client.write_registers(0x00, [1,2,3,4,5,6], unit= 0x01)

# for x in range(0, 30):
#     print ("We're on time %d" % (x))
#     client.write_registers(0x00, [1,2,3,4,5,6], unit= 0x01)
#     time.sleep(1)


#Closes the underlying socket connection
client.close()
