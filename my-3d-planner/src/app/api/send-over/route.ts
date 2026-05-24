import { NextResponse } from 'next/server';
import whatsAppClient from '@green-api/whatsapp-api-client';

export async function POST(request: Request) {
  const body = await request.json();
  const { clientPhone, computedArea, chandelierName, pdfUrl } = body;

  // Инициализация API-клиента
  const restAPI = whatsAppClient.restAPI({
    idInstance: process.env.GREEN_API_ID_INSTANCE!,
    apiTokenInstance: process.env.GREEN_API_TOKEN_INSTANCE!
  });

  // ID чата с вашим менеджером в WhatsApp (номер без знака "+")
  const managerChatId = `77085324847@c.us`;

  const captionText = `Новый заказ из 3D-конструктора!\n` +
                      `Клиент: ${clientPhone}\n` +
                      `Выбранная люстра: ${chandelierName}\n` +
                      `Расчет пола: ${computedArea} кв.м.\n` +
                      `Смета и детали расчета прикреплены в PDF формате.`;

  try {
    // Отправляем PDF-файл по ссылке напрямую в чат менеджеру
    const response = await restAPI.file.sendFileByUrl(
      managerChatId,
      null,
      pdfUrl,
      'Smeta_3D_Planner.pdf',
      captionText
    );

    return NextResponse.json({ success: true, messageId: response.idMessage });
  } catch (error) {
    console.error('Ошибка отправки сообщения через Green API:', error);
    return NextResponse.json({ success: false, error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
