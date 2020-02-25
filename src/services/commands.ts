import {injectable} from "inversify";
import {SPECIES, Gender} from "../damage-calc/data/species";
import {Pokemon} from "../damage-calc/pokemon";
import {Generation} from "../damage-calc/gen";
import {Move} from '../damage-calc/move';
import {calculate} from "../damage-calc/calc";
import {StatsTable} from "../damage-calc/stats";
import {GameType, Terrain, Weather, Field} from "../damage-calc/field";
import * as fs from 'fs';
import { stringify } from "querystring";

//capitalize the first letter of every word in a string
function titleCase(str: string): string {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
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

    public savePokemonTeam(inputString: string, username: string): string{
        var outputstring: string = ''
        let splitTeam = inputString.split('\n\n');
        splitTeam.forEach(poke => {
            outputstring = outputstring + this.savePokemon(poke, username)+'\n';
        });
        return(outputstring);
    }

    public removePokemon(inputString: string, username: string) {
        inputString = titleCase(inputString);
        var filepath: string = './files/savedPokemon/'+username+'.json';
        var customPoke = {};
        if (fs.existsSync(filepath)){
            let rawdata = fs.readFileSync(filepath);
            customPoke = JSON.parse(rawdata.toString());
            if(customPoke.hasOwnProperty(inputString)){
                delete customPoke[inputString];
                fs.writeFileSync(filepath,JSON.stringify(customPoke));
                return(inputString+' has been removed from your saved pokemon');
            }
            else{
                return('ERROR: no saved pokemon named '+inputString+' could be found');
            }
        }
        else {
            return('ERROR: '+username+' has no saved pokemon');
        }
    }

    public damagecalc(inputString: string, username: string) {
        inputString = titleCase(inputString);
        let generation: Generation = 8;
        if (!inputString.includes('Vs')){
            return('ERROR: invalid syntax')
        }
        var filepath: string = './files/savedPokemon/'+username+'.json';
        //everything before the vs
        let attackerstring: string = inputString.substr(0,inputString.indexOf("Vs")-1);
        var attacker: Pokemon;
        var defender: Pokemon;
        var attack: Move;
        var attackerEV: number = 0;
        var attackerNature: string = 'neutral';
        var defenderEV: number = 0;
        var defenderNature: string = 'neutral';
        var HPEV: number = 0;
        var gametype: GameType = 'Doubles';
        var terrain: Terrain;
        var weather: Weather;
        var battlefield: Field;
        var attackerBoost: number = 0;
        var defenderBoost: number = 0;


        let attackersnips = attackerstring.split(" ");

        if(attackersnips[0].startsWith('+')) {
            attackerBoost = parseInt(attackersnips[0].substr(1));
            attackersnips.splice(0,1);
        }
        if(attackersnips[0].startsWith('-')) {
            attackerBoost = parseInt(attackersnips[0]);
            attackersnips.splice(0,1);
        }
        
        //pull custom pokemon and return string after pokemon
        if(attackersnips[0] == 'My'){
            //cut off the 'my'
            var attackername = attackersnips[1];
            attackersnips.splice(0,2);
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
            //pull evs and nature from front if exists
            if(/\d/.test(attackersnips[0])){
                if(attackersnips[0].includes("+")){
                    attackerNature = 'positive'
                }
                if(attackersnips[0].includes("-")){
                    attackerNature = 'negative'
                }
                attackerEV = parseInt(attackersnips[0].match(/(\d+)/)[0])
                attackersnips.splice(0,1)
            }
            //create attackerpokemon and give item
            var itemname: string = '';
            attackersnips.forEach(snip => {
                if(this.allPoke[this.gen][snip]){
                    attacker = new Pokemon(generation, snip, {level: 50, item: itemname.substr(0,itemname.length-1)});
                }
                else{
                    itemname = itemname + snip + " ";
                }
            });
            //cut out everything before the pokemon name and turn back into a normal string
            attackersnips.splice(0,attackersnips.indexOf(attacker.name)+1)
            
        }

        //combine string for move
        var movestring = attackersnips.join(" ")
        //TODO: check for Helping Hand, Power Spot and Battery
        attack = new Move(generation, movestring);

        //set attack EVs and nature based on move used and the +/- from the input
        if (attack.category == 'Physical'){
            attacker.evs.atk = attackerEV;
            if (attackerNature == 'positive'){
                attacker.nature = 'Adamant'
            }
            if (attackerNature == 'negative'){
                attacker.nature = 'Modest'
            }
            attacker.boosts.atk = attackerBoost;
        }
        if (attack.category == "Special"){
            attacker.evs.spa = attackerEV;
            if (attackerNature == 'positive'){
                attacker.nature = 'Modest'
            }
            if (attackerNature == 'negative'){
                attacker.nature = 'Adamant'
            }
            attacker.boosts.spa = attackerBoost;
        }

        //everythign after the vs
        let defenderstring: string = inputString.substr(inputString.indexOf("Vs")+3);
        let defendersnips = defenderstring.split(" ");

        if(attackersnips[0].startsWith('+')) {
            defenderBoost = parseInt(defendersnips[0].substr(1));
            defendersnips.splice(0,1);
        }
        if(defendersnips[0].startsWith('-')) {
            defenderBoost = parseInt(defendersnips[0]);
            defendersnips.splice(0,1);
        }
        

        if(defendersnips[0] == 'My'){
            //cut off the 'my'
            var defendername = defendersnips[1];
            defendersnips.splice(0,2)
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
            //pull evs and nature from front if exists
            if(defendersnips[0].includes('/')){
                if(defendersnips[0].includes("+")){
                    defenderNature = 'positive'
                }
                if(defendersnips[0].includes("-")){
                    defenderNature = 'negative'
                }               
                HPEV = parseInt(defendersnips[0].substr(0,defendersnips[0].indexOf("/")));
                defenderEV = parseInt(defendersnips[0].substr(defendersnips[0].indexOf("/")).match(/(\d+)/)[0]);
                defendersnips.splice(0,1)
            }
            //create defenderpokemon and give item
            itemname = '';
            defendersnips.forEach(snip => {
                if(this.allPoke[this.gen][snip]){
                    defender = new Pokemon(generation, snip, {level: 50, item: itemname});
                }
                else{
                    itemname = itemname + snip + " ";
                }
            });
            //cut out everything before the pokemon name and turn back into a normal string
            defendersnips.splice(0,defendersnips.indexOf(defender.name)+1)
        }
        //set defense/HP EVs and nature based on move used and the +/- from the input
        defender.evs.hp = HPEV;
        if (attack.category == 'Physical'){
            defender.evs.def = defenderEV;
            if (defenderNature == 'positive'){
                defender.nature = 'Lax'
            }
            if (defenderNature == 'negative'){
                defender.nature = 'Gentle'
            }
            defender.boosts.def = defenderBoost;
            
        }
        if (attack.category == "Special"){
            defender.evs.spd = defenderEV;
            if (defenderNature == 'positive'){
                defender.nature = 'Gentle'
            }
            if (defenderNature == 'negative'){
                defender.nature = 'Lax'
            }
            defender.boosts.spd = defenderBoost;
        }

        //combine string for field setting
        var fieldstring = defendersnips.join(" ")
        //set gametype (default to doubles)
        if (fieldstring.includes('Singles')){
            gametype = 'Singles'
        }
        else{
            gametype = 'Doubles'
        }

        //set terrain if included
        if(fieldstring.includes('Electric')){
            terrain = 'Electric'
        }
        if(fieldstring.includes('Grassy') || fieldstring.includes('Grass')){
            terrain = 'Grassy'
        }
        if(fieldstring.includes('Psychic')){
            terrain = 'Psychic'
        }
        if(fieldstring.includes('Misty')){
            terrain = 'Misty'
        }

        if(fieldstring.includes('Sand') || fieldstring.includes('Sandstorm')){
            weather = 'Sand'
        }
        if(fieldstring.includes('Sun')){
            weather = 'Sun'
        }
        if(fieldstring.includes('Rain')){
            weather = 'Rain'
        }
        if(fieldstring.includes('Hail')){
            weather = 'Hail'
        }
        if(fieldstring.includes('Harsh Sunshine')){
            weather = 'Harsh Sunshine'
        }
        if(fieldstring.includes('Heavy Rain')){
            weather = 'Heavy Rain'
        }
        if(fieldstring.includes('Strong Winds')){
            weather = 'Strong Winds'
        }

        battlefield = new Field({gameType: gametype, weather: weather, terrain: terrain, isGravity: fieldstring.includes("Gravity")});

        return calculate(generation, attacker, defender, attack, battlefield).desc();
    }
    public help(inputString: string): string{
        var returnString: string = "```Type !h [command] for a list of parameters for that command\nAvailable Commands:\n[s]ave\t[t]eam\t[r]emove\n[d]amage\t[p]okemon```";
        if (inputString == 's'){
            returnString = '```Save a custom pokemon: !s [SmogonOutput]\nPokemon will be saved under their nickname if it exists, otherwise they will be saved under their species name\nSaving a pokemon with the same nickname as an existing pokemon will overwrite that pokemon```'
        }
        if(inputString == 't'){
            returnString = '```Save multiple custom pokemon: !t [SmogonOutput]\nPokemon will be saved under their nickname if it exists, otherwise they will be saved under their species name\nSaving a pokemon with the same nickname as an existing pokemon will overwrite that pokemon```'
        }
        if(inputString == 'r'){
            returnString = '```Remove custom pokemon: !r [name]```'
        }
        if(inputString == 'd'){
            returnString = '```Perform Damage Calculation: !d [attackModifier] [attacker] [move] vs [defender] [field options]\nSaved attacker: My [name]\tGenerated Attacker: [defenseModifier][attackingEV](+/- nature) (item) [name]\nSaved defender: My [name]\tGenerated Defender: [HPEV]/[defendingEV](+/- nature) (item) [name]\nField options: single, double, electric, grassy, psychic, misty, sand, sun, rain, hail\nAttackingEV and DefendingEV are determined by the move being used(atk/def for physical, spa/spd for special)\nAttack/Defense Modifier should be denoted +1, +2, etc or -1, -2 etc\nNature should be denoted with either a plus or minus, the bot will assign the appropriate nature based on the move being used\nExample Input: !d +2 252+ Gyarados Fire blast vs 34/23+ Turtwig Grassy Rain\nReturns: 252+ SpA Gyarados Fire Blast vs. 34 HP / 23+ SpD Turtwig in Rain: 120-142 (89.5 - 105.9%) -- 56.3% chance to 2HKO after Grassy Terrain recovery```'
        }
        if(inputString == 'p'){
            returnString = '```Return types, EVs and Abilities of a pokemon: !p [species name]\n```'
        }
        return (returnString)
    }
}