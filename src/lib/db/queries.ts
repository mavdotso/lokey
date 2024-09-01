'use server';
import { spaces, userSpaces, InsertSpace, InsertUserSpace, SelectSpace } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { db } from '.';
import { eq } from 'drizzle-orm';

export async function createSpace(name: string, userId: string): Promise<InsertSpace> {
    const newSpace: InsertSpace = {
        id: uuidv4(),
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const [insertedSpace] = await db.insert(spaces).values(newSpace).returning();

    const userSpaceAssociation: InsertUserSpace = {
        userId,
        spaceId: insertedSpace.id,
        role: 'admin',
    };

    await db.insert(userSpaces).values(userSpaceAssociation);

    return insertedSpace;
}

export async function getSpacesByUserId(userId: string): Promise<SelectSpace[]> {
    return await db
        .select({
            id: spaces.id,
            name: spaces.name,
            createdAt: spaces.createdAt,
            updatedAt: spaces.updatedAt,
        })
        .from(userSpaces)
        .innerJoin(spaces, eq(spaces.id, userSpaces.spaceId))
        .where(eq(userSpaces.userId, userId));
}

export async function getUserSubscriptionStatus(userId: string) {
    try {
        const data = await db.query.subscriptions.findFirst({
            where: (s, { eq }) => eq(s.userId, userId),
            with: {
                prices: true,
            },
        });
        if (data) return { data: data, error: null };
        else return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: `Error` };
    }
}
