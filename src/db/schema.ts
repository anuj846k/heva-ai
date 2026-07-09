import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const runs = pgTable("runs", {
  id: uuid().defaultRandom().primaryKey(),
  goal: text().notNull(),
  status: text().notNull().default("queued"),
  plan: jsonb().notNull().default("[]"),
  currentStepIndex: integer("current_step_index").notNull().default(0),
  rollbackToStepIndex: integer("rollback_to_step_index"),
  finalOutput: text("final_output"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const runEvents = pgTable("run_events", {
  id: uuid().defaultRandom().primaryKey(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  type: text().notNull(),
  payload: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const checkpoints = pgTable("checkpoints", {
  id: uuid().defaultRandom().primaryKey(),
  runId: uuid("run_id")
    .notNull()
    .references(() => runs.id, { onDelete: "cascade" }),
  stepIndex: integer("step_index").notNull(),
  state: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Run = typeof runs.$inferSelect;
export type RunInsert = typeof runs.$inferInsert;
export type RunEvent = typeof runEvents.$inferSelect;
export type RunEventInsert = typeof runEvents.$inferInsert;
export type Checkpoint = typeof checkpoints.$inferSelect;
export type CheckpointInsert = typeof checkpoints.$inferInsert;
