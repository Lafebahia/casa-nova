fetch('/templates/navbar.html').then(response => response.text()).then(data => {
    document.getElementById('navbar-page').innerHTML = data;
});

fetch('/templates/footer.html').then(response => response.text()).then(data => {
    document.getElementById('footer-page').innerHTML = data;
});

function solicitarUber() {
    const latitude = -12.9053012;
    const longitude = -38.4883505;
    const nomeDoDestino = "São João do Cabrito";
    const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${encodeURIComponent(nomeDoDestino)}`;
    window.open(url, '_blank');
}