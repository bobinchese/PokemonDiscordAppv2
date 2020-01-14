import {injectable} from "inversify";
import {SPECIES} from "../damage-calc/data/species";

@injectable()
export class GetPokemon {

    private allPoke = SPECIES;
    private gen: number;

    public getPokemonStats(stringToSearch: string, genInput: string = '8'){
        //verify generation is a number, else ignore the variable and procede with the latest generation
        this.gen = 8
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
}