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
async function connectToBluetooth() {
  try {
      console.log('Requesting Bluetooth Device...');
      const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service']
      });

      console.log('Connecting to GATT Server...');
      const server = await device.gatt.connect();

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

// Agregar el evento al botón
document.querySelector('#connectButton').addEventListener('click', connectToBluetooth);

console.log(navigator, "navigator");