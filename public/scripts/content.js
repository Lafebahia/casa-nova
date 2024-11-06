fetch('/templates/navbar.html').then(response => response.text()).then(data => {
    document.getElementById('navbar-page').innerHTML = data;
});

fetch('/templates/footer.html').then(response => response.text()).then(data => {
    document.getElementById('footer-page').innerHTML = data;
});