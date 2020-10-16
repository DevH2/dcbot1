require('dotenv').config();

const Discord = require('discord.js');
const botClient = new Discord.Client({disableEveryone:true});
const TOKEN = process.env.TOKEN;
var inlineStatus = true;

const PREFIX = '>';
//change this later and download get json value from npm
const CURRENT_VERSION = '1.0.0';
const NAME = 'GoodSuggestions';
const PFP_LINK = 'https://codehs.com/uploads/30b2789baa3f62c94da34ec5bf1c4f1b';
var queue = new Map();

//const ffmpeg = require("ffmpeg");
const youtubeDownloader = require('ytdl-core');
botClient.login(TOKEN);

botClient.once('ready', () => {console.info(`Logged in as ${botClient.user.tag}!`)});
//Commands
botClient.on('message', msg =>{
  if(!msg.content.startsWith(PREFIX) || msg.author.bot) return;
  
  let args = msg.content.substring(PREFIX.length).split(" ");
  switch(args[0]){
    case 'ping':
      msg.channel.send("You got played.");
      break;
    case 'syk':
      msg.channel.send("P.");
      break;
    case 'info':
      if(args[1] === "-v"){
        msg.channel.send(`Version ${CURRENT_VERSION}`);
      } else {
        msg.channel.send(`Unknown command. Type >help to view commands ${msg.author}.`);
      }
      break;
    case 'help': 
      const helpEmbed = new Discord.MessageEmbed()
        .setAuthor(NAME + " Help", PFP_LINK )
        .setColor('BLACK')
        .addFields(
          {name: "Commands", value: " ----------" }
        );
      msg.channel.send(helpEmbed);
      break;
    case 'clear': 
      if(!args[1]) return msg.channel.send("Error.")
      msg.channel.bulkDelete(args[1]);
      break;
    case 'server':
      const serverEmbed = new Discord.MessageEmbed()
        .setTitle("Server Info")
        .setColor('DARK_GOLD')
        //.setDescription("A server made up of friends who like to play games.")
        .setThumbnail(msg.guild.iconURL())
        .setImage(msg.author.avatarURL({dynamic: true}))
        //.setDescription("How is the weather?")
        .addFields(
          {name: "Name", value: msg.guild.name},
          {name: "Owner", value: msg.guild.owner, inline: inlineStatus},
          {name: "Member count", value: msg.guild.memberCount, inline: inlineStatus},
          {name: "Username", value: msg.author.username},
          {name: "Nickname", value: msg.member.displayName},
        )
      msg.channel.send(serverEmbed);
      break;
    case 'play':
      break;
    case 'stop':
      break;
    
    default: 
      msg.channel.send(`Unknown command. type ${PREFIX}help to view commands ${msg.author}.`);
      break;
  }
});

//Youtube
botClient.on('message', async message => {
  if(!message.content.startsWith(PREFIX) || message.author.bot) return;
  let args = message.content.substring(PREFIX.length).split(" ");

  if(message.content.startsWith(`${PREFIX}play`) || message.content.startsWith(`${PREFIX}p`)){
    if(!args[1].includes("https")) return message.channel.send("Please enter a proper URL");
    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) return message.channel.send(`You are not in a voice channel ${message.author}.`);
    const perms = voiceChannel.permissionsFor(message.client.user);

    if(!perms.has('CONNECT')) return message.channel.send("I do not have permission to connect to this voice channel.");
    if(!perms.has('SPEAK')) return message.channel.send("I do not have permission to speak in this voice channel.");

    try {
      var connection = await voiceChannel.join();
    } catch(error) {
      console.log("There was an error in connecting to the voice channel.");
      return message.channel.send('There was an error in connecting to the voice channel.');
    }

    const dispatcher = connection.play(youtubeDownloader(args[1], {quality: 'highestaudio', highWaterMark: 1 << 25}))
    .on('finish', () => {
      voiceChannel.leave();
    })
    .on('error', error => {
      console.log(error);
    })

    dispatcher.setVolumeLogarithmic(5 / 5);
  } else if(message.content.startsWith(`${PREFIX}stop`)) {
    if(!message.member.voice.channel) return message.channel.send(`You are not in a voice channel ${message.author}.`);
    return message.member.voice.channel.leave();
  }
});
