document.addEventListener("DOMContentLoaded", fetchItems);

document.getElementById("presente-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const descricao = document.getElementById("descricao").value;
  const pessoa = document.getElementById("pessoa").value;

  const response = await fetch("/add-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao, pessoa }),
  });

  if (response.ok) {
    document.getElementById("descricao").value = "";
    document.getElementById("pessoa").value = "";
    fetchItems(); // Atualiza a lista em tempo real
  } else {
    alert("Erro ao adicionar item.");
  }
});

// Função para buscar os itens e atualizar a lista
async function fetchItems() {
  const response = await fetch("/get-items");
  const items = await response.json();

  const listContainer = document.getElementById("presente-list");
  listContainer.innerHTML = ""; // Limpa a lista atual

  items.forEach(({ descricao, nome_pessoa }) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
    listItem.textContent = `Presente: ${descricao} | Presentiador: ${nome_pessoa}`;
    listContainer.appendChild(listItem);
  });
}
