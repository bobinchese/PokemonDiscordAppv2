import {Message} from "discord.js";
import {PingFinder} from "./ping-finder";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import { PokeFunctions } from "./commands";

@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;
  private pokeFunctions: PokeFunctions;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder,
    @inject(TYPES.PokeFunctions) pokeFunctions: PokeFunctions
  ) {
    this.pingFinder = pingFinder;
    this.pokeFunctions = pokeFunctions;
  }
    

  handle(message: Message): Promise<Message | Message[]> {
    //help is the only command that doesn't necessitate a followup string so it has to get handled up here
    if((message.content == '!help') || (message.content == '!h')){
      return message.reply(this.pokeFunctions.help(''))
    }
    const command = message.content.substring(0,message.content.indexOf(' ')+1); //!command, used to determine which function to use
    const input = message.content.substring(message.content.indexOf(' ')+1); //the rest of the input, to be passed to the function
    if ((command == '!pokemon ') || (command == '!poke ') || (command == '!p ')){
      if (input.includes(' ')){
        return message.reply(this.pokeFunctions.getPokemonStats(input.substring(0,input.indexOf(' ')),input.substring(input.indexOf(' ')+1)))
      }
      else{
        return message.reply(this.pokeFunctions.getPokemonStats(input))
      }      
    }
    if((command == '!save ') || (command == '!s ')){
      return message.reply(this.pokeFunctions.savePokemon(input,message.author.username))
    }
    if((command == '!team ') || (command == '!t ')){
      return message.reply(this.pokeFunctions.savePokemonTeam(input,message.author.username))
    }
    if((command == '!damage ') || (command == '!d ') || (command == '!damagecalc ')){
      return message.reply(this.pokeFunctions.damagecalc(input, message.author.username))
    }
    if((command == '!remove ') || (command == '!r ')){
      return message.reply(this.pokeFunctions.removePokemon(input, message.author.username))
    }
    if((command == '!help ') || (command == '!h ')){
      return message.reply(this.pokeFunctions.help(input))
    }
    return Promise.reject();
  }
}