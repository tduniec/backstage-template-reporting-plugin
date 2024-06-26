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
import {
  DatabaseManager,
  PluginDatabaseManager,
  resolvePackagePath,
} from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { Knex } from 'knex';

const migrationsDir = resolvePackagePath(
  '@tduniec/backstage-plugin-template-reporting-backend',
  'migrations',
);

/**
 * Ensures that a database connection is established exactly once and only when
 * asked for, and runs migrations.
 */
export class TrDatabase {
  readonly #database: PluginDatabaseManager;
  #promise: Promise<Knex> | undefined;

  static create(database: PluginDatabaseManager): TrDatabase {
    return new TrDatabase(database);
  }

  /** @internal */
  static forTesting(): TrDatabase {
    const config = new ConfigReader({
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
          useNullAsDefault: true,
        },
      },
    });
    const database = DatabaseManager.fromConfig(config).forPlugin('time-saver');
    return new TrDatabase(database);
  }

  static async runMigrations(knex: Knex): Promise<void> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
  }

  private constructor(database: PluginDatabaseManager) {
    this.#database = database;
  }

  get(): Promise<Knex> {
    this.#promise ??= this.#database.getClient().then(async client => {
      if (!this.#database.migrations?.skip) {
        await TrDatabase.runMigrations(client);
      }
      return client;
    });

    return this.#promise;
  }
}
