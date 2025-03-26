import { NextRequest, NextResponse } from 'next/server';
import dialogflow from '@google-cloud/dialogflow';

const sessionClient = new dialogflow.SessionsClient();

export async function POST(request: NextRequest) {
    const { message } = await request.json();
    const sessionId = '123456'; // Puedes usar un ID de sesión único por usuario
    const sessionPath = sessionClient.projectAgentSessionPath('tu-proyecto-id', sessionId);

    const requestPayload = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'es', // Cambia el idioma según sea necesario
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(requestPayload);
        const result = responses[0].queryResult;
        return NextResponse.json({ response: result.fulfillmentText });
    } catch (error) {
        console.error('Error al comunicarse con Dialogflow:', error);
        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
    }
} 