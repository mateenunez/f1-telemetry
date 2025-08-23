# F1 Telemetry

**F1 Telemetry** es un dashboard en tiempo real de Fórmula 1. Permite visualizar datos originales de telemetría de cada piloto, posiciones, estadísticas de carrera, stints, paradas en pits, mensajes de control de carrera, estado del circuito y mucho más, incluyendo un mapa en vivo del circuito.

## ¿Qué información recibe?

La aplicación consume datos de telemetría en tiempo real, recibidos por WebSocket desde fuentes originales de F1. Los datos pueden estar comprimidos (gzip, zlib, brotli o base64) o sin comprimir, y se procesan automáticamente para extraer la información relevante.

#### ¿Que información se recibe?

Esto es un ejemplo de toda la información que Formula 1 nos da para consumirla:

``` 	Heartbeat		{2}
CarData.z	:	7ZTBCoMwDED/JWcdSdpq26vsD7bLxg4yhA2GB+dN/Pdp2WEwUTG3rZe0aB9pGvI62Ndtc6+e4M8dHNsreGBkk2KecnYg41F7NDs0jp3jEyRQlM1wugMaQ3Er67p6hA8IHhPgEFWIGjyhTsC8Vz1sbN+HH5tZs8DSDJsJ8hJOwESK1/IsST71YgqzZZwCLircTsBuPLIqN0vqZiWBcwGsptr9DWNA8RMUDYakXi0aq6W5mutxJrm2lTyY3djj4doDPqc8Jse5icaLxovGi8b7B+Op3LFBG5UXlReVF5X3I8q79C8=
Position.z	:	7ZQ/b8IwEMW/y80J8p19/rczt1IZWqoOqGKIKqCCdEL57k3ilNoD16GrUYQSKT/dveeXd4XH06Xru9MR4usVNt1hf+l3h0+IQIq4Va4lu0GOyozXKtjA3tAWGlgf+3O3v0C8Ak5/T/2u/xof4eG4Oe/eP8ZXniG2Ght4gRh0aGAL0ajghgaMQJA1M4LzzS/DAhN8QhQWiL2PoJsJH/AHsCOAShiC42+GyJIqKBIoT2kSobX5bih5EFglSFtdQIKilpgX47hcz4vOJevIUDGJBE3o0gk57fI5pO8jRDQjdhqXTXGS35bsDGljit20cEqISY8LRRK0lFGkKZ2TCZ44V2QERS2qJajE5kbxREkna0LShFbfoDClW4o3MiVVmvzyHaFSU8CFBfWScKfzOV4yYlSyJMiE3AcvHhO6JeGOsjwMQ/NXn/CKKLAxrvZJ7ZPaJ7VP/t0nPDqmCGuf1D6pfVL7RO6Tt+Eb
	ExtrapolatedClock		{4}
	TopThree		{4}
	TimingStats		{4}
	TimingAppData		{2}
	WeatherData		{8}
	TrackStatus		{3}
	DriverList		{21}
	RaceControlMessages		{2}
	SessionInfo		{11}
	SessionData		{3}
	TimingData		{7}
	TyreStintSeries		{2}
 ```

Donde por ejemplo, para TimingStats obtenemos información para cada conductor:

``` 
	TimingStats		{4}
Withheld	:	false
	Lines		{20}
	1		{5}
Line	:	1
RacingNumber	:	1
	PersonalBestLapTime		{3}
	BestSectors		[3]
	BestSpeeds		{4}
```

Si bien las estructuras cambian en varios atributos del objeto general, se sigue una misma lógica.

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

## ¿Cómo mostramos la información?

La UI está compuesta por módulos reutilizables que mejoran la mantenibilidad y claridad del código. Cada tarjeta de piloto se arma combinando estos componentes:

- **Header (`components/Header.tsx`)**: Muestra la cabecera de la vista con tipo de sesión, circuito y país. Incluye el estado del clima (Weather), el reloj de última actualización y, si la sesión terminó, el calendario `F1Calendar`.
- **DriverPositionInfo (`components/DriverPositionInfo.tsx`)**: Presenta la posición, foto, número de piloto, acrónimo y escudería.
- **PitsDrsSpeed (`components/PitsDrsSpeed.tsx`)**: Indica si está en PIT o cantidad de paradas, el estado del DRS y la velocidad actual con color de énfasis según el umbral.
- **Minisectors (`components/Minisectors.tsx`)**: Muestra los minisectores por cada sector (S1, S2, S3), los tiempos por sector y los mejores sectores usando `TimingStats`.
- **LapTimes (`components/LapTimes.tsx`)**: Último tiempo de vuelta y mejor tiempo personal del piloto, con color según si es el mejor absoluto o personal.
- **DriverGaps (`components/DriverGaps.tsx`)**: Diferencias de tiempo: gap al líder, gap con el de adelante, diferencia al más rápido, etc.
- **Tyres (`components/Tyres.tsx`)**: Visualiza el compuesto del stint actual mediante iconos (SOFT, MEDIUM, HARD).

Cada módulo recibe únicamente las props necesarias (por ejemplo, `timing`, `timingStats`, `carData`, `currentStint`) y se compone dentro del map de `getCurrentPositions()` en `app/page.tsx`, favoreciendo la separación de responsabilidades y la reutilización.
