/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
    //  create function only for postgres
      await knex.schema.createTable('tr_template_reports', table => {
        table.comment(
          'Table contains template report with relation to the templateTaskId',
        );
        table
          .string('id')
          .primary()
          .defaultTo(
            knex.fn.uuid(),
          )
          .unique()
          .comment('UUID');
        table
          .timestamp('created_at', { useTz: false, precision: 0 })
          .notNullable()
          .defaultTo(knex.fn.now())
          .comment('The creation time of the record');
        table.string('template_task_id').comment('Template task ID');
        table
          .string('template_name')
          .comment('Template name as template entity_reference');
        table.string('template_report_template_name').comment('Template Report template name to be used to render templates')
        table.json('template_report_input_body').comment('input values to generate the template')
        table
            .text('report_rendered_content')
            .comment('Template report rendered content')
        table
          .string('created_by')
          .comment('entity refernce to the user that has executed the template');
      });
    };
  
  /**
   * @param {import('knex').Knex} knex
   */
  exports.down = async function down(knex) {
    return knex.schema.dropTable('tr_template_reports');
  };