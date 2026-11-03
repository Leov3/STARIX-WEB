import json

from markupsafe import Markup, escape
from odoo import api, fields, models


class CrmLead(models.Model):
    _inherit = "crm.lead"

    def action_open_starix_meeting(self):
        self.ensure_one()
        booking_id = str(self.x_gap_booking_id or "")
        if not booking_id.isdigit():
            return False
        return {"type": "ir.actions.act_url", "url": f"/starix/meeting/{booking_id}", "target": "new"}

    x_starix_attribution_json = fields.Text(string="Atribución STARIX")

    starix_area_label = fields.Char(string="Área de interés", compute="_compute_starix_display")
    starix_status_label = fields.Char(string="Estado del diagnóstico", compute="_compute_starix_display")
    starix_route_label = fields.Char(string="Próximo paso", compute="_compute_starix_display")
    starix_diagnostic_summary = fields.Html(string="Respuestas del diagnóstico", compute="_compute_starix_display", sanitize=True)

    @api.depends("x_gap_branch", "x_gap_status", "x_gap_qualification", "x_gap_answers_json")
    def _compute_starix_display(self):
        statuses = {
            "NOT_STARTED": "Pendiente de iniciar",
            "IN_PROGRESS": "En curso",
            "COMPLETED": "Completado",
        }
        routes = {
            "HIGH_PRIORITY": "Agendar videollamada · atención inmediata",
            "MEDIUM_PRIORITY": "Agendar videollamada · seguimiento comercial",
            "MANUAL_REVIEW": "Orientación por WhatsApp",
            "PENDING": "Por definir tras el diagnóstico",
        }
        for lead in self:
            lead.starix_area_label = lead._starix_label(lead.x_gap_branch) if lead.x_gap_branch else "Pendiente"
            lead.starix_status_label = statuses.get(lead.x_gap_status, "Pendiente")
            lead.starix_route_label = routes.get(lead.x_gap_qualification, "Por definir tras el diagnóstico")
            lead.starix_diagnostic_summary = lead._starix_answers_html(lead._starix_payload(lead.x_gap_answers_json))

    def _starix_answers_html(self, payload):
        answers = [
            (label, self._starix_answer_label(key, payload[key]))
            for key, label in self._QUESTION_LABELS.items()
            if payload.get(key)
        ]
        if not answers:
            return "<p>El diagnóstico aún no tiene respuestas.</p>"
        cards = Markup("").join(
            Markup(
                '<div class="col-12 col-md-6">'
                '<div class="border rounded-3 p-3 h-100 bg-light">'
                '<div class="text-muted small mb-2">%s · %s</div>'
                '<div class="fw-semibold fs-6">%s</div>'
                '</div></div>'
            ) % (escape(f"{number:02d}"), escape(label), escape(value))
            for number, (label, value) in enumerate(answers, 1)
        )
        return str(Markup('<div class="row g-3 w-100">%s</div>') % cards)

    def _starix_display_name(self):
        """Human-readable opportunity title: person first, company second."""
        self.ensure_one()
        parts = [part.strip() for part in (self.contact_name, self.partner_name) if part and part.strip()]
        return "STARIX - " + " - ".join(parts or ["Contacto sin identificar"])

    def _starix_description(self, payload):
        """Maintain the useful CRM summary shown in the Notes tab."""
        self.ensure_one()
        rows = [
            ("Persona", self.contact_name),
            ("Empresa", self.partner_name),
            ("Correo", self.email_from),
            ("Telefono", self.phone),
            ("Necesidad inicial", self._starix_label(self.x_gap_branch)),
        ]
        rows += [
            (self._QUESTION_LABELS[key], self._starix_answer_label(key, value))
            for key, value in payload.items()
            if key in self._QUESTION_LABELS and value
        ]
        items = Markup("").join(
            Markup("<li><strong>%s:</strong> %s</li>") % (escape(label), escape(value))
            for label, value in rows
            if value
        )
        return str(Markup("<h3>Resumen STARIX</h3><ul>%s</ul>") % items)

    def _refresh_starix_presentation(self):
        """Synchronize the visible CRM title and Notes field from STARIX data."""
        for lead in self:
            payload = lead._starix_payload(lead.x_gap_answers_json)
            super(CrmLead, lead).write({
                "name": lead._starix_display_name(),
                "description": lead._starix_description(payload),
            })

    def _sync_starix_commercial_fields(self):
        """Translate the diagnostic outcome into Odoo forecast fields and tags."""
        budget_values = {
            "BELOW_2M": 1000000,
            "BUDGET_2_TO_5M": 3500000,
            "BUDGET_5_TO_10M": 7500000,
            "BUDGET_OVER_10M": 12000000,
        }
        branch_tags = {
            "WEB_PRODUCT": "web-producto",
            "AUTOMATION": "automatizacion",
            "BRAND_DIGITAL": "marca",
            "UNDEFINED": "por-definir",
        }
        qualification_tags = {
            "HIGH_PRIORITY": "alta-prioridad",
            "MEDIUM_PRIORITY": "media-prioridad",
            "MANUAL_REVIEW": "revision-manual",
        }
        controlled_tags = {"starix", *branch_tags.values(), *qualification_tags.values(), "agenda", "whatsapp"}
        Tag = self.env["crm.tag"].sudo()
        for lead in self:
            payload = lead._starix_payload(lead.x_gap_answers_json)
            selected = {"starix"}
            if lead.x_gap_branch in branch_tags:
                selected.add(branch_tags[lead.x_gap_branch])
            if lead.x_gap_qualification in qualification_tags:
                selected.add(qualification_tags[lead.x_gap_qualification])
                selected.add("whatsapp" if lead.x_gap_qualification == "MANUAL_REVIEW" else "agenda")

            tags = Tag.search([("name", "in", list(selected))])
            present = set(tags.mapped("name"))
            for name in selected - present:
                tags |= Tag.create({"name": name})
            preserved = lead.tag_ids.filtered(lambda tag: tag.name not in controlled_tags)
            values = {"tag_ids": [(6, 0, (preserved | tags).ids)]}

            budget = payload.get("budget_range")
            if budget in budget_values:
                values["expected_revenue"] = budget_values[budget]
            if lead.x_gap_qualification:
                probability = {
                    "MANUAL_REVIEW": 15,
                    "MEDIUM_PRIORITY": 40,
                    "HIGH_PRIORITY": 60,
                }.get(lead.x_gap_qualification, 0)
                if lead.x_gap_booking_id:
                    probability = 70
                values.update({"probability": probability, "is_automated_probability": False})
            super(CrmLead, lead).write(values)

    def _sync_starix_attribution(self, explicit=False):
        """Apply STARIX web attribution to Odoo's standard UTM fields."""
        for lead in self:
            try:
                attribution = json.loads(lead.x_starix_attribution_json or "{}")
            except (TypeError, ValueError):
                attribution = {}
            if not isinstance(attribution, dict):
                attribution = {}
            mapping = (
                ("source_id", "utm.source", attribution.get("utmSource"), "Formulario STARIX"),
                ("medium_id", "utm.medium", attribution.get("utmMedium"), "Sitio web"),
                ("campaign_id", "utm.campaign", attribution.get("utmCampaign"), None),
            )
            values = {}
            for field_name, model_name, incoming, default in mapping:
                incoming = incoming.strip()[:100] if isinstance(incoming, str) else ""
                if incoming and (explicit or not lead[field_name]):
                    name = incoming
                elif not lead[field_name] and default:
                    name = default
                else:
                    continue
                Model = self.env[model_name].sudo()
                record = Model.search([("name", "=ilike", name)], limit=1)
                if not record:
                    record = Model.create({"name": name})
                values[field_name] = record.id
            if values:
                super(CrmLead, lead).write(values)

    def _starix_opportunity_values(self, values):
        """Keep all inbound STARIX records in the STARIX opportunity pipeline."""
        if not any(key.startswith("x_gap_") for key in values):
            return values
        values = dict(values)
        values.setdefault("type", "opportunity")
        if not values.get("team_id"):
            team = self.env["crm.team"].sudo().search([("name", "=", "STARIX")], limit=1)
            if team:
                values["team_id"] = team.id
        return values

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create([self._starix_opportunity_values(values) for values in vals_list])
        starix_records = records.filtered(lambda lead: lead.x_gap_token)
        starix_records._refresh_starix_presentation()
        starix_records._sync_starix_commercial_fields()
        starix_records._sync_starix_attribution(explicit=True)
        return records

    _STARIX_STAGES = {
        "formulario_enviado": 5,
        "diagnostico_iniciado": 6,
        "diagnostico_completado": 7,
        "agenda_mostrada": 8,
        "videollamada_agendada": 9,
        "whatsapp_desde_resultado": 10,
    }

    _LABELS = {
        "WEB_PRODUCT": "Sitio web / producto",
        "AUTOMATION": "Automatización",
        "BRAND_DIGITAL": "Marca / presencia digital",
        "UNDEFINED": "Por definir",
        "WITHIN_FOUR_WEEKS": "Máximo 4 semanas",
        "ONE_TO_THREE_MONTHS": "1 a 3 meses",
        "LATER": "Más de 3 meses",
        "EXPLORING": "Explorando",
        "DECIDES": "Decide personalmente",
        "SHARED_DECISION": "Decide con socio o equipo",
        "RECOMMENDS": "Recomienda, no decide",
        "RESEARCHING": "Investigando opciones",
        "BELOW_2M": "Menos de 2 M COP",
        "BUDGET_2_TO_5M": "2 a 5 M COP",
        "BUDGET_5_TO_10M": "5 a 10 M COP",
        "BUDGET_OVER_10M": "Más de 10 M COP",
        "UNDEFINED_BUDGET": "Inversión por definir",
    }

    _QUESTION_LABELS = {
        "project_stage": "Etapa del proyecto",
        "solution_type": "Solución",
        "main_goal": "Objetivo",
        "process_area": "Proceso",
        "main_problem": "Problema",
        "expected_impact": "Impacto esperado",
        "brand_area": "Área de marca",
        "current_presence": "Presencia actual",
        "expected_result": "Resultado esperado",
        "contact_motivation": "Motivación",
        "urgency_context": "Urgencia percibida",
        "clarity_level": "Claridad",
        "start_timeline": "Inicio esperado",
        "decision_power": "Decisión",
        "budget_range": "Inversión",
    }

    _ANSWER_LABELS = {
        "project_stage": {"IDEA": "Idea", "REQUIREMENTS": "Requisitos definidos", "PROTOTYPE": "Diseño o prototipo", "EXISTING_PRODUCT": "Producto existente"},
        "solution_type": {"CORPORATE_SITE": "Sitio web corporativo", "ECOMMERCE": "Tienda en línea", "WEB_APP": "Aplicación web o plataforma", "PRODUCT_IMPROVEMENT": "Mejora de producto digital"},
        "main_goal": {"LEADS": "Generar oportunidades", "SELL": "Vender en línea", "OPERATE": "Optimizar la operación", "VALIDATE": "Validar una idea", "EXPERIENCE": "Mejorar la experiencia actual"},
        "process_area": {"SALES": "Ventas y seguimiento", "SUPPORT": "Atención al cliente", "OPERATIONS": "Operaciones internas", "DATA": "Datos y reportes", "MULTIPLE": "Varios procesos"},
        "main_problem": {"MANUAL": "Tareas manuales repetitivas", "ERRORS": "Errores o retrabajo", "DISCONNECTED": "Herramientas desconectadas", "VISIBILITY": "Falta de visibilidad", "CLEAR_OTHER": "Otro problema definido"},
        "expected_impact": {"SAVE_TIME": "Ahorrar tiempo", "REDUCE_ERRORS": "Reducir errores", "FASTER_RESPONSE": "Responder más rápido", "INTEGRATE": "Integrar sistemas", "SCALE": "Escalar la operación"},
        "brand_area": {"IDENTITY": "Identidad de marca", "DIGITAL_PRESENCE": "Sitio o presencia digital", "POSITIONING": "Posicionamiento", "COMMUNICATION": "Comunicación", "TRANSFORMATION": "Transformación integral"},
        "current_presence": {"NONE": "Sin presencia digital", "BASIC": "Presencia básica", "OUTDATED": "Marca desactualizada", "SITE_EXISTS": "Sitio existente por mejorar", "CONSOLIDATED": "Marca consolidada"},
        "expected_result": {"TRUST": "Generar confianza", "ATTRACT": "Atraer clientes", "DIFFERENTIATE": "Diferenciarse", "LAUNCH": "Lanzar una oferta", "ORGANIZE": "Ordenar la experiencia de marca"},
        "contact_motivation": {"CLIENTS": "Conseguir o atender más clientes", "OPERATIONS": "Ordenar la operación", "PRESENCE": "Fortalecer la presencia", "IDEA": "Lanzar una idea", "MULTIPLE": "Varias áreas"},
        "urgency_context": {"BLOCKER": "Bloqueo claro", "OPPORTUNITY": "Aprovechar una oportunidad", "GUIDANCE": "Necesita orientación", "EXPLORING": "Explorando opciones"},
        "clarity_level": {"CLEAR": "Sabe qué necesita", "OPTIONS": "Considera varias opciones", "NEEDS_DEFINITION": "Necesita ayuda para definirlo", "UNKNOWN": "Aún no lo sabe"},
        "start_timeline": {"WITHIN_FOUR_WEEKS": "En las próximas 4 semanas", "ONE_TO_THREE_MONTHS": "En 1 a 3 meses", "LATER": "Más adelante", "EXPLORING": "Aún explorando"},
        "decision_power": {"DECIDES": "Decide personalmente", "SHARED_DECISION": "Decide con socio o equipo", "RECOMMENDS": "Recomienda, no decide", "RESEARCHING": "Investigando opciones"},
        "budget_range": {"BELOW_2M": "Menos de 2 M COP", "BUDGET_2_TO_5M": "2 a 5 M COP", "BUDGET_5_TO_10M": "5 a 10 M COP", "BUDGET_OVER_10M": "Más de 10 M COP", "UNDEFINED_BUDGET": "Por definir"},
    }

    def _starix_payload(self, raw):
        try:
            return json.loads(raw or "{}")
        except (TypeError, ValueError):
            return {}

    def _starix_label(self, value):
        value = str(value or "")
        return self._LABELS.get(value, value.replace("_", " ").capitalize())

    def _starix_answer_label(self, question, value):
        return self._ANSWER_LABELS.get(question, {}).get(value, self._starix_label(value))

    def _starix_activity_note(self):
        self.ensure_one()
        payload = self._starix_payload(self.x_gap_answers_json)
        route = {
            "HIGH_PRIORITY": "Coordinar la videollamada con atención inmediata",
            "MEDIUM_PRIORITY": "Dar seguimiento comercial y coordinar la videollamada",
            "MANUAL_REVIEW": "Responder por WhatsApp y orientar sobre el siguiente paso",
        }.get(self.x_gap_qualification, "Revisar el diagnóstico")
        details = [
            "Diagnóstico STARIX completado.",
            f"Siguiente paso: {route}.",
            f"Área: {self._starix_label(self.x_gap_branch)}.",
        ]
        if payload.get("budget_range"):
            details.append(f"Inversión indicada: {self._starix_answer_label('budget_range', payload['budget_range'])}.")
        return " ".join(details)

    def _starix_note(self, event, payload):
        event_label = {
            "formulario_enviado": "Contacto recibido",
            "diagnostico_iniciado": "Diagnóstico iniciado",
            "diagnostico_completado": "Diagnóstico completado",
            "agenda_mostrada": "Agenda disponible",
            "videollamada_agendada": "Videollamada agendada",
            "whatsapp_desde_resultado": "Seguimiento por WhatsApp",
        }[event]
        lines = []
        if event == "formulario_enviado":
            lines = [
                f"Persona: {self.contact_name or 'Sin nombre'}",
                f"Empresa: {self.partner_name or 'No indicada'}",
                f"Necesidad inicial: {self._starix_label(self.x_gap_branch)}",
            ]
        elif event == "diagnostico_iniciado":
            lines = [f"Rama de diagnóstico: {self._starix_label(self.x_gap_branch)}"]
        elif event == "diagnostico_completado":
            answers = [(self._QUESTION_LABELS[key], self._starix_answer_label(key, value)) for key, value in payload.items() if key in self._QUESTION_LABELS]
            lines = [f"{key}: {value}" for key, value in answers]
        elif event == "agenda_mostrada":
            lines = ["La persona solicitó disponibilidad para una videollamada."]
        elif event == "videollamada_agendada":
            lines = [f"Reserva confirmada: {self.x_gap_booking_at or 'fecha pendiente de sincronización'}."]
        elif event == "whatsapp_desde_resultado":
            lines = ["La persona solicitó orientación por WhatsApp antes de agendar."]
        body = Markup("<br/>").join(escape(line) for line in lines)
        return Markup('<p data-starix-event="%s"><strong>STARIX · %s</strong><br/>%s</p>') % (escape(event), escape(event_label), body)

    def _post_starix_milestone(self, event, payload):
        for lead in self:
            if event not in self._STARIX_STAGES:
                continue
            marker = "STARIX · " + {"formulario_enviado":"Contacto recibido","diagnostico_iniciado":"Diagnóstico iniciado","diagnostico_completado":"Diagnóstico completado","agenda_mostrada":"Agenda disponible","videollamada_agendada":"Videollamada agendada","whatsapp_desde_resultado":"Seguimiento por WhatsApp"}[event]
            duplicate = self.env["mail.message"].sudo().search_count([
                ("model", "=", "crm.lead"), ("res_id", "=", lead.id), ("body", "ilike", marker),
            ])
            if not duplicate:
                lead.message_post(body=lead._starix_note(event, payload), subtype_xmlid="mail.mt_note")

    def write(self, vals):
        vals = self._starix_opportunity_values(vals)
        previous = {lead.id: self._starix_payload(lead.x_gap_answers_json) for lead in self}
        result = super().write(vals)
        if any(key.startswith("x_gap_") for key in vals):
            self._refresh_starix_presentation()
            self._sync_starix_commercial_fields()
        if any(key.startswith("x_gap_") for key in vals) or "x_starix_attribution_json" in vals:
            self._sync_starix_attribution(explicit="x_starix_attribution_json" in vals)
        if "x_gap_answers_json" not in vals:
            return result
        for lead in self:
            current = lead._starix_payload(lead.x_gap_answers_json)
            before_events = previous[lead.id].get("_starixEvents", [])
            events = current.get("_starixEvents", [])
            new_events = events[len(before_events):] if isinstance(events, list) else []
            for item in new_events:
                event = item.get("event") if isinstance(item, dict) else None
                if event in lead._STARIX_STAGES:
                    stage_id = lead._STARIX_STAGES[event]
                    if lead.stage_id.id != stage_id:
                        super(CrmLead, lead).write({"stage_id": stage_id})
                    lead._post_starix_milestone(event, current)
        return result

    def ensure_starix_contact(self):
        """Create or reuse the company and person attached to a STARIX lead."""
        Partner = self.env["res.partner"].sudo()
        partner_ids = []
        for lead in self.sudo():
            email = (lead.email_from or "").strip().lower()
            phone = (lead.phone or "").strip()
            company_name = (lead.partner_name or "").strip()
            company = Partner
            if company_name:
                company = Partner.search([("name", "=ilike", company_name), ("parent_id", "=", False)], limit=1)
                if not company:
                    company = Partner.create({"name": company_name})
            person = lead.partner_id
            if not person and email:
                person = Partner.search([("email", "=ilike", email)], limit=1)
            if not person and phone:
                person = Partner.search([("phone", "=", phone)], limit=1)
            values = {
                "name": lead.contact_name or lead.name or "Contacto STARIX",
                "email": email or False,
                "phone": phone or False,
                "parent_id": company.id if company else False,
            }
            if person:
                person.write(values)
            else:
                person = Partner.create(values)
            lead.write({"partner_id": person.id})
            partner_ids.append(person.id)
        return partner_ids
    def backfill_starix_chatter(self):
        """Publish missing STARIX milestone notes without altering the current stage."""
        for lead in self:
            payload = lead._starix_payload(lead.x_gap_answers_json)
            for item in payload.get("_starixEvents", []):
                event = item.get("event") if isinstance(item, dict) else None
                if event in lead._STARIX_STAGES:
                    lead._post_starix_milestone(event, payload)
        return True
    def post_starix_ai_brief(self, brief):
        """Store one internal AI call-preparation note on the opportunity and contact."""
        brief = (brief or "").strip()[:9000]
        if not brief:
            return False
        body = Markup("<p><strong>STARIX · Preparación de llamada (IA)</strong><br/>") + Markup("<br/>").join(escape(line) for line in brief.splitlines()) + Markup("</p>")
        for lead in self:
            for record in (lead, lead.partner_id):
                if not record:
                    continue
                existing = self.env["mail.message"].sudo().search([("model", "=", record._name), ("res_id", "=", record.id), ("subject", "=", "STARIX_AI_CALL_BRIEF")], limit=1)
                if existing:
                    existing.write({"body": body})
                else:
                    record.message_post(body=body, subject="STARIX_AI_CALL_BRIEF", subtype_xmlid="mail.mt_note")
        return True


class MailActivity(models.Model):
    _inherit = "mail.activity"

    @api.model_create_multi
    def create(self, vals_list):
        activities = super().create(vals_list)
        summaries = {
            "Atender lead STARIX prioritario": "Atender solicitud STARIX con prioridad",
            "Dar seguimiento comercial STARIX": "Dar seguimiento comercial STARIX",
            "Responder por WhatsApp al lead STARIX": "Responder por WhatsApp al contacto STARIX",
        }
        for activity in activities:
            if activity.summary not in summaries or activity.res_model != "crm.lead":
                continue
            lead = self.env["crm.lead"].browse(activity.res_id).exists()
            if lead and lead.x_gap_token:
                activity.write({
                    "summary": summaries[activity.summary],
                    "note": lead._starix_activity_note(),
                })
        return activities
