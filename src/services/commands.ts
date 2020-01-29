import {injectable} from "inversify";
import {SPECIES, Gender} from "../damage-calc/data/species";
import {Pokemon} from "../damage-calc/pokemon";
import {Generation} from "../damage-calc/gen";
import {Move} from '../damage-calc/move';
import {calculate} from "../damage-calc/calc";
import {StatsTable} from "../damage-calc/stats"
import * as fs from 'fs';
import { stringify } from "querystring";

class SaveFile {
    name: string;
    pokemon: Pokemon;

    constructor(
        name: string,
        pokemon: Pokemon,
    ) {
        this.name = name;
        this.pokemon = pokemon;
    }
}

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
        
        var gender: string = '';
        var item: string = '';
        var name: string = '';
        var nickname: string = '';
        var ability: string = '';
        var level: string = '50';
        var shiny: string = '';
        var evs: string[] = ['0','0','0','0','0','0'];
        var nature: string = 'serious';
        var ivs: string[] = ['0','0','0','0','0','0'];
        var moves: string[] = [];

        var outputstring: string = '';
        //split input lines into
        var inputLines: string[] = inputString.split(/\r?\n/);
        //remove gender from firstline
        if (inputLines[0].includes('(M)')){
            inputLines[0] = inputLines[0].replace('(M)','');
            gender = 'male';
        }
        if (inputLines.includes('(F)')){
            inputLines[0] = inputLines[0].replace('(F)','');
            gender = 'female';
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
            nickname = name;
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
                level = line.substr(line.indexOf(':')+1);
            }
            if(line.startsWith('Shiny:')){
                shiny = 'yes'
            }
            if(line.startsWith('EVs:')){
                var snips: string[] = line.split('/');
                snips.forEach(snip => {
                    if(snip.includes('HP')){
                        evs[0] = snip.match(/(\d+)/)[0]
                        if (evs[0] == ''){
                            evs[0] = '0'
                        }
                    }
                    if(snip.includes('Atk')){
                        evs[1] = snip.match(/(\d+)/)[0]
                        if (evs[1] == ''){
                            evs[1] = '0'
                        }
                    }
                    if(snip.includes('Def')){
                        evs[2] = snip.match(/(\d+)/)[0]
                        if (evs[2] == ''){
                            evs[2] = '0'
                        }
                    }
                    if(snip.includes('SpA')){
                        evs[3] = snip.match(/(\d+)/)[0]
                        if (evs[3] == ''){
                            evs[3] = '0'
                        }
                    }
                    if(snip.includes('SpD')){
                        evs[4] = snip.match(/(\d+)/)[0]
                        if (evs[4] == ''){
                            evs[4] = '0'
                        }
                    }
                    if(snip.includes('Spe')){
                        evs[5] = snip.match(/(\d+)/)[0]
                        if (evs[5] == ''){
                            evs[5] = '0'
                        }
                    }
                });
            }
            if(line.includes('Nature')){
                nature = line.substr(0,line.indexOf(' '));
            }
            if(line.startsWith('IVs:')){
                var snips: string[] = line.split('/');
                snips.forEach(snip => {
                    if(snip.includes('HP')){
                        ivs[0] = snip.match(/(\d+)/)[0]
                        if (ivs[0] == ''){
                            ivs[0] = '0'
                        }
                    }
                    if(snip.includes('Atk')){
                        ivs[1] = snip.match(/(\d+)/)[0]
                        if (ivs[1] == ''){
                            ivs[1] = '0'
                        }
                    }
                    if(snip.includes('Def')){
                        ivs[2] = snip.match(/(\d+)/)[0]
                        if (ivs[1] == ''){
                            ivs[1] = '0'
                        }
                    }
                    if(snip.includes('SpA')){
                        ivs[3] = snip.match(/(\d+)/)[0]
                        if (ivs[1] == ''){
                            ivs[1] = '0'
                        }
                    }
                    if(snip.includes('SpD')){
                        ivs[4] = snip.match(/(\d+)/)[0]
                        if (ivs[1] == ''){
                            ivs[1] = '0'
                        }
                    }
                    if(snip.includes('Spe')){
                        ivs[5] = snip.match(/(\d+)/)[0]
                        if (ivs[1] == ''){
                            ivs[1] = '0'
                        }
                    }
                });
            }
            if(line.startsWith('-')){
                moves.push(line.substr(2));
            }
            
        });

        //make sure there are 4 moves even if blank for formatting
        for(var i=0;i<4-moves.length;){
            moves.push('');
        }
        
        //string to be injected into json object
        var newPoke: string = '{\
            "species" : "'+name+'",\
            "gender" : "'+gender+'",\
            "item" : "'+item+'",\
            "ability" : "'+ability+'",\
            "level" : "'+level+'",\
            "shiny" : "'+shiny+'",\
            "nature" : "'+nature+'",\
            "evs" : {\
                "hp" : "'+evs[0]+'",\
                "atk" : "'+evs[1]+'",\
                "def" : "'+evs[2]+'",\
                "spa" : "'+evs[3]+'",\
                "spd" : "'+evs[4]+'",\
                "spe" : "'+evs[5]+'"\
            },\
            "ivs" : {\
                "hp" : "'+ivs[0]+'",\
                "atk" : "'+ivs[1]+'",\
                "def" : "'+ivs[2]+'",\
                "spa" : "'+ivs[3]+'",\
                "spd" : "'+ivs[4]+'",\
                "spe" : "'+ivs[5]+'"\
            },\
            "moves" : {\
                "move1" : "'+moves[0]+'",\
                "move2" : "'+moves[1]+'",\
                "move3" : "'+moves[2]+'",\
                "move4" : "'+moves[3]+'"\
            }\
        }';

        var filepath: string = './files/savedPokemon/'+username+'.json';
        var customPoke = {};
        if (fs.existsSync(filepath)){
            let rawdata = fs.readFileSync(filepath);
            customPoke = JSON.parse(rawdata.toString());
            customPoke[nickname] = JSON.parse(newPoke)
        }
        else {
            customPoke[nickname] = JSON.parse(newPoke)
        }
      

        fs.writeFileSync(filepath,JSON.stringify(customPoke));

        //return that pokemon was saved
        return(nickname+' the '+name+' has been added to your saved pokemon');
    }

    public damagecalc(inputString: string, username: string) {
        let generation: Generation = 8;
        if (!inputString.includes('vs')){
            return('ERROR: invalid syntax')
        }
        var filepath: string = './files/savedPokemon/'+username+'.json';
        //everything before the vs
        let attackerstring: string = inputString.substr(0,inputString.indexOf("vs")-1);
        var attacker: Pokemon;
        var defender: Pokemon;
        
        //pull custom pokemon
        if(attackerstring.startsWith('my')){
            //cut off the 'my'
            attackerstring = attackerstring.substr(3);
            if(attackerstring.includes(' ')){
                var attackername = attackerstring.substr(0,attackerstring.indexOf(' '))
            }
            else{
                var attackername = attackerstring
            }
            if (fs.existsSync(filepath)){
                let rawdata = fs.readFileSync(filepath);
                let customPoke = JSON.parse(rawdata.toString());
                if(!customPoke.hasOwnProperty(attackername)){
                    return('ERROR: no custom pokemon named '+attackername)
                }
                let evs :StatsTable<number> = {hp: parseInt(customPoke[attackername]["evs"]["hp"]), atk: parseInt(customPoke[attackername]["evs"]["atk"]), def: parseInt(customPoke[attackername]["evs"]["def"]), spa: parseInt(customPoke[attackername]["evs"]["spa"]), spd: parseInt(customPoke[attackername]["evs"]["spd"]), spe: parseInt(customPoke[attackername]["evs"]["spe"])}
                let ivs :StatsTable<number> = {hp: parseInt(customPoke[attackername]["ivs"]["hp"]), atk: parseInt(customPoke[attackername]["ivs"]["atk"]), def: parseInt(customPoke[attackername]["ivs"]["def"]), spa: parseInt(customPoke[attackername]["ivs"]["spa"]), spd: parseInt(customPoke[attackername]["ivs"]["spd"]), spe: parseInt(customPoke[attackername]["ivs"]["spe"])}
                attacker = new Pokemon(generation, customPoke[attackername]["species"], {level: parseInt(customPoke[attackername]["level"]), item: customPoke[attackername]["item"], nature: customPoke[attackername]["nature"], ability: customPoke[attackername]["ability"], gender: customPoke[attackername]["gender"], evs: evs, ivs: ivs } )
                //remove attackername from string
                attackerstring = attackerstring.substr(attackername.length);
            }
            else {
                return('ERROR: you have no saved pokemon')
            }
        }
        //pull generic pokemon
        else{
            if(attackerstring.includes(' ')){
                var attackername = attackerstring.substr(0,attackerstring.indexOf(' '))
            }
            else{
                var attackername = attackerstring
            }
            attacker = new Pokemon(generation, attackername, {level: 50});
            //remove attackername from string
            attackerstring = attackerstring.substr(attackername.length);
        }

        //everythign after the vs
        let defenderstring: string = inputString.substr(inputString.indexOf("vs")+3);

        if(defenderstring.startsWith('my')){
            //cut off the 'my'
            defenderstring = defenderstring.substr(3);
            if(defenderstring.includes(' ')){
                var defendername = defenderstring.substr(0,defenderstring.indexOf(' '))
            }
            else{
                var defendername = defenderstring
            }
            if (fs.existsSync(filepath)){
                let rawdata = fs.readFileSync(filepath);
                let customPoke = JSON.parse(rawdata.toString());
                if(!customPoke.hasOwnProperty(defendername)){
                    return('ERROR: no custom pokemon named '+defendername)
                }
                let evs :StatsTable<number> = {hp: parseInt(customPoke[defendername]["evs"]["hp"]), atk: parseInt(customPoke[defendername]["evs"]["atk"]), def: parseInt(customPoke[defendername]["evs"]["def"]), spa: parseInt(customPoke[defendername]["evs"]["spa"]), spd: parseInt(customPoke[defendername]["evs"]["spd"]), spe: parseInt(customPoke[defendername]["evs"]["spe"])}
                let ivs :StatsTable<number> = {hp: parseInt(customPoke[defendername]["ivs"]["hp"]), atk: parseInt(customPoke[defendername]["ivs"]["atk"]), def: parseInt(customPoke[defendername]["ivs"]["def"]), spa: parseInt(customPoke[defendername]["ivs"]["spa"]), spd: parseInt(customPoke[defendername]["ivs"]["spd"]), spe: parseInt(customPoke[defendername]["ivs"]["spe"])}
                defender = new Pokemon(generation, customPoke[defendername]["species"], {level: parseInt(customPoke[defendername]["level"]), item: customPoke[defendername]["item"], nature: customPoke[defendername]["nature"], ability: customPoke[defendername]["ability"], gender: customPoke[defendername]["gender"], evs: evs, ivs: ivs } )
                //remove defendername from string
                defenderstring = defenderstring.substr(defendername.length);
            }
            else {
                return('ERROR: you have no saved pokemon')
            }
        }
        //pull generic pokemon
        else{
            if(defenderstring.includes(' ')){
                var defendername = defenderstring.substr(0,defenderstring.indexOf(' '))
            }
            else{
                var defendername = defenderstring
            }
            defender = new Pokemon(generation, defendername, {level: 50});
            //remove defendername from string
            defenderstring = defenderstring.substr(defendername.length);
        }
        let attack = new Move(generation, 'Fire Blast');

        return calculate(generation, attacker, defender, attack).desc();
    }
}