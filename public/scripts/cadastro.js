document.addEventListener("DOMContentLoaded", fetchItems);

document.getElementById("presente-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("item-id").value;
  const descricao = document.getElementById("descricao").value;
  const pessoa = document.getElementById("pessoa").value;

  const url = id ? `/set-item/${id}` : "/add-item";
  const method = id ? "PUT" : "POST";

  const response = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descricao, pessoa }),
  });

  if (response.ok) {
    limparForm();
    fetchItems(); // Atualiza a lista em tempo real
  } else {
    alert("Erro ao adicionar item.");
  }
});

// Função para buscar os itens e atualizar a lista
async function fetchItems() {
  const response = await fetch("/get-items");
  const items = await response.json();
  mostrarLista(items);
}

function mostrarLista(items) {
  const listContainer = document.getElementById("presente-list");
  listContainer.innerHTML = ""; // Limpa a lista atual
  items.forEach(({ id, descricao, nome_pessoa }) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between align-items-center";

    const textContent = document.createElement("span");
    textContent.textContent = `Presente: ${descricao} | Presentiador: ${nome_pessoa}`;
    listItem.appendChild(textContent);

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "btn-group";
    buttonGroup.role = "group";

    const editButton = document.createElement("button");
    editButton.className = "btn btn-sm btn-warning rounded-0";

    const iconEdit = document.createElement("i");
    iconEdit.className = "bi bi-pencil-square";
    editButton.appendChild(iconEdit);

    editButton.onclick = () => editItem(id, descricao, nome_pessoa);
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-sm btn-danger rounded-0";

    const iconDelete = document.createElement("i");
    iconDelete.className = "bi bi-trash";
    deleteButton.appendChild(iconDelete);

    deleteButton.onclick = () => deleteItem(id);
    buttonGroup.appendChild(deleteButton);

    listItem.appendChild(buttonGroup); 
    listContainer.appendChild(listItem);

  });
}

function importarArquivo() {
  const inputArquivo = document.getElementById("arquivoItens");
  if (inputArquivo.files.length === 0) {
      alert("Selecione um arquivo para importação");
      return;
  }

  const arquivo = inputArquivo.files[0];
  const leitor = new FileReader();

  leitor.onload = function(evento) {
      const conteudo = evento.target.result;
      processarConteudo(conteudo);
  };
  leitor.onerror = function() {
      console.error("Erro ao ler o arquivo.");
  };
  leitor.readAsText(arquivo);
  document.getElementById("arquivoItens").value = "";
  alert("Lista importada com sucesso.");
}

function processarConteudo(conteudo) {
  const linhas = conteudo.split("\n").filter(linha => linha.trim() !== "");
  console.log(linhas)
  linhas.forEach(linha => {
    const [descricao, pessoa] = linha.split(",").map(part => part?.trim() || null);
    if (descricao) {
      fetch("/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, pessoa: pessoa || "" }),
      });
    }
  });
  fetchItems();
}

function editItem(id, descricao, pessoa) {
  document.getElementById("item-id").value = id;
  document.getElementById("descricao").value = descricao;
  document.getElementById("pessoa").value = pessoa;
  document.querySelector("button[type='submit']").textContent = "Atualizar Item";
}

async function deleteItem(id) {
  if (confirm("Tem certeza que deseja excluir este item?")) {
    const response = await fetch(`/delete-item/${id}`, { method: "DELETE" });
    if (response.ok) {
      alert("Item excluído com sucesso!");
      fetchItems();
    } else {
      alert("Erro ao excluir o item.");
    }
  }
}

function limparForm() {
  document.getElementById("item-id").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("pessoa").value = "";
  document.querySelector("button[type='submit']").textContent = "Adicionar Item";
}

async function ordenarListaDisponiveis() {
  const response = await fetch("/get-items");
  const items = await response.json();
  items.sort((a, b) => {
      if (a.nome_pessoa === "" && b.nome_pessoa !== "") {
          return -1; 
      }
      if (a.nome_pessoa !== "" && b.nome_pessoa === "") {
          return 1; 
      }
      return 0;
  });
  mostrarLista(items);
}