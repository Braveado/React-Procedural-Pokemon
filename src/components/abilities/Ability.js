import React from 'react'
import { TeamBuilderContext } from '../../context/TeamBuilderContext';
import SelectedPokemon from '../pokemon/SelectedPokemon';

export default function Ability({ability, index}) {
    const context = React.useContext(TeamBuilderContext);
    const selected = context.pokemonOptions.find(p => p.ability === index);

    const formatEffect = (effect) => {
        let formattedEffect = effect;
        // Adjust specific items.      
        switch(ability.name){
            case 'sand-stream':
            case 'drizzle':
            case 'snow-warning':
            case 'drought':
                formattedEffect = formattedEffect.replace('indefinitely', '5 turns');
                break;
            case 'aroma-veil':
                formattedEffect = formattedEffect.replace('allies', 'user and allies');
                break;
            case 'fur-coat':
                formattedEffect = formattedEffect.replace('damage', 'damage received');
                break;
            default:
                break;
        }           
        // Adjust general abilities.
        
        return formattedEffect;
    }

    const formattedEffect = ability.effect_entries.length > 0 ? formatEffect(ability.effect_entries.find(e => e.language.name === 'en').short_effect) : null;

    const getEffect = () => {        
        if(formattedEffect) {            
            return (
                <p className="text-center">
                    {formattedEffect} 
                </p>
            )            
        }
        else {
            return (
                <p className="text-center flex flex-col">
                    No available effect entries from PokeAPI.
                    <a onClick={(e) => e.stopPropagation()} href={`https://bulbapedia.bulbagarden.net/wiki/${ability.name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()).replace(/ /g, "_")}_(Ability)`} target="_blank" rel="noreferrer"
                        className="text-blue-400 hover:text-blue-500">
                        Check the ability in Bulbapedia.
                    </a>
                </p>
            )
        }
    }    

    return (
        <div className="animate-enter flex flex-col justify-start items-end">
            {/* <div className="flex w-full justify-start items-center">
                <p className="text-base">{!selected ? 'No ' : ''}Pokemon Assigned</p>
            </div> */}
            <div className={`flex flex-col gap-2 justify-start items-center rounded-md p-2 w-96 h-auto border-2 border-gray-200 transition duration-150 ease-in-out  
                ${selected ? 'border-green-200 ring ring-green-100' : ''}`}>            
                <SelectedPokemon assignable={{ability: index}} />
                <div className={`flex flex-col gap-2 justify-start items-center bg-white rounded-md p-2 w-full h-auto border-2 border-gray-200 transition duration-150 ease-in-out 
                    ${selected ? 'bg-green-100 border-green-200 ring ring-green-100' : ''}`}>
                    <div className="flex justify-center items-center w-full gap-2">
                        <p className="capitalize">{ability.name.replace(/-/g, " ")}</p>                
                    </div>            
                    <div className="flex flex-col justify-start items-center text-sm w-full" data-tip={formattedEffect} data-for={'dynamic'}>
                        {getEffect()}
                    </div>            
                </div>
            </div>
        </div>
    )
}
