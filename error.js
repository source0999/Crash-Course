// Write a function called bookService that takes a serviceName and a clientName.
// It should use the prices object { fade: 35, facial: 65, beard: 20 }. If the service doesn't exist, throw an error with a useful message.
//  If it does exist, log "[clientName] booked a [serviceName] for $[price]". Wrap the calls in try/catch blocks.
// Test it with one valid service and one invalid service.

try {
  function bookService(serviceName, clientName) {
    const prices = { fade: 35, facial: 65, beard: 20 };

    if (prices[serviceName]) {
      console.log(
        `${clientName} booked a ${serviceName} for $${prices[serviceName]}`,
      );
    } else {
      throw new Error(`Unkown service: ${serviceName}`);
    }
  }

  bookService("fade", "Britton");
  bookService("so", "Source");
} catch (error) {
  console.log(error.message);
}
