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
var queueMap = new Map();

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
    case 'kys':
      msg.channel.send("Put a hairdryer in a bathtub.");
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
          {name: "Commands", value: "Devin make an html file later and put in dropbox to get a public link \n >help;>info -v;-ping;-kys;play/p;stop. \n Figure out what they do on your own. " }
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
botClient.on('message', async message =>{
  if(!message.content.startsWith(PREFIX) || message.author.bot) return;
  let args = message.content.substring(PREFIX.length).split(" ");
  let songQueue = queueMap.get(message.guild.id);

  if(args[1] == 'play'){
    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) return message.channel.send("You are not in a voice channel.");

    const perms = voiceChannel.permissionsFor(message.client.user);
    if(!perms.has('CONNECT')) return message.channel.send("I do not have permission to connect to the voice channel.");
    if(!perms.has('SPEAK')) return message.channel.send("I do not have permission to speak in this channel.");

    const songInfo = await youtubeDownloader.getInfo(args[1]);
    const song = {
      title: songInfo.title,
      song_url: songInfo.video_url,
    }

    if(!songQueue){
      const queueCreate = {
        voiceChannel: voiceChannel,
        connection = null,
        volume: 5,
        songs = [],
      }
      queueMap.set(message.guild.id, queueCreate);
      queueCreate.songs.push(songs);
      try {
        var connection = await voiceChannel.join();
        queueCreate.connection = connection;
        play(message.guild.id, queueCreate.songs[0]);
      } catch (error) {
        console.log(error);
        queueMap.delete(message.guild.id);
        return message.channel.send("There was an error connecting to the voice channel.");
      }

    } else {
      songQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue.` )
    }
    return;

  } else if(args[1] == 'stop') {
    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) return message.channel.send("You are not in a voice channel.");
    if(!songQueue) return message.channel.send("There is nothing playing rn");
    songQueue.songs = [];
    songQueue.connection.dispatcher.end();
    message.channel.send("The music has been stopped.")
    return;
  } else if(args[1] == 'skip'){
    if(!voiceChannel) return message.channel.send("You are not in a voice channel.");
    if(!songQueue) return message.channel.send("There is nothing playing rn");
    songQueue.connection.dispatcher.end();
    message.channel.send("The song has been skipped.");
    return;
  }
});

function play(g,song){
  const songQueue = queueMap.get(g);
  if(!song){
    songQueue.voiceChannel.leave();
    queueMap.delete(g);
    return;
  }
  const dispatcher = connection.play(youtubeDownloader(song.song_url, {quality: 'highestaudio', highWaterMark: 1 << 25}))
    .on('finish', () =>{
      songQueue.songs.shift();
      play(g,songQueue.songs[0]);
    })
    .on('error', error => {
      console.log(error);
      message.channel.send("There was an error playing the requested song.");
    })
    dispatcher.setVolumeLogarithmic(songQueue.volume / 5);
}













