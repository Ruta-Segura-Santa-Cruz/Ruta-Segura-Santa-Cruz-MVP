import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { start, end } = await request.json();
    
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Faltan coordenadas de origen o destino' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [start.lng, start.lat],
            [end.lng, end.lat]
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Error al calcular la ruta' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ route: data });
    
  } catch (error) {
    console.error('Error en API Route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}