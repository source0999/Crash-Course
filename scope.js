// Create scope.js in crash-course. I'm giving you the goal, not the code:
// Build a makeBookingCounter function that:

// Starts a booking count at 0
// Returns a function that when called, increases the count by 1 and logs "Booking #N confirmed" where N is the current count
// The count variable must not be accessible from outside

function bookingCounter(){
    let count = 0;
    return function(){
        count = count+1;
        return count
    }
}


// Test it by calling the returned function 3 times and verifying it prints Booking #1, #2, #3.
// No starter code. Write it yourself based on the closure example above.
const counter = bookingCounter();
console.log(`Booking #${counter()} confirmed!`)
console.log(`Booking #${counter()} confirmed!`)
console.log(`Booking #${counter()} confirmed!`)


//-q22 40 and 10, const x is inside and outside a funtion w differnt values
const x = 10

function double() {
  const x = 20
  return x * 2
}

console.log(double())
console.log(x)