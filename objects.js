const shop = {
  name: "Fades & Facials",
  owner: "Marcus",
  address: "123 Main St",
  isOpen: true,
  services: [
    { id: 1, name: "Fade", price: 35 },
    { id: 2, name: "Facial", price: 65 },
    { id: 3, name: "Beard Trim", price: 20 }
  ]
}

//you know you call actualyl tell me to do this stuff instead of giving me all the answers

// 1. Log the shop name
console.log(shop.name)

// 2. Log the price of the second service
console.log(shop.services[1].price)

// 3. Loop over all services and print each one
shop.services.forEach((service) => {
  console.log(`${service.name}: $${service.price}`)
})

// 4. Destructure name and owner from shop
const { name, owner } = shop
console.log(`${name} is owned by ${owner}`)

// 5. YOUR TURN — use filter to get only services over $30
//    then use map to return just their names
//    store the result in a variable called featuredNames
//    and log it
const featuredNames = shop.services.filter((service)=>service.price > 30).map((service)=>service.name)

console.log(featuredNames)