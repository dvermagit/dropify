// import { db } from "@/lib/db";
// import { files } from "@/lib/db/schema";
// import { auth } from "@clerk/nextjs/server";
// import { and, eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function PATCH(
//   request: NextRequest,
//   params: Promise<{ fileId: string }>
// ) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { fileId } = await params;
//     if (!fileId) {
//       return NextResponse.json(
//         { message: "File id is required" },
//         { status: 400 }
//       );
//     }

//     const [file] = await db
//       .select()
//       .from(files)
//       .where(and(eq(files.id, fileId), eq(files.userId, userId)));
//     if (!file) {
//       return NextResponse.json({ message: "File not found" }, { status: 404 });
//     }

//     //move file to trash or restore
//     const [updatedFile] = await db
//       .update(files)
//       .set({ isTrash: !file.isTrash })
//       .where(and(eq(files.id, fileId), eq(files.userId, userId)))
//       .returning();

//     const action = updatedFile.isTrash
//       ? "moved to trash"
//       : "restored from trash";

//     return NextResponse.json({
//       ...updatedFile,
//       message: `File ${action} successfully`,
//     });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json(
//       { message: "Failed to move file to trash" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get the current file
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Toggle the isTrash status (move to trash or restore)
    const [updatedFile] = await db
      .update(files)
      .set({ isTrash: !file.isTrash })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    const action = updatedFile.isTrash ? "moved to trash" : "restored";
    return NextResponse.json({
      ...updatedFile,
      message: `File ${action} successfully`,
    });
  } catch (error) {
    console.error("Error updating trash status:", error);
    return NextResponse.json(
      { error: "Failed to update file trash status" },
      { status: 500 }
    );
  }
}
