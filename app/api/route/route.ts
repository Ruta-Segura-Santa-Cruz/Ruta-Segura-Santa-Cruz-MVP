export async function POST(request: Request) {
  try {
    const { start, end } = await request.json();
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'ORS_API_KEY no configurada' },
        { status: 500 }
      );
    }
    const body = {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
      format: 'geojson',
    };
    const orsRes = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify(body),
      }
    );
    if (!orsRes.ok) {
      const errText = await orsRes.text();
      return Response.json(
        { error: `OpenRouteService error: ${orsRes.status} ${errText}` },
        { status: orsRes.status }
      );
    }
    const data = await orsRes.json();
    return Response.json({ route: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return Response.json({ error: `Error al calcular la ruta: ${message}` }, { status: 500 });
  }
}
