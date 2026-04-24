const services = [
    "Fade - $35",
  "Beard Trim - $20",
  "Facial - $65",
  "Hot Shave - $45",
  "Kid's Cut - $25"
]

for (let i =0; i<services.length;i++){
    console.log(`${i + 1}. ${services[i]}`) 
}

console.log('---');

services.forEach((service)=>{
    console.log(service)
})

console.log('---')

console.log(services[services.length -1 ])

const services2 = [
  { name: "Fade", price: 35 },
  { name: "Facial", price: 65 },
  { name: "Beard Trim", price: 20 },
  { name: "Hot Shave", price: 45 },
  { name: "Kid's Cut", price: 25 }
]


//claude it looks like you did challenge 1 and two for me by mistake bro make sure ur double checking your lesson
// Challenge 1: use filter to get only services under $40
const affordable = services2.filter((service) => service.price < 40)
console.log("Affordable:", affordable)

// Challenge 2: use map to create an array of just the names
const names = services2.map((service) => service.name)
console.log("Names:", names)

// Challenge 3: YOU write this one
// Use filter + map chained together
// Get only services $40 or over, then format as "NAME: $PRICE"
const premium = services2
const x = premium.filter((service)=>service.price>= 40).map((service)=> `${service.name}: $${service.price}`)

console.log("Premium:", premium)
console.log(x)