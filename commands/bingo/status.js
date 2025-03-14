const { ActionRowBuilder, AttachmentBuilder, ButtonStyle, EmbedBuilder, ButtonBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('List the current reservations and check on the current bingo state!')
  ,
  async execute(interaction) {
    // CBA to share the connection
    const knex = require('knex')({
      client: 'sqlite3', // or 'better-sqlite3'
      connection: {
        filename: './dev.sqlite3',
      },
      useNullAsDefault: true,
    });
    const timestamp = 1741993200;

    const reservations = await knex("squares").where('status', 'like', 'reserved', 'book_name');
    // console.log(reservations);


    //TODO https://discordjs.guide/popular-topics/embeds.html#attaching-images
    //const file = new AttachmentBuilder('users.png');
    const file2 = new AttachmentBuilder('1.png');
    const exampleEmbed = new EmbedBuilder()
      //TODO Actually put the bingo boards here.setImage('https://i.imgur.com/AfFp7pu.png')
      .setTitle('Current Reservations')
      .addFields({ name: 'Next Reset (Estimate, +- a few hours)', value: '<t:' + timestamp + '>' })
      .setImage("attachment://1.png");
    /*    const exampleEmbed2 = new EmbedBuilder()
          .setTitle('Users')
          .setImage("attachment://users.png");
    */    //TODO 25 limit? not really a problem realistically I think
    for (r of reservations) {
      console.log(r.id_rel)
      exampleEmbed
        .addFields(
          { name: '<:prompt:' + r.emoji + '> (' + r.prompt_row + '-' + r.prompt_col + ') ' + r.prompt + ': ' + r.book_name, value: 'Reserved by <@' + r.id_rel + '> on ' + new Date(parseInt(r.reserved_time ?? 0)).toISOString().slice(0, 10) },
        );
    }

    interaction.reply({ embeds: [exampleEmbed], files: [file2], flags: MessageFlags.Ephemeral });

  },
};

