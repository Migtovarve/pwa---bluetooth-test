if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
}

// Conectar al Bluetooth
// async function connectToBluetooth() {
//   try {
//       console.log('Requesting Bluetooth Device...');
//       const device = await navigator.bluetooth.requestDevice({
//           acceptAllDevices: true,
//           optionalServices: ['battery_service']
//       });

//       console.log('Connecting to GATT Server...');
//       const server = await device.gatt.connect();
//       console.log({server})

//       console.log('Getting Battery Service...');
//       const service = await server.getPrimaryService('battery_service');

//       console.log('Getting Battery Level Characteristic...');
//       const characteristic = await service.getCharacteristic('battery_level');

//       console.log('Reading Battery Level...');
//       const value = await characteristic.readValue();
//       const batteryLevel = value.getUint8(0);
//       console.log(`Battery Level: ${batteryLevel}%`);
//   } catch (error) {
//       console.error('Error:', error);
//   }
// }

// // Agregar el evento al botón
// document.querySelector('#connectButton').addEventListener('click', connectToBluetooth);

async function connectToBluetooth() {
  try {
      console.log('Requesting Bluetooth Device...');
      const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'heart_rate', 'device_information']
      });

      device.addEventListener('gattserverdisconnected', onDisconnected);

      console.log('Connecting to GATT Server...');
      const server = await connectToDevice(device);

      if (!server) {
          console.error('Failed to connect to GATT server.');
          return;
      }

      console.log('Getting Battery Service...');
      const service = await server.getPrimaryService('battery_service');

      console.log('Getting Battery Level Characteristic...');
      const characteristic = await service.getCharacteristic('battery_level');

      console.log('Reading Battery Level...');
      const value = await characteristic.readValue();
      const batteryLevel = value.getUint8(0);
      console.log(`Battery Level: ${batteryLevel}%`);
  } catch (error) {
      console.error('Error:', error);
  }
}
var bluetoothDevice;

async function connectToDevice(device) {
  // try {
  //     const server = await device.gatt.connect();
  //     console.log('GATT server connected.');
  //     return server;
  // } catch (error) {
  //     console.error('Failed to connect to GATT server:', error);
  //     return null;
  // }

  navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['heart_rate',
      'device_information',
      'battery_service',
      'glucose',
      'heart_rate',
      'weight_scale',
      'cycling_power',
      'cycling_speed_and_cadence',
      'environmental_sensing',
      'human_interface_device',
      'current_time',
      'user_data',
      'generic_access',
      'location_and_navigation',
      'health_thermometer'
    ] // Puedes especificar servicios específicos si los necesitas
  })
  .then(device => {
    bluetoothDevice = device;
      console.log("Dispositivo seleccionado:", {device});
      return device.gatt.connect();
  })
  .then(server => {
      console.log("Conectado al servidor GATT:", server);
  })
  .catch(error => {
      console.log("Error al conectarse al dispositivo:", error);
  });
}




function onDisconnected(bluetoothDevice) {
  console.log("Se ejecuta?")
  if (bluetoothDevice && bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
    console.log("Desconectado del dispositivo.");
  } else {
    console.log("el dispositivo ya esta desconectado o no esta conectado.")
  }
}

function compatibilidadButton () {
  if (navigator.bluetooth) {
      console.log("Bluetooth está disponible en este dispositivo.");
  } else {
      console.log("Bluetooth no está disponible en este dispositivo.");
  }
}

function readCharacteristic() {
  if (!bluetoothDevice) {
      console.log("No hay ningún dispositivo conectado.");
      return;
  }

  if (bluetoothDevice.gatt.connected) {
      return readFromGattServer();
  } else {
      console.log("El dispositivo está desconectado, intentando reconectar...");
      bluetoothDevice.gatt.connect()
      .then(() => {
          console.log("Reconectado exitosamente.");
          return readFromGattServer();
      })
      .catch(error => {
          console.log("Error al reconectar:", error);
      });
  }
}

function readFromGattServer() {
  return bluetoothDevice.gatt.getPrimaryService('device_information')
  .then(service => {
    console.log("Accediendo al servicio de información del dispositivo.");
    return Promise.all([
        service.getCharacteristic('manufacturer_name_string'),
        service.getCharacteristic('model_number_string'),
        service.getCharacteristic('serial_number_string')
    ]);
  })
  .then(characteristics => {
      return Promise.all(characteristics.map(characteristic => characteristic.readValue()));
  })
  .then(values => {
      const decoder = new TextDecoder('utf-8');
      console.log("Nombre del fabricante:", decoder.decode(values[0]));
      console.log("Número de modelo:", decoder.decode(values[1]));
      console.log("Número de serie:", decoder.decode(values[2]));
  })
  .catch(error => {
      console.log("Error:", error);
  });
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  console.log('Received ' + value);
  // TODO: Parse Heart Rate Measurement value.
  // See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
}

// Agregar el evento al botón
document.querySelector('#connectButton').addEventListener('click', connectToDevice);
document.querySelector('#disconnectButton').addEventListener('click', onDisconnected);
document.querySelector('#compatibilidadButton').addEventListener('click', compatibilidadButton);
document.querySelector('#readCharacteristic').addEventListener('click', readCharacteristic);

console.log(navigator, "navigator");