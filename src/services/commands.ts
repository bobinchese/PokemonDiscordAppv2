import {injectable} from "inversify";
import {SPECIES} from "../damage-calc/data/species";
import {Pokemon} from "../damage-calc/pokemon"
import * as fs from 'fs';

@injectable()
export class PokeFunctions {

    private allPoke = SPECIES;
    private gen: number = 8;

    //read in pokemon name and optional generation and output the types, base stats and abilities of that pokemon
    public getPokemonStats(stringToSearch: string, genInput: string = '8'){
        //verify generation is a number, else ignore the variable and procede with the latest generation
        if (parseInt(genInput)){
            this.gen = parseInt(genInput);
        }
        //throw error if user inputs an invalid integer generation
        if (this.gen < 1 || this.gen > 8){
            return('ERROR: Generation '+this.gen+' is not a valid input')
        }
        //make sure the name is properly capitalized
        stringToSearch = stringToSearch.charAt(0).toUpperCase() + stringToSearch.slice(1).toLowerCase();
        //verify the pokemon exists in the generation used
        if(this.allPoke[this.gen][stringToSearch]){
            var returnString = "```"; //initialize for discord markdown
            //typing
            returnString = returnString.concat(stringToSearch,' \nType1: ',this.allPoke[this.gen][stringToSearch].t1,'\n');
            if (this.allPoke[this.gen][stringToSearch].t2){
                returnString = returnString.concat('Type2: ',this.allPoke[this.gen][stringToSearch].t2,'\n')
            }
            //base stats
            returnString = returnString.concat("HP: ",this.allPoke[this.gen][stringToSearch].bs.hp.toString(),'\t\t',);
            returnString = returnString.concat("ATK: ",this.allPoke[this.gen][stringToSearch].bs.at.toString(),'\t',);
            returnString = returnString.concat("DEF: ",this.allPoke[this.gen][stringToSearch].bs.df.toString(),'\n',);
            returnString = returnString.concat("SATK: ",this.allPoke[this.gen][stringToSearch].bs.sa.toString(),'\t',);
            returnString = returnString.concat("SDEF: ",this.allPoke[this.gen][stringToSearch].bs.sd.toString(),'\t',);
            returnString = returnString.concat("SPD: ",this.allPoke[this.gen][stringToSearch].bs.sp.toString(),'\n',);
            //ability if applicable
            if(this.allPoke[this.gen][stringToSearch].ab){
                returnString = returnString.concat("Ability: ",this.allPoke[this.gen][stringToSearch].ab);
            }
            returnString = returnString.concat("```") //discord markdown
            return (returnString);
        }
        //throw error for unknown pokemon
        else{
            return ("ERROR: "+stringToSearch+" is not a pokemon in Generataion "+this.gen)
        }
    }

    public savePokemon(inputString: string, username: string): string{
        //split input lines into
        var gender: string = '';
        var item: string = '';
        var name: string = '';
        var nickname: string = '';
        var ability: string = '';
        var level: string = '';
        var shiny: string = '';
        var evs: string[] = [];
        var ivs: string[] = [];
        var moves: string[] = [];

        var outputstring: string = '';
        var inputLines: string[] = inputString.split(/\r?\n/);
        //remove gender from firstline
        if (inputLines[0].includes('(M)')){
            inputLines[0] = inputLines[0].replace('(M)','');
            gender = 'M';
        }
        if (inputLines.includes('(F)')){
            inputLines[0] = inputLines[0].replace('(F)','');
            gender = 'F';
        }
        //remove item from firstline
        if (inputLines[0].includes('@')){
            item = inputLines[0].substr(inputLines[0].indexOf('@')+1);
            inputLines[0] = inputLines[0].substr(0,inputLines[0].indexOf('@'));
        }
        //remove name and nickname if applicable
        if (inputLines[0].includes('(')){
            nickname = inputLines[0].substr(0,inputLines[0].indexOf('(')-1);
            name = inputLines[0].substr(inputLines[0].indexOf('(')+1,inputLines[0].indexOf(')')-inputLines[0].indexOf('(')-1);
        }
        else{
            name = inputLines[0].trim();
        }

        //Fail if pokemon doesn't exist in this generation
        if (!this.allPoke[this.gen][name]){
            return ("ERROR: "+name+" is not a pokemon in Generataion "+this.gen);
        }

        //loop through the rest of the input array
        inputLines.forEach(line => {
            if(line.startsWith('Ability:')){
                ability = line.substr(line.indexOf(':')+1)
            }
            if(line.startsWith('Level:')){
                level = line.substr(line.indexOf(':')+1)
            }
            if(line.startsWith('Shiny:')){
                shiny = 'yes'
            }
            if(line.startsWith('EVs:')){
                var snips: string[] = line.split('/');
                snips.forEach(snip => {
                    if(snip.includes('HP')){
                        evs[0] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('Atk')){
                        evs[1] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('Def')){
                        evs[2] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('SpA')){
                        evs[3] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('SpD')){
                        evs[4] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('Spe')){
                        evs[5] = snip.match(/(\d+)/)[0]
                    }
                });
            }
            if(line.startsWith('IVs:')){
                var snips: string[] = line.split('/');
                snips.forEach(snip => {
                    if(snip.includes('HP')){
                        ivs[0] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('Atk')){
                        ivs[1] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('Def')){
                        ivs[2] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('SpA')){
                        ivs[3] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('SpD')){
                        ivs[4] = snip.match(/(\d+)/)[0]
                    }
                    if(snip.includes('Spe')){
                        ivs[5] = snip.match(/(\d+)/)[0]
                    }
                });
            }
            if(line.startsWith('-')){
                moves.push(line.substr(2));
            }
        });
        
        
        outputstring = 'gender: '+gender+'\nitem: '+item+'\nnickname: '+nickname+'\nname: '+name+'\nability: '+ability+'\nlevel: '+level+'\nshiny: '+shiny+'\nmoves: '+moves+'\nevs: '+evs+'\nivs: '+ivs+'\n\n';

        //write Pokemon to file
        fs.writeFile('./files/savedPokemon/'+username+'.txt',outputstring,{flag:'a+'},function (err) {
            if (err) throw err;
        })

        //return that pokemon was saved
        if (nickname != ''){
            return(nickname+' the '+name+' has been added to your saved pokemon');
        }
        else{
            return(name+' has been added to your saved pokemon');
        }

    }
}