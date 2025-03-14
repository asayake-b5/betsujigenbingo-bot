const { ActionRowBuilder, MessageFlags, InteractionContextType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

const numberToEmoji = {
  0: "0️⃣",
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
  A: '🇦',
  B: '🇧',
  C: '🇨',
  D: '🇩',
  E: '🇪',
  F: '🇪',
  G: '🇬',
  H: '🇬',
  I: '🇮',
  J: '🇯',
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reserve')
    .setContexts([InteractionContextType.Guild])
    .setDescription('Take your slot in the bingo!')
    .addStringOption(option =>
      option.setName('book_title')
        .setDescription("The book you'll read")
        .setRequired(true)
    )
  ,
  async execute(interaction) {

    const book = interaction.options.getString('book_title');
    if (book === null) {
      await interaction.reply({ content: "Please specify the book you'll be reserving with, thank you!", flags: MessageFlags.Ephemeral });
      return;
    }
    console.log("Reserve");
    console.log(book);
    console.log(interaction);
    console.log(interaction.member.id);

    // CBA to share the connection
    const knex = require('knex')({
      client: 'sqlite3', // or 'better-sqlite3'
      connection: {
        filename: './dev.sqlite3',
      },
      useNullAsDefault: true,
    });

    // return early if unable to reserve
    const eligible = await knex.select('ok_to_reserve', "current_row", "current_col")
      .from('users').where('discord_id', 'like', interaction.member.id);

    console.log(eligible);
    console.log(eligible.ok_to_reserve);

    if (eligible.length !== 0
      && (eligible[0].ok_to_reserve != '1'
        || (eligible[0].current_col != "" && eligible[0].current_col !== null)
        || (eligible[0].current_row != "" && eligible[0].current_row !== null))) {
      await interaction.reply({ content: "You are not currently eligible to reserve. You may have a pending reservation or have already submitted a book this interval.", flags: MessageFlags.Ephemeral });
      return;
    }



    const rows = await knex.select('prompt_row').count('prompt_row').from('squares').where('status', 'LIKE', "free").groupBy("prompt_row");

    let options = [];
    for (const row of rows) {
      options.push(new StringSelectMenuOptionBuilder()
        .setLabel("Row " + row.prompt_row + ": " + row["count(`prompt_row`)"] + " remaining")
        .setValue(row.prompt_row + "")
        .setEmoji(numberToEmoji[row.prompt_row]));
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('row_select')
      .setPlaceholder('Select your row!')
      .addOptions(
        options
      );

    const row = new ActionRowBuilder()
      .addComponents(select)
    const response = await interaction.reply({ content: "Select your square, press dissmiss if you make a mistake", components: [row], flags: MessageFlags.Ephemeral });

    const collectorFilter = i => i.user.id === interaction.user.id;

    try {
      const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
      if (confirmation.customId === 'row_select') {
        const selected_row = confirmation.values[0];
        const prompts = await knex.select('emoji', 'prompt_row', 'prompt_col', 'prompt').from('squares').where('prompt_row', '=', selected_row).where("status", "like", "free");
        let options = [];

        for (const prompt of prompts) {
          const label = prompt.prompt_row + "x" + prompt.prompt_col;
          options.push(new StringSelectMenuOptionBuilder()
            .setLabel(prompt.prompt)
            .setDescription(label)
            .setValue(label)
            .setEmoji(prompt.emoji)
          );
        }

        const select2 = new StringSelectMenuBuilder()
          .setCustomId('square_select')
          .setPlaceholder('Select your square! Click dissmiss if you made a mistake')
          .addOptions(
            options
          );

        const row2 = new ActionRowBuilder()
          .addComponents(select2)
        const response2 = await confirmation.update({ components: [row2], flags: MessageFlags.Ephemeral });

        const confirmation2 = await response2.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
        if (confirmation2.customId === 'square_select') {
          const s = confirmation2.values[0].split('x');
          const data = {
            user_id: confirmation2.member.user.id,
            avatar_url: confirmation2.user.avatarURL(),
            nickname: confirmation2.member.nickname,
            prompt_row: s[0],
            prompt_col: s[1],
            timestamp: Date.now(),
          };

          const prompt_label = await knex.select('prompt').from('squares').where({
            prompt_col: data.prompt_col,
            prompt_row: data.prompt_row,
          });
          console.log(prompt_label[0].prompt);

          await knex('squares')
            .where({
              prompt_col: data.prompt_col,
              prompt_row: data.prompt_row,
            })
            .update({
              status: "reserved",
              id_rel: data.user_id,
              book_name: book,
              reserved_time: data.timestamp,
            });

          await knex('users')
            .insert({
              discord_id: data.user_id,
              ok_to_reserve: false,
              avatar_url: data.avatar_url,
              nickname: data.nickname,
              current_col: data.prompt_col,
              current_row: data.prompt_row,
            })
            .onConflict('discord_id')
            .merge({
              ok_to_reserve: false,
              avatar_url: data.avatar_url,
              nickname: data.nickname,
              current_col: data.prompt_col,
              current_row: data.prompt_row,
            });
          await confirmation2.reply({ content: "<@" + data.user_id + "> has reserved the prompt " + data.prompt_row + "-" + data.prompt_col + " - " + prompt_label[0].prompt + " with the book " + book + "!" });
        }

      }
    } catch (e) {
      console.log(e);
      await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
    }
  },
};

