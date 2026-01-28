# Estimación de Costos Mensuales - Qué Regalo?

## 📊 Análisis de Uso

### Configuración Actual
- **Modelo OpenAI**: `gpt-4o-mini` (el más económico de GPT-4)
- **Uso**: Parsing de queries de búsqueda de regalos
- **Formato**: JSON estructurado (response_format: json_object)

### Tokens por Request

**Prompt del Sistema**: ~400 tokens
```
Eres un asistente experto en análisis de intenciones de compra de regalos...
[instrucciones completas del sistema]
```

**Query del Usuario**: ~20-50 tokens promedio
```
Ejemplo: "regalo para mi hermana de 25 años que le gusta la tecnología"
```

**Respuesta (JSON)**: ~100-150 tokens
```json
{
  "intent": "gift_search",
  "keywords": [...],
  "categories": [...],
  ...
}
```

**Total por Request**: ~520-600 tokens
- Input: ~450-500 tokens
- Output: ~100-150 tokens

---

## 💰 Precios OpenAI (gpt-4o-mini)

**Última actualización**: Enero 2024
- **Input**: $0.15 por 1M tokens
- **Output**: $0.60 por 1M tokens

**Costo por request**:
- Input (500 tokens): $0.000075
- Output (125 tokens): $0.000075
- **Total por request**: ~$0.00015 (0.015 centavos)

---

## 🏠 Desarrollo Local

### Escenario Conservador
- **Requests/mes**: 50-100 (pruebas y desarrollo)
- **Tokens totales**: ~30,000-60,000 tokens
- **Costo mensual**: **$0.01 - $0.02 USD**

### Escenario Activo
- **Requests/mes**: 200-500 (desarrollo intensivo)
- **Tokens totales**: ~120,000-300,000 tokens
- **Costo mensual**: **$0.05 - $0.10 USD**

**💡 Conclusión Dev Local**: Prácticamente gratis (< $0.10/mes)

---

## 🚀 Producción (Vercel + Supabase)

### Escenario MVP (Primeros meses)
- **Usuarios/mes**: 100-500
- **Búsquedas por usuario**: 2-5 promedio
- **Requests/mes**: 200-2,500
- **Tokens totales**: ~120,000-1,500,000 tokens
- **Costo OpenAI**: **$0.20 - $2.50 USD/mes**

### Escenario Crecimiento (6 meses)
- **Usuarios/mes**: 1,000-5,000
- **Búsquedas por usuario**: 3-5 promedio
- **Requests/mes**: 3,000-25,000
- **Tokens totales**: ~1,800,000-15,000,000 tokens
- **Costo OpenAI**: **$3 - $25 USD/mes**

### Escenario Escala (12 meses)
- **Usuarios/mes**: 10,000-50,000
- **Búsquedas por usuario**: 3-5 promedio
- **Requests/mes**: 30,000-250,000
- **Tokens totales**: ~18,000,000-150,000,000 tokens
- **Costo OpenAI**: **$30 - $250 USD/mes**

---

## 📦 Costos Adicionales (Vercel + Supabase)

### Supabase (Free Tier → Pro)
- **Free Tier**: 
  - 500MB database
  - 2GB bandwidth
  - 50,000 monthly active users
  - **Costo**: $0/mes (suficiente para MVP)
  
- **Pro Tier** (si creces):
  - $25/mes base
  - Incluye 8GB database, 250GB bandwidth
  - Mejor para producción

### Vercel (Free Tier → Pro)
- **Free Tier**:
  - 100GB bandwidth/mes
  - Serverless functions ilimitadas
  - **Costo**: $0/mes (suficiente para MVP)
  
- **Pro Tier** (si creces):
  - $20/mes por usuario
  - Más bandwidth y features

---

## 💵 Resumen de Costos Mensuales

### Desarrollo Local
| Componente | Costo |
|------------|-------|
| OpenAI API | $0.01 - $0.10 |
| Supabase Local | $0 (Docker) |
| **Total** | **< $0.10/mes** |

### Producción MVP (Primeros 3 meses)
| Componente | Costo |
|------------|-------|
| OpenAI API | $0.20 - $2.50 |
| Supabase | $0 (Free tier) |
| Vercel | $0 (Free tier) |
| **Total** | **$0.20 - $2.50/mes** |

### Producción Crecimiento (6 meses)
| Componente | Costo |
|------------|-------|
| OpenAI API | $3 - $25 |
| Supabase | $0 - $25 (Free o Pro) |
| Vercel | $0 - $20 (Free o Pro) |
| **Total** | **$3 - $70/mes** |

### Producción Escala (12 meses)
| Componente | Costo |
|------------|-------|
| OpenAI API | $30 - $250 |
| Supabase | $25 - $100+ |
| Vercel | $20 - $100+ |
| **Total** | **$75 - $450+/mes** |

---

## 🎯 Optimizaciones para Reducir Costos

### 1. Cache de Respuestas
- Cachear queries similares por 1-24 horas
- Reduciría requests en ~30-50%
- **Ahorro**: $10-50/mes en escala

### 2. Fallback a Local Provider
- Usar parser heurístico para queries simples
- Solo usar OpenAI para queries complejas
- **Ahorro**: 40-60% de requests

### 3. Rate Limiting
- Limitar requests por usuario/IP
- Prevenir abuso
- **Ahorro**: Variable

### 4. Modelo Más Barato (si disponible)
- Evaluar `gpt-3.5-turbo` si funciona bien
- ~10x más barato que gpt-4o-mini
- **Ahorro**: 90% del costo de AI

---

## 📈 Proyección Anual

### Año 1 (MVP → Crecimiento)
- **Meses 1-3**: $2-5 total
- **Meses 4-6**: $20-50 total
- **Meses 7-12**: $100-300 total
- **Total Año 1**: **$120-350 USD**

### Año 2 (Escala)
- **Costo mensual promedio**: $100-300
- **Total Año 2**: **$1,200-3,600 USD**

---

## ✅ Recomendaciones

1. **Empezar con Free Tiers**: Supabase + Vercel free tiers son suficientes para MVP
2. **Monitorear uso**: Implementar analytics para trackear requests reales
3. **Cache temprano**: Implementar cache desde el inicio
4. **Budget alert**: Configurar alertas en OpenAI cuando llegues a $10/mes
5. **Evaluar alternativas**: Considerar DeepSeek o modelos locales si los costos escalan

---

## 🔗 Enlaces Útiles

- [OpenAI Pricing](https://openai.com/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Vercel Pricing](https://vercel.com/pricing)

---

**Última actualización**: Enero 2024
**Nota**: Los precios pueden cambiar. Verifica siempre en los sitios oficiales.
