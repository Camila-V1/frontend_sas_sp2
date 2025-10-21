# 📄 Funcionalidad de Exportación PDF - Bitácora del Sistema

**Fecha:** 21 de Octubre, 2025  
**Implementación:** Frontend completado ✅  
**Pendiente:** Backend (endpoint de exportación)

---

## ✅ LO QUE SE IMPLEMENTÓ (FRONTEND)

### **Archivo Modificado:**
`src/pages/AuditLogPage.jsx`

### **Cambios Realizados:**

1. **Función de Exportación** (líneas 40-70):
   ```javascript
   const handleExportPDF = async () => {
       // Construye parámetros de filtros
       // Llama a /api/auditlog/export-pdf/
       // Descarga el PDF generado
       // Muestra toast de éxito/error
   }
   ```

2. **Botón de Descarga** (líneas 101-113):
   - Ubicado en la sección de filtros
   - Diseño verde con ícono de descarga
   - Texto: "📄 Descargar PDF"

3. **Características:**
   - ✅ Respeta los filtros activos (nivel, búsqueda)
   - ✅ Nombre de archivo con fecha: `bitacora_2025-10-21.pdf`
   - ✅ Manejo de errores con toast notifications
   - ✅ Descarga automática del archivo

---

## ⚠️ LO QUE FALTA (BACKEND)

### **Endpoint Requerido:**

**URL:** `/api/auditlog/export-pdf/`  
**Método:** `GET`  
**Parámetros de Query:**
- `level` (opcional): "INFO", "WARNING", "ERROR", "CRITICAL"
- `search` (opcional): término de búsqueda

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="bitacora_YYYY-MM-DD.pdf"`
- Body: Archivo PDF binario

### **Implementación Sugerida en Django:**

**Archivo:** `apps/auditlog/views.py`

```python
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from io import BytesIO
import datetime

