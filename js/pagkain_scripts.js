console.log("Jhoven's Tambayan Pagkain Scripts - Order Na, Gutom na si Mayor!");

document.addEventListener('DOMContentLoaded', () => {
    const orderButtons = document.querySelectorAll('.food-item-card .order-button');

    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.food-item-card');
            const itemNameElement = card.querySelector('h4');
            // Extract text content, then remove any child elements like badges
            let itemName = itemNameElement.childNodes[0].nodeValue.trim(); 
            if (itemNameElement.querySelector('.chef-pick-badge')) {
                // If there's a badge, the text might be split, find the main name
                itemName = Array.from(itemNameElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || itemNameElement.textContent.replace("Jhoven's Pick!", "").trim();
            }
            
            const itemPrice = card.querySelector('.price').textContent;
            
            // Fun alert message
       const tambayMessages = [
    "Sige, noted 'yan! Papaluto na ni Jhoven!",
    "Order received! Sana may pang-bayad ka, LOL!",
    "Solid choice, Paps! Darating na 'yan maya-maya konti (baka bukas).",
    "Chibugan na! Approved 'yang order mo!",
    "Nice one! Padating na ang grasya!",
    "Ayos! Dumadagundong na ang kawali para sa'yo!",
    "Legit 'to! Antay-antay lang, chef is on fire!",
    "Grabe, premium pick 'yan ha! Coming right up!",
    "Kalma lang, masterchef mode na si Kuya Jhoven!",
    "Boom! G na G kami sa luto para sa'yo!",
    "Sarap n'yan! Hintay lang konti, iniinit pa ang mantika!",
    "Aba, sosyalin ang order mo ah! On the way na!",
    "Nice, mukhang gutom ka na talaga. Chill, luto time na!",
    "Bilis ng kamay ni chef para sa order mong 'yan!",
    "Certified tambay classic ang order mo!",
    "Uy, ikaw na! Pa-star ka kay chef ha!",
    "Pre, parang last meal na 'yan ah! Todo luto kami!",
    "Nag-vibrate ang kaldero sa excitement, Paps!",
    "Good luck sa diet mo after nito, hehe!",
    "Game na! Ihahain 'yan with extra pagmamahal!"
];
            const randomMessage = tambayMessages[Math.floor(Math.random() * tambayMessages.length)];

            alert(`ORDERED (CONCEPTUALLY):\n${itemName} - ${itemPrice}\n\n${randomMessage}`);
            
            // Visual feedback for the button
            this.innerHTML = '<i class="fas fa-check-circle"></i> Ordered!';
            this.disabled = true;
            this.classList.add('ordered-success'); // Add a class for styling

            setTimeout(() => {
                this.innerHTML = 'Order Again?';
                this.disabled = false;
                this.classList.remove('ordered-success');
            }, 4000); // Reset after 4 seconds
        });
    });

    // Conceptual "Today's Special" Updater
    const specialDishNameElement = document.getElementById('specialDishName');
    if (specialDishNameElement) {
        const allDishNames = [];
        document.querySelectorAll('.food-item-card h4').forEach(h4 => {
            let dishName = Array.from(h4.childNodes).find(node => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || h4.textContent.replace("Jhoven's Pick!", "").trim();
            if(dishName) allDishNames.push(dishName);
        });

        if (allDishNames.length > 0) {
            const randomSpecial = allDishNames[Math.floor(Math.random() * allDishNames.length)];
            specialDishNameElement.textContent = randomSpecial + "!";
        }
    }
});

// Add to global.css or here if specific to this page:
// .ordered-success {
//     background-color: #28a745 !important; /* Green for success */
//     color: #fff !important;
//     border-color: #28a745 !important;
//     box-shadow: 0 0 10px #28a745 !important;
//     cursor: default !important;
// }
// .ordered-success:hover {
//     background-color: #218838 !important;
// }