# Contrato n8n / Odoo para STARIX GAP V1

El sitio nunca crea un lead ni una reserva directamente. n8n es la única capa que escribe en Odoo y debe hacer las operaciones idempotentes.

## Contacto inicial

`POST /api/contact` reenvía el formulario a `CONTACT_WEBHOOK_URL`. El workflow debe crear o actualizar un solo lead y responder JSON:

```json
{ "leadId": "odoo-lead-id", "gapToken": "token-opaco-aleatorio-de-32-o-mas-caracteres" }
```

`gapToken` se genera criptográficamente, se asocia al lead y al diagnóstico `starix-gap-v1`, y no contiene PII. Si falta, el sitio mantiene el contacto recibido pero no permite abrir el GAP.

## Webhook GAP

`GAP_WEBHOOK_URL` recibe JSON con `action` y la cabecera `x-starix-gap-secret` cuando `GAP_WEBHOOK_SECRET` está configurado. Debe validar el token, obtener el lead asociado y no registrar el cuerpo completo en logs.

| Acción | Entrada | Respuesta requerida |
| --- | --- | --- |
| `session` | `token` | `branch`, `answers`, `currentStep`, `status`, `qualificationStatus` |
| `save_answer` | `token`, `branch`, `questionId`, `answer`, `currentStep`, `questionnaireVersion` | `{ "updatedAt": "ISO-8601" }` |
| `complete` | `token`, `branch`, `answers`, `questionnaireVersion` | `qualificationStatus` (`QUALIFIED` o `MANUAL_REVIEW`) y `qualificationReason` |
| `booking_confirmed` | `token`, `bookingId`, `scheduledAt` | `{ "ok": true }` |
| `event` | `token`, `event`, `questionId` opcional | `{ "ok": true }` |

n8n debe volver a validar rama, pregunta, opción y decisión comercial. Las razones internas mínimas son `BUDGET_COMPATIBLE`, `BUDGET_BELOW_MINIMUM`, `BUDGET_UNDEFINED` e `INCOMPLETE_DIAGNOSTIC`.

## Campos Odoo

Mantener el lead original y añadir/guardar: rama, versión del cuestionario, respuestas estructuradas, paso actual, estado GAP, calificación, razón, fechas de inicio/actualización/finalización, estado e identificador de reserva. La nota comercial se construye de forma determinista usando necesidad, estado, alcance, resultados, presupuesto, plazo y estado comercial.

## Reserva y analítica

El proveedor de agenda debe llamar a `POST /api/gap/booking-confirmed` con `x-starix-booking-secret`, el token y su identificador de evento tras confirmación real. Hasta entonces no se habilita la CTA.

El workflow debe deduplicar por `leadId + event + questionId/bookingId` los eventos: `contact_submitted`, `thankyou_viewed`, `gap_started`, `gap_question_completed`, `gap_completed`, `gap_qualified`, `gap_manual_review`, `booking_started` y `booking_completed`.
