import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        { message: "File id is required" },
        { status: 400 }
      );
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));
    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    //toggle star
    const updatedFiles = await db
      .update(files)
      .set({ isStared: !file.isStared })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();
    //log the whole UpdatedFiles
    const updatedFile = updatedFiles[0];

    return NextResponse.json(updatedFile, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to star file" },
      { status: 500 }
    );
  }
}
