import { NextRequest, NextResponse } from "next/server";

const getFileNameWithoutExtension = (fileName: string) => {
  return fileName.split(".").slice(0, -1).join(".");
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const existingEventId = request.nextUrl.searchParams.get("id");
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const { fileName, contentType, isBanner } = body;
    const fileNameWithoutExt = getFileNameWithoutExtension(String(fileName));
    const backendQuery = new URLSearchParams({
      fileName: fileNameWithoutExt,
      contentType: String(contentType),
      isBanner: String(isBanner),
    });

    if (existingEventId) {
      backendQuery.set("id", existingEventId);
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/upload?${backendQuery.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload event");
    }

    const eventsData = await response.json();
    return NextResponse.json({ data: eventsData?.data ?? eventsData });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to upload event" },
      { status: 500 },
    );
  }
}
