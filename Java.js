const pokemonName = document.querySelector('.pokemon-name');
const pokemonId = document.querySelector('.pokemon-id');
const pokemonImage = document.querySelector('.pokemon-image');
const shinyButton = document.querySelector('.shiny-btn');
const pokemonDescription = document.querySelector('.pokemon-description');
const pokemonStats = document.querySelector('.stats ul');
const evolutionStages = document.querySelectorAll('.evolution-stage img');
const moveName = document.querySelector('.move-name');
const moveType = document.querySelector('.move-type');
const moveStats = document.querySelector('.moves ul');
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-btn');

let currentPokemonId = 2; // Starting with Ivysaur
let isShiny = false;

async function fetchPokemon(idOrName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    const pokemon = await response.json();
    const speciesResponse = await fetch(pokemon.species.url);
    const species = await speciesResponse.json();

    updatePokedex(pokemon, species);
}

async function updatePokedex(pokemon, species) {
    currentPokemonId = pokemon.id; // Actualizar currentPokemonId con el Pokémon buscado
    const spanishFlavorText = species.flavor_text_entries.find(entry => entry.language.name === 'es');
    
    pokemonName.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    pokemonId.textContent = `no. ${pokemon.id}`;
    pokemonImage.src = isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default; // Mostrar imagen normal o shiny según el estado
    pokemonDescription.textContent = spanishFlavorText ? spanishFlavorText.flavor_text : "Descripción no disponible en español.";

    pokemonStats.innerHTML = `
        <li>PS: ${pokemon.stats[0].base_stat}</li>
        <li>Ataque: ${pokemon.stats[1].base_stat}</li>
        <li>Defensa: ${pokemon.stats[2].base_stat}</li>
        <li>Ataque Especial: ${pokemon.stats[3].base_stat}</li>
        <li>Defensa Especial: ${pokemon.stats[4].base_stat}</li>
        <li>Velocidad: ${pokemon.stats[5].base_stat}</li>
    `;

    // Update types
    document.querySelector('.type-container').innerHTML = pokemon.types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const typeClass = typeName === 'grass' ? 'grass' : typeName === 'poison' ? 'poison' : '';
        return `<div class="type ${typeClass}">${typeName.charAt(0).toUpperCase() + typeName.slice(1)}</div>`;
    }).join('');

    // Update evolutions
    const evolutionChainResponse = await fetch(species.evolution_chain.url);
    const evolutionChain = await evolutionChainResponse.json();
    const evolutionData = getEvolutionData(evolutionChain.chain);
    
    for (let i = 0; i < evolutionStages.length; i++) {
        if (i < evolutionData.length) {
            const evo = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionData[i].name}`);
            const evoData = await evo.json();
            evolutionStages[i].src = evoData.sprites.front_default;
            evolutionStages[i].nextElementSibling.textContent = evolutionData[i].name;
        } else {
            evolutionStages[i].src = '';
            evolutionStages[i].nextElementSibling.textContent = '';
        }
    }

    // Update moves
    const movesList = await getMovesInSpanish(pokemon.moves.slice(0, 5));
    moveStats.innerHTML = movesList;
}

async function getMovesInSpanish(moves) {
    const movesList = await Promise.all(moves.map(async (moveInfo) => {
        const moveResponse = await fetch(moveInfo.move.url);
        const moveData = await moveResponse.json();
        const spanishMove = moveData.names.find(name => name.language.name === 'es');
        return `<li>${spanishMove ? spanishMove.name : moveInfo.move.name}</li>`;
    }));
    return movesList.join('');
}

function getEvolutionData(chain, evoData = []) {
    if (chain.species) {
        evoData.push({ name: chain.species.name });
    }
    if (chain.evolves_to.length > 0) {
        if (chain.evolves_to.length === 1) {
            getEvolutionData(chain.evolves_to[0], evoData);
        } else if (chain.evolves_to.length === 2) {
            evoData.push({ name: chain.evolves_to[0].species.name });
            evoData.push({ name: chain.evolves_to[1].species.name });
        }
    }
    return evoData;
}

shinyButton.addEventListener('click', () => {
    isShiny = !isShiny;
    fetchPokemon(currentPokemonId); 
});

prevButton.addEventListener('click', () => {
    if (currentPokemonId > 1) {
        currentPokemonId--;
        isShiny = false; 
        fetchPokemon(currentPokemonId);
    }
});

nextButton.addEventListener('click', () => {
    currentPokemonId++;
    isShiny = false; 
    fetchPokemon(currentPokemonId);
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        isShiny = false; 
        fetchPokemon(searchTerm);
    }
});

fetchPokemon(currentPokemonId);





