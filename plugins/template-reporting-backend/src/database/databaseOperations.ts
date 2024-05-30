/*
 * Copyright 2024 The Backstage Authors
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
import { Knex } from 'knex';
import { Logger } from 'winston';

export class DatabaseOperations {
  constructor(private readonly knex: Knex, private readonly logger: Logger) {}

  async select(tableName: string, column: string, key: Record<string, string>) {
    try {
      const rows = await this.knex.select(column).from(tableName).where(key);
      this.logger.info(`Data selected successfully ${JSON.stringify(rows)}`);
      return rows;
    } catch (error) {
      this.logger.error('Error selecting data:', error);
      throw error;
    }
  }

  async selectAll(tableName: string, column: string) {
    try {
      const rows = await this.knex.select(column).from(tableName);
      this.logger.info(`Data selected successfully ${JSON.stringify(rows)}`);
      return rows;
    } catch (error) {
      this.logger.error('Error selecting data:', error);
      throw error;
    }
  }

  async insert(tableName: string, data: NonNullable<unknown>) {
    //  TODO : Verify data type
    try {
      const insertedRow = await this.knex(tableName)
        .insert(data)
        .returning('*');

      this.logger.debug(`Data inserted successfully ${data}`);
      return insertedRow;
    } catch (error) {
      this.logger.error('Error inserting data:', error);
      throw error; // Re-throw the error for handling further up the call stack
    }
  }

  async insertOverride(
    tableName: string,
    data: NonNullable<unknown>,
    conflictColumn: string,
  ) {
    //  TODO : Verify data type
    await this.knex(tableName)
      .insert(data)
      .onConflict(conflictColumn)
      .merge()
      .then(() => {
        this.logger.info('Data inserted successfully');
      })
      .catch(error => {
        this.logger.error('Error inserting data:', error);
      });
  }

  async update(
    tableName: string,
    data: NonNullable<unknown>,
    key: Record<string, string>,
  ) {
    //  TODO : Verify data type
    await this.knex(tableName)
      .where(key)
      .update(data)
      .then(() => {
        this.logger.info('Data updated successfully');
      })
      .catch(error => {
        this.logger.error('Error updating data:', error);
      });
  }

  async delete(tableName: string, key: Record<string, string>) {
    await this.knex(tableName)
      .returning('*')
      .where(key)
      .del()
      .then(deletedRow => {
        this.logger.info(
          `row deleted successfully: ${JSON.stringify(deletedRow)}`,
        );
        return deletedRow;
      })
      .catch(error => {
        this.logger.error('Error deleting data:', error);
      });
  }

  async truncate(tableName: string) {
    await this.knex(tableName)
      .truncate()
      .catch(error => {
        this.logger.error(`Error truncating table ${tableName}`, error);
      });
  }
}
