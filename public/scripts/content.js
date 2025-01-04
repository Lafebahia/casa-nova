fetch('/templates/navbar.html').then(response => response.text()).then(data => {
    document.getElementById('navbar-page').innerHTML = data;
});

fetch('/templates/footer.html').then(response => response.text()).then(data => {
    document.getElementById('footer-page').innerHTML = data;
});

function solicitarUber() {
    const latitude = -12.9053012;
    const longitude = -38.4883505;
    const nomeDoDestino = "Rua dos ferroviarios, 162, São João do Cabrito";
    const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${encodeURIComponent(nomeDoDestino)}`;
    location.href = url;
}

const eventDate = new Date("2025-04-13T00:00:00").getTime();

const countdownFunction = setInterval(function() {
    const now = new Date().getTime(); 
    const timeLeft = eventDate - now;  
    const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const daysElement = document.getElementById("days");
    if (daysElement) {
        daysElement.textContent = daysLeft;
    }
    if (timeLeft <= 0) {
        clearInterval(countdownFunction);
        document.getElementById("days").textContent = "É hoje!! 🎉";
    }
}, 1000);