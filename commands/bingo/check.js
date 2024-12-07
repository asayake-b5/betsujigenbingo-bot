
const { ActionRowBuilder, ButtonStyle, ButtonBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const { knex } = require('../../index.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Complete your bingo mark !')
    .addStringOption(option =>
      option.setName('book')
        .setDescription("The book you read")
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    const book = interaction.options.getString('book');


    // CBA to share the connection
    const knex = require('knex')({
      client: 'sqlite3', // or 'better-sqlite3'
      connection: {
        filename: './dev.sqlite3',
      },
      useNullAsDefault: true,
    });

    // return early if unable to reserve
    const current = await knex.select("current_row", "current_col")
      .from('users').where('discord_id', 'like', interaction.member.id);

    if (current.length === 0
      || current[0].current_col == "" || current[0].current_col == null
      || current[0].current_row == "" || current[0].current_row == null) {
      await interaction.reply({ content: "You are not currently eligible to complete. You do not have a pending reservation.", flags: MessageFlags.Ephemeral });
      return;
    }

    let prompt = await knex.select().from("squares").where({
      prompt_row: current[0].current_row,
      prompt_col: current[0].current_col,
    });

    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Primary);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(confirm, cancel);

    const response = await interaction.reply({ content: 'You are about to complete \"' + prompt[0].prompt + '\" with book "' + book + '", confirm?', components: [row], flags: MessageFlags.Ephemeral });

    const collectorFilter = i => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
      if (confirmation.customId === 'confirm') {
        prompt_col = prompt[0].prompt_col;
        prompt_row = prompt[0].prompt_row;
        await knex('squares')
          .where({
            prompt_col: prompt_col,
            prompt_row: prompt_row,
          })
          .update({
            status: "complete",
            book_name: book,
            clear_time: Date.now(),
          });

        await knex('users')
          .where({
            discord_id: confirmation.member.user.id,
          })
          .update({
            ok_to_reserve: false,
            current_col: null,
            current_row: null,
          });
        await confirmation.reply({ content: "<@" + confirmation.member.user.id + "> has completed prompt " + prompt[0].prompt + "with book '" + book + "' !" });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({ content: 'Action cancelled', components: [] });
      }

    } catch (e) {
      await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
    }
  },
};

