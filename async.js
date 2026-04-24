// Build an async function called checkIn that:

// Takes a clientName parameter
// Logs "[clientName] is checking in..."
// Waits 1 second using this helper I'll give you:

// javascriptconst wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// After the wait, logs "[clientName] — seat ready, come on in"
// Call it twice with two different names without await between the calls

// Watch what order the messages print. It will surprise you.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function checkIn(clientName){
    console.log(`${clientName} is checking in...`)
    await wait(1000)
    console.log(`${clientName} - seat ready, come on in`)
}

checkIn("Britton")
checkIn("Source")

// Q23 - I already rnan it before i moved up to quiz i, honest think thats your fault. I expeected it to come as Britton than Source still tho
//Q24 almost like typing a futinong and tell it that it will take time for something