class AuditLogViewSet(viewsets.ModelViewSet):
    # ... código existente ...
    
    @action(detail=False, methods=['get'])
    def export_pdf(self, request):
        """
        Exporta los logs de auditoría a PDF con filtros opcionales.
        """
        # Obtener filtros
        level = request.query_params.get('level', None)
        search = request.query_params.get('search', None)
        
        # Filtrar logs
        queryset = self.get_queryset()
        if level:
            queryset = queryset.filter(level=level)
        if search:
            queryset = queryset.filter(
                Q(action__icontains=search) |
                Q(user__email__icontains=search) |
                Q(ip_address__icontains=search)
            )
        
        # Crear el PDF en memoria
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        normal_style = styles['Normal']
        
        # Título
        title = Paragraph("Bitácora del Sistema", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Información del reporte
        clinic_name = request.tenant.name if hasattr(request, 'tenant') else 'Sistema'
        date_info = Paragraph(
            f"<b>Clínica:</b> {clinic_name}<br/>"
            f"<b>Fecha de generación:</b> {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}<br/>"
            f"<b>Total de registros:</b> {queryset.count()}",
            normal_style
        )
        elements.append(date_info)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Tabla de datos
        data = [['Fecha', 'Usuario', 'IP', 'Nivel', 'Acción']]
        
        for log in queryset[:1000]:  # Limitar a 1000 registros para no saturar el PDF
            data.append([
                log.timestamp.strftime('%d/%m/%Y %H:%M'),
                log.user.email if log.user else 'Sistema',
                log.ip_address or 'N/A',
                log.level,
                log.action[:50] + '...' if len(log.action) > 50 else log.action
            ])
        
        # Crear tabla
        table = Table(data, colWidths=[1.2*inch, 1.5*inch, 1.2*inch, 0.8*inch, 2.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(table)
        
        # Generar PDF
        doc.build(elements)
        
        # Preparar response
        buffer.seek(0)
        filename = f"bitacora_{datetime.date.today().isoformat()}.pdf"
        
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
```

### **Dependencias Necesarias en Backend:**

Agregar en `requirements.txt`:
```
reportlab==4.0.7
```

Instalar:
```bash
pip install reportlab
```

### **URL Routing:**

En `apps/auditlog/urls.py`:
```python
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='auditlog')

urlpatterns = router.urls

# Esto automáticamente crea la ruta:
# GET /api/auditlog/logs/export_pdf/
```

---

## 🧪 TESTING

### **Desde el Frontend:**

1. **Login como Admin:**
   - URL: `https://bienestar-app.psicoadmin.xyz/login`
   - Usuario: `admin@bienestar.com` / `admin123`

2. **Ir a Bitácora:**
   - Menú lateral → "Bitácora del Sistema"

3. **Probar Descarga:**
   - Sin filtros: Debe descargar TODOS los logs
   - Con filtro de nivel: Debe descargar solo ese nivel
   - Con búsqueda: Debe descargar solo resultados filtrados

4. **Verificar PDF:**
   - Debe abrir correctamente en visor PDF
   - Debe contener tabla con todos los campos
   - Nombre: `bitacora_2025-10-21.pdf`

### **Desde Postman/Thunder Client:**

```bash
GET https://bienestar.psicoadmin.xyz/api/auditlog/logs/export_pdf/
Headers:
  Authorization: Token YOUR_TOKEN_HERE
  Host: bienestar.psicoadmin.xyz
```

**Response Esperado:**
- Status: 200 OK
- Content-Type: application/pdf
- Body: Archivo PDF binario

---

## 🐛 TROUBLESHOOTING

### **Error: "Cannot download PDF"**

**Causa:** El backend no tiene el endpoint implementado.

**Solución:**
1. Implementar el código de arriba en `apps/auditlog/views.py`
2. Instalar `reportlab`: `pip install reportlab`
3. Hacer commit y deploy a Render
4. Esperar que el servicio se reinicie (2-3 min)

### **Error: "No module named 'reportlab'"**

**Causa:** Falta instalar la dependencia.

**Solución:**
```bash
cd backend
pip install reportlab
pip freeze > requirements.txt
git add requirements.txt
git commit -m "feat: Agregar reportlab para exportación PDF"
git push origin main
```

### **PDF se descarga pero está vacío**

**Causa:** El queryset no tiene registros o hay un error en la generación.

**Solución:**
1. Verificar que haya logs en la base de datos:
   ```python
   python manage.py shell
   >>> from apps.auditlog.models import AuditLog
   >>> AuditLog.objects.count()
   ```
2. Revisar logs de Render para ver errores en la generación del PDF

---

## 📊 RESULTADO ESPERADO

### **Experiencia del Usuario:**

1. Admin entra a "Bitácora del Sistema"
2. Aplica filtros opcionales (nivel, búsqueda)
3. Hace click en "📄 Descargar PDF"
4. Ve toast: "PDF descargado exitosamente"
5. Archivo `bitacora_2025-10-21.pdf` se descarga automáticamente
6. Abre el PDF y ve:
   - Título: "Bitácora del Sistema"
   - Info: Nombre de clínica, fecha, total de registros
   - Tabla con todos los logs filtrados

### **Contenido del PDF:**

| Fecha | Usuario | IP | Nivel | Acción |
|-------|---------|----|----|-------|
| 21/10/2025 08:30 | admin@bienestar.com | 192.168.1.1 | INFO | Login exitoso |
| 21/10/2025 08:35 | dra.martinez@bienestar.com | 192.168.1.2 | INFO | Creó cita médica |
| ... | ... | ... | ... | ... |

---

## 🚀 PRÓXIMOS PASOS

### **Frontend (Completado ✅):**
- [x] Función de exportación implementada
- [x] Botón agregado en UI
- [x] Manejo de errores con toasts
- [x] Commit y push realizados

### **Backend (Pendiente ⚠️):**
- [ ] Implementar endpoint `/api/auditlog/logs/export_pdf/`
- [ ] Instalar dependencia `reportlab`
- [ ] Probar generación de PDF localmente
- [ ] Deploy a Render
- [ ] Testing en producción

---

**Commit Frontend:** `267fbbb - feat: Agregar botón de descarga de PDF en página de bitácora`  
**Deploy Status:** ✅ Deployed en Vercel (automático)  
**Última actualización:** 21 Oct 2025, 09:45 UTC
