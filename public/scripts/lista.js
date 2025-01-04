document.addEventListener("DOMContentLoaded", fetchItems);

async function fetchItems() {
    const response = await fetch("/get-items");
    const items = await response.json();
    mostrarLista(items);
  }

async function updatePessoaPresente(id, pessoa) {
    const response = await fetch(`/set-item/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoa }),
    });
    if(response.ok) {
        fetchItems();
    } else {
        alert("Ocorreu uma falha ao incluir o presenteador");
    }
}

function mostrarLista(items) {
    const listContainer = document.getElementById("lista-principal");
    listContainer.innerHTML = ""; // Limpa a lista atual

    items.forEach(({ id, descricao, nome_pessoa }) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item p-4 rounded-0";
        listItem.style = "background-color: rgba(255, 255, 255, 0.6);";

        const div = document.createElement("div");
        div.className = "d-flex w-100 justify-content-between text-uppercase";

        const itemDescricao = document.createElement("h5");
        itemDescricao.className = "mb-1";
        itemDescricao.textContent = descricao;

        let itemPessoa;
        if (nome_pessoa) {
            itemPessoa = document.createElement("p");
            itemPessoa.className = "mb-1 text-muted";
            itemPessoa.textContent = nome_pessoa;
        } else {
            itemPessoa = document.createElement("button");
            itemPessoa.className = "btn btn-secondary rounded-0";
            itemPessoa.textContent = "Escolher";
            itemPessoa.addEventListener("click", () => {
                // Aqui você pode definir uma função para lidar com o clique, como abrir um modal para definir a quantidade
                const presenteador = prompt(`Digite aqui o nome do presentiador:`);
                if (presenteador) {
                    updatePessoaPresente(id, presenteador);
                }
            });
        }

        // Adiciona h5 e p dentro da div, e a div dentro do listItem
        div.appendChild(itemDescricao);
        div.appendChild(itemPessoa);
        listItem.appendChild(div);

        // Adiciona o item na lista
        listContainer.appendChild(listItem);
        listContainer.appendChild(listItem);
    });
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