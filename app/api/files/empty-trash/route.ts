import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { FileObject } from "imagekit/dist/libs/interfaces";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //get all files in trash
    const filesInTrash = await db
      .select()
      .from(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)));

    if (filesInTrash.length === 0) {
      return NextResponse.json(
        { message: "No files in trash" },
        { status: 404 }
      );
    }

    //delete file from imagekit if not a folder
    const deletePromises = filesInTrash
      .filter((file) => !file.isFolder) // Skip folders
      .map(async (file) => {
        try {
          let imagekitFileId = null;

          if (file.fileUrl) {
            const urlWithoutQuery = file.fileUrl.split("?")[0];
            const imagekitFileId = urlWithoutQuery.split("/").pop();
          }

          if (!imagekitFileId && file.path) {
            const imagekitFileId = file.path.split("/").pop();
          }

          if (imagekitFileId) {
            try {
              const searchResults = await imagekit.listFiles({
                name: imagekitFileId,
                limit: 1,
              });

              if (searchResults && searchResults.length > 0) {
                await imagekit.deleteFile(
                  (searchResults[0] as FileObject).fileId
                );
              } else {
                await imagekit.deleteFile(imagekitFileId);
              }
            } catch (searchError) {
              console.error(
                "Error searching for file in imagekit",
                searchError
              );
              await imagekit.deleteFile(imagekitFileId);
            }
          }
        } catch (error) {
          console.error(`Error deleting file  ${file.id} from imagekit`, error);
        }
      });

    //Wait for all imagekit deletions to complete
    await Promise.all(deletePromises);

    const deletedFiles = await db
      .delete(files)
      .where(and(eq(files.userId, userId), eq(files.isTrash, true)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Successfully deleted $(deletedFiles.length) files from trash",
    });
  } catch (error) {
    console.error("Error emptying trash", error);
    return NextResponse.json(
      { message: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
