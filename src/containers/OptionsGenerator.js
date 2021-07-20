import React, {useState, useEffect} from 'react';
import axios from 'axios';
import PokemonOptions from '../components/PokemonOptions';

export default function OptionsGenerator() {
  // Constants.
  const apiUrl = 'https://pokeapi.co/api/v2/';
  const pokemonCount = 898;
  const randomRolls = {
    pokemons: 9,
    movesets: 6,
    moves: 6,
    abilities: 9,
    items: 9
  };
  const varietiesFilter = [ // Exclude pokemons with this keywords.
    // Legendaries: forms outside the 600-700 total stats.
    'black', 'white', 'primal', '10', 'complete', 'ultra', 'crowned', 'eternamax',
    // Normal: stronger/weaker forms.
    'mega', 'eternal', 'totem', 'ash', 'solo', 'gmax'
  ];

  // State.
  const [pokemonList, setPokemonList] = useState([]);
  const [pokemonOptions, setPokemonOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pokemonList from api on mount.
  useEffect(() => {
    let cancel = false;
    setLoading(true);  

    async function fetchData() {      
      const result = await axios.get(`${apiUrl}pokemon?limit=${pokemonCount}`);
      if(!cancel)
        setPokemonList(result.data.results);
    };
    fetchData();

    setLoading(false);
    return () => cancel = true;
  }, []);

  // Get a new set of options.
  async function generateOptions() {
    await getPokemonOptions();
  }

  // Geta set of pokemon options.  
  async function getPokemonOptions() {
    setLoading(true);
    
    if(pokemonList.length) {           
      let pokemons = [];      
      setPokemonOptions(pokemons); 

      for (let index = 0; index < randomRolls.pokemons; index++) {
        const pokemon = await getNewPokemon(pokemons)
        pokemons.push(pokemon);
        setPokemonOptions([...pokemons]); 
      }                 
    }   
     
    setLoading(false);
  }

  // Get a new pokemon option.
  async function getNewPokemon(currentPokemons) {    
    let done = false;
    let newPokemonName = '';

    do {                
        let pokemon = pokemonList[Math.floor(Math.random()*pokemonList.length)];
        console.log('initial: '+pokemon.name);

        const initialPokemon = await axios.get(`${apiUrl}pokemon/${pokemon.name}`);
        const species = await axios.get(initialPokemon.data.species.url);
        const evolutions = await axios.get(species.data.evolution_chain.url);
        
        // Get an array of evolutions.
        let evoChain = [];
        let evoData = evolutions.data.chain;
        do {            
            evoChain.push(evoData.species.name);            
            let numberOfEvolutions = evoData['evolves_to'].length;  
                      
            if(numberOfEvolutions > 1) {
                let species = []
                for (let i = 0; i < numberOfEvolutions; i++) { 
                    species.push(evoData.evolves_to[i].species.name);
                }
                evoChain.push(species);                
                evoData = null;
            }
            else {                
                evoData = evoData['evolves_to'][0];
            }
                      
        } while (!!evoData && evoData.hasOwnProperty('evolves_to')); 
        console.log('evolutions: '+evoChain);       
        
        // Get the/a final evolution.
        let finalEvolution = evoChain[evoChain.length - 1];
        if(Array.isArray(finalEvolution)){
          finalEvolution = finalEvolution[Math.floor(Math.random()*finalEvolution.length)];        
        }
        console.log('final evolution: '+finalEvolution);

        // Get the varieties for the final evolution.
        const finalSpecies = await axios.get(`${apiUrl}pokemon-species/${finalEvolution}`);
        let varieties = [];
        finalSpecies.data.varieties.forEach((v, i) => {
          varieties.push(finalSpecies.data.varieties[i].pokemon.name)
        });                
        console.log('final evolution varieties: '+varieties);

        // Filter varieties for more balance.
        varieties = varieties.filter(v => {          
          return !v.split('-').some(keyword => varietiesFilter.includes(keyword))
        });
        console.log('filtered varieties: '+varieties);        

        // Get the final pokemon from the varieties.
        let finalPokemon = varieties[Math.floor(Math.random()*varieties.length)];
        console.log('final pokemon: '+finalPokemon);

        if(!currentPokemons.find(p => p.name === finalPokemon)) {
          newPokemonName = finalPokemon;          
          done = true;      
          console.log('-----not duplicated: next-----');
        }
        else {
          console.log('-----DUPLICATED: REROLL-----');
        }
    } while (!done)    
    const newPokemon = await axios.get(`${apiUrl}pokemon/${newPokemonName}`);
    return newPokemon.data
  };  

  // Render.
  return (  
    <div className="flex flex-col justify-start items-center w-full p-8">
        <button 
          type="button" disabled={loading} onClick={generateOptions}
          className="bg-gray-900 text-white w-48 p-4 rounded-md hover:bg-gray-600"
        >
          {!loading ? 'Generate Options' : 'Generating...'}
        </button>
        <div className="flex flex-col justify-center items-center m-8">            
          <PokemonOptions options={pokemonOptions} />
        </div>      
    </div>     
  );
}
