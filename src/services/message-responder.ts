import {Message} from "discord.js";
import {PingFinder} from "./ping-finder";
import {inject, injectable} from "inversify";
import {TYPES} from "../types";
import { GetPokemon } from "./get-pokemon";

@injectable()
export class MessageResponder {
  private pingFinder: PingFinder;
  private getPokemon: GetPokemon;

  constructor(
    @inject(TYPES.PingFinder) pingFinder: PingFinder,
    @inject(TYPES.GetPokemon) getPokemon: GetPokemon
  ) {
    this.pingFinder = pingFinder;
    this.getPokemon = getPokemon;
  }
    

  handle(message: Message): Promise<Message | Message[]> {
    const command = message.content.substring(0,message.content.indexOf(' ')+1); //!command, used to determine which function to use
    const input = message.content.substring(message.content.indexOf(' ')+1); //the rest of the input, to be passed to the function
    if ((command == '!pokemon ') || (command == '!poke ') || (command == '!p ')){
      if (input.includes(' ')){
        return message.reply(this.getPokemon.getPokemonStats(input.substring(0,input.indexOf(' ')),input.substring(input.indexOf(' ')+1)))
      }
      else{
        return message.reply(this.getPokemon.getPokemonStats(input))
      }      
    }

    return Promise.reject();
  }
}