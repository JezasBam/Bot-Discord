import Dexie, { type Table } from "dexie";
import type { EmbedProject } from "../types";

export class EmbedBuilderDB extends Dexie {
  projects!: Table<EmbedProject, string>;

  constructor() {
    super("EmbedBuilderDB");

    this.version(1).stores({
      projects: "id, name, updatedAt",
    });
  }
}

export const db = new EmbedBuilderDB();
