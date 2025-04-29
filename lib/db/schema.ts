import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  //basic file/folder info
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(), //folder

  //storage info
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  //ownership
  userId: text("user_id").notNull(),
  parentId: text("parent_id"), //parent folder if (null for root items)

  //file/folder flags
  isFolder: boolean("is_folder").default(false).notNull(),
  isStared: boolean("is_stared").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  //timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fileRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),

  //relationship to child file/folder
  children: many(files),
}));

//type definations
export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;
