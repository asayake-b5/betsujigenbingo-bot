const { ActionRowBuilder, ButtonStyle, ButtonBuilder, InteractionContextType, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancel')
    .setContexts([InteractionContextType.Guild])
    .setDescription('Cancel your reservation in the bingo'),
  async execute(interaction) {
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

    console.log(current);

    if (current.length === 0
      || current[0].current_col == "" || current[0].current_col == null
      || current[0].current_row == "" || current[0].current_row == null) {
      await interaction.reply({ content: "You are not currently eligible to cancel. You do not have a pending reservation.", flags: MessageFlags.Ephemeral });
      return;
    }

    let prompt = await knex.select().from("squares").where({
      prompt_row: current[0].current_row,
      prompt_col: current[0].current_col,
    });
    console.log(prompt);

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

    const response = await interaction.reply({ content: 'You are about to cancel \"' + prompt[0].prompt + '\", confirm?', components: [row], flags: MessageFlags.Ephemeral });

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
            status: "free",
            id_rel: null,
            reserved_time: null,
          });

        await knex('users')
          .where({
            discord_id: confirmation.member.user.id,
          })
          .update({
            ok_to_reserve: true,
            current_col: null,
            current_row: null,
          });
        await confirmation.reply({ content: "<@" + confirmation.member.user.id + "> has cancelled prompt " + prompt[0].prompt + "!" });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({ content: 'Action cancelled', components: [] });
      }

    } catch (e) {
      await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
    }
  },
};

