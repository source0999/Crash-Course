// service calculator

// function getServicePrice(serviceName){
//     if (serviceName === "fade"){
//         return 35
//     }else if(serviceName === "facial"){
//         return 65;
//     }else{
//         return 0;
//     }
// }

const getServicePrice = (serviceName) =>{
    if (serviceName === "fade"){
        return 35
    }else if (serviceName === "facial"){
        return 65
    }else{
        return 0
    }
}

const haircut = getServicePrice("fade")
const facial = getServicePrice("facial")
const unknown = getServicePrice("Manicure")

console.log(`Fade: ${haircut}`)
console.log(`Facial: ${facial}`)
console.log(`Unknown service: ${unknown}`)