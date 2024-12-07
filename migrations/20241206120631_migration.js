/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id');
      table.string('discord_id', 255).notNullable().unique();
      table.string('ok_to_reserve', 255).notNullable();
      table.string('avatar_url', 255);
      table.string('nickname', 255);
      table.string('current_row', 255);
      table.string('current_col', 255);
    })
    .createTable('squares', function(table) {
      table.increments('id');
      table.string('emoji', 1000);
      table.decimal('prompt_row').notNullable();
      table.decimal('prompt_col').notNullable();
      table.string('prompt', 1000).notNullable();
      table.datetime("reserved_time");
      table.datetime("clear_time");
      table.string("book_name", 1000);
      table.string("book_image_uri", 1000);
      table.string("status", 100).notNullable();
      table.decimal("id_rel", 100);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};
