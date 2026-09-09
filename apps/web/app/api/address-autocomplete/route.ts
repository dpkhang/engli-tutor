import { NextResponse } from "next/server";

type GoogleSuggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (input.length < 3 || input.length > 160) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Address lookup is not configured" }, { status: 503 });
  }

  let response: Response;
  try {
    response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input,
        languageCode: "vi",
        regionCode: "VN",
        includeQueryPredictions: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(6_000),
    });
  } catch {
    return NextResponse.json(
      { message: "Address lookup is temporarily unavailable" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "Address lookup is temporarily unavailable" },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as { suggestions?: GoogleSuggestion[] };
  const suggestions = (payload.suggestions ?? []).flatMap(({ placePrediction }) => {
    const id = placePrediction?.placeId;
    const address = placePrediction?.text?.text;
    if (!id || !address) return [];
    return [
      {
        id,
        address,
        mainText: placePrediction.structuredFormat?.mainText?.text ?? address,
        secondaryText: placePrediction.structuredFormat?.secondaryText?.text ?? "",
      },
    ];
  });

  return NextResponse.json({ suggestions });
}
