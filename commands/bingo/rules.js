const { ActionRowBuilder, ButtonStyle, EmbedBuilder, ButtonBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('List the rules of the bingo')
  ,
  async execute(interaction) {

    const exampleEmbed = {
      color: 0x000000,
      title: 'Bingo Rules',
      description: 'Here are the rules for the communal bingo, they\'re not exactly strictly enforced so think of them as rough guidelines, if you have any questions, feel free to ask <@85779286618808320>! \n \n These rules aim to provide a fun experience for every person regardless of their level in Japanese, as long as you understand that, you should have no problem with the rules!',
      fields: [
        {
          name: 'If possible, please separate your personal bingo from the communal one',
          value: 'If you are a beginner or unsure you can complete your bingo by the end of the year, you can ignore this. But if possible, please use an individual book to clear a square from one or the other. This is to incentivize advanced readers to read more books!',
        },
        {
          name: 'Manga is acceptable to clear a square!',
          value: 'But please refrain from abusing this to fast clear squares if you are an advanced learner',
        },
        {
          name: 'Visual Novels are as well!',
          value: 'But please use a VN which has a non explicit cover (or at least little enough to censor and still have a coherent cover). If the VN has explicit content in it but is not the main point of the game, that\'s A-OK.',
        },
        {
          name: 'One book per period rule',
          value: 'As of now, each individual person gets a single square clear per two weeks (reseting every other Saturday). This is to encourage people to focus on their individual bingos and to prevent advanced readers from clearing the bingo early.',
        },
        {
          name: 'Reservation resets even if you have a current reservation',
          value: 'If you reserve on the 29th, and clear on the 5th, for instance, you will be able to reserve right away again',
        },
        {
          name: 'Reservation system',
          value: 'To avoid someone sniping a square just as you were about to clear it, we will run on a "reservation" system, just like a library.',
        },
        {
          name: 'Reservation rules: Reserve a book only very shortly before starting to read it.',
          value: 'Please reserve only when you are going to read a book very shortly (for instance, you are near the end of your current book and about to start a new one). This is to avoid people hoarding a square for nothing.',
        },
        {
          name: 'Reservation rules: Anti-Hoarding',
          value: 'If you have a square reserved and are actively reading a book, you can hold the reservation for as long as you want. I will check up on long running reservations in the interest of fairness. Please cancel your reservation if you stopped a book or ended up picking something else',
        },
        {
          name: 'Reservation rules: Cancelling',
          value: 'If you give up a reservation, this does not count for the "book per fortnight" rule, you are free to start another reservation after cancelling',
        },
        {
          name: 'Reservation rules: Retro-activity',
          value: 'If someone cancels a reservation and you happened to have been reading a book at the same time as the reservation was active which fits that square, you are free to grab it for yourself, this should be rare enough to not cause any problems',
        },
        {
          name: 'In case of offline bot',
          value: 'The bot being hosted at my home, it might be subject to be down at times (power cut, internet issue, and so on). If this happens, just leave a message with what you would like to do (I want to reserve square A6 with this book, I want to cancel my reservation, and so on), and I will get to it when I can!',
        },
        {
          name: '/rules',
          value: 'Display this panel again',
          inline: true,
        },
        {
          name: '/status',
          value: 'List the current reservations from everyone, as well as display the bingo boards',
          inline: true,
        },
        {
          name: '/reserve <book_name>',
          value: 'Reserve a square you are about to read, indicating which book you plan to read',
          inline: true,
        },
        {
          name: '/cancel',
          value: 'Cancel your current reservation',
          inline: true,
        },
        {
          name: '/complete',
          value: 'Complete your currently reserved square',
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    interaction.reply({ embeds: [exampleEmbed], flags: MessageFlags.Ephemeral });

  },
};

