# F1 Telemetry

**F1 Telemetry** es un dashboard en tiempo real de Fórmula 1. Permite visualizar datos originales de telemetría de cada piloto, posiciones, estadísticas de carrera, stints, paradas en pits, mensajes de control de carrera, estado del circuito y mucho más, incluyendo un mapa en vivo del circuito.

## ¿Qué información recibe?

La aplicación consume datos de telemetría en tiempo real, recibidos por WebSocket desde fuentes originales de F1. Los datos pueden estar comprimidos (gzip, zlib, brotli o base64) o sin comprimir, y se procesan automáticamente para extraer la información relevante.

Entre los tipos de datos recibidos están:
- **Posiciones** y cambios de posición de cada piloto.
- **Tiempos de vuelta**, sectores, estadística de pits, neumáticos, DRS, etc.
- **Datos de auto**: RPM, marchas, velocidad, DRS, temperaturas, etc.
- **Mensajes de control de carrera**: banderas, avisos, sanciones.
- **Datos de sesión**: vueltas, pista, condiciones climáticas y estado general.

## ¿Cómo trabaja el Telemetry Manager y los procesadores?

El núcleo del procesamiento lo maneja la clase `TelemetryManager`. Su flujo general es:

1. **Conexión WebSocket:** Se conecta a la fuente de datos y recibe mensajes en tiempo real.
2. **Distribución de datos:** Según el tipo de mensaje recibido (`CarData`, `TimingData`, `PitStopSeries`, etc.), delega el procesamiento a distintos “procesadores”.
3. **Procesadores especializados:** Cada procesador toma su tipo de dato y lo transforma en una estructura uniforme y útil para el dashboard.
4. **Actualización de estado:** Cuando hay nuevos datos, el manager los centraliza y los expone a la UI a través de un callback.

### Procesadores principales

- **PositionProcessor:** Procesa posiciones actuales y cambios, usando tanto datos directos como derivados de timing o mensajes comprimidos.
- **TimingProcessor:** Procesa tiempos, sectores, estado de pits, vueltas, velocidad, y si un piloto fue eliminado (knocked out).
- **PitProcessor:** Se encarga de los stints, compuestos usados, duración de cada stint y estadísticas de paradas.
- **CarDataProcessor:** Maneja datos en crudo del auto como RPM, velocidades, marchas y estado del DRS.
- **DriverProcessor:** Administra la lista de pilotos y sus datos identificativos.
- **RaceControlProcessor:** Procesa mensajes de control de carrera (banderas, avisos, penalizaciones).
- **SessionProcessor:** Estado de la sesión, vueltas, cambios de pista y condiciones.
- **PositionDataProcessor:** Descomprime y procesa posiciones detalladas de los autos, útil para el mapa en vivo.
- **TimingStatsProcessor:** Calcula y almacena estadísticas avanzadas de tiempos por piloto y por sector.

## Detalle de cada procesador

### PositionProcessor
- **Función:** Centraliza la posición de cada auto, actualizando ante cualquier cambio y resolviendo conflictos de posiciones simultáneas por distintos mensajes.
- **Entrada:** Datos directos de posición, posición comprimida o derivada de timing.
- **Salida:** Lista de posiciones actuales y cambios de posición.

### TimingProcessor
- **Función:** Procesa los tiempos de vuelta, diferencia entre pilotos, número de vueltas, entradas a pits, banderas sectorizadas y eliminación.
- **Entrada:** Datos de timing en crudo.
- **Salida:** Estructura con tiempos, sectores, velocidades intermedias y estado de pits.

### PitProcessor
- **Función:** Lleva registro de cada stint (período con un mismo compuesto), paradas en pits y compuestos usados.
- **Entrada:** Mensajes de `TimingAppData` y `PitStopSeries`.
- **Salida:** Array de stints por piloto, cada uno con compuesto, duración, vueltas, flags, etc.

### CarDataProcessor
- **Función:** Procesa información técnica del auto: RPM, velocidad, marchas, DRS, temperaturas.
- **Entrada:** Entradas crudas o comprimidas de datos de auto.
- **Salida:** Lista de datos de auto por piloto.

### DriverProcessor
- **Función:** Administra los datos de cada piloto (número, nombre, escudería, etc.).
- **Entrada:** Lista de pilotos.
- **Salida:** Map de pilotos por número.

### RaceControlProcessor
- **Función:** Procesa y mantiene mensajes de control de carrera, banderas y penalizaciones.
- **Entrada:** Mensajes de control de carrera.
- **Salida:** Lista de los últimos 50 mensajes relevantes.

### SessionProcessor
- **Función:** Maneja el estado de la sesión actual (tipo, vueltas, estado de pista).
- **Entrada:** Estado de sesión, cambios de pista y vuelta.
- **Salida:** Objeto con toda la info de la sesión.

### PositionDataProcessor
- **Función:** Descomprime y procesa posiciones detalladas para el mapa de circuito.
- **Entrada:** Datos comprimidos y/o crudos de posiciones.
- **Salida:** Lista de posiciones x/y y referencias de cada auto en el circuito.

### TimingStatsProcessor
- **Función:** Calcula estadísticas adicionales de tiempos, como mejores sectores, vueltas rápidas, etc.
- **Entrada:** Datos de timing estadístico.
- **Salida:** Estadísticas por piloto.

---