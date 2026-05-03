import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { DEFAULT_CLASS_SEEDS } from "../lib/default-classes";

import { mutation, query } from "./_generated/server";

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingClasses = await ctx.db
      .query("classes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const now = Date.now();
    const legacyPhysicsClass = existingClasses.find(
      (item) =>
        item.isDefault &&
        (item.code === "EFI-01" || item.name === "Educación Física"),
    );
    const canonicalPhysicsClass = existingClasses.find(
      (item) => item.isDefault && item.code === "FIS-01",
    );

    if (legacyPhysicsClass && canonicalPhysicsClass) {
      await ctx.db.delete(legacyPhysicsClass._id);
    } else if (legacyPhysicsClass) {
      await ctx.db.patch(legacyPhysicsClass._id, {
        code: "FIS-01",
        name: "Física",
        description: "Movimiento, fuerza, energía y fenómenos del mundo físico.",
        topics: ["Movimiento", "Fuerza", "Energía", "Materia"],
        updatedAt: now,
      });
    }

    const refreshedClasses = await ctx.db
      .query("classes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const duplicateDefaultIds = new Set<
      (typeof refreshedClasses)[number]["_id"]
    >();
    const seenDefaultCodes = new Set<string>();

    for (const classItem of refreshedClasses
      .filter((item) => item.isDefault)
      .sort((a, b) => a.order - b.order || a._creationTime - b._creationTime)) {
      if (seenDefaultCodes.has(classItem.code)) {
        duplicateDefaultIds.add(classItem._id);
        continue;
      }

      seenDefaultCodes.add(classItem.code);
    }

    for (const duplicateId of duplicateDefaultIds) {
      await ctx.db.delete(duplicateId);
    }

    const normalizedClasses = await ctx.db
      .query("classes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const existingCodes = new Set(normalizedClasses.map((item) => item.code));

    for (const classItem of DEFAULT_CLASS_SEEDS) {
      if (existingCodes.has(classItem.code)) {
        continue;
      }

      await ctx.db.insert("classes", {
        userId,
        name: classItem.name,
        code: classItem.code,
        description: classItem.description,
        topics: [...classItem.topics],
        order: classItem.order,
        hasProgram: true,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return await ctx.db
      .query("classes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return classes.sort((a, b) => a.order - b.order);
  },
});

export const getById = query({
  args: {
    id: v.id("classes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const classItem = await ctx.db.get(args.id);

    if (!classItem || classItem.userId !== userId) {
      return null;
    }

    return classItem;
  },
});
