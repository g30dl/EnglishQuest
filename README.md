3.2 Funcionalidades del Usuario Estudiante
3.2.1. RF-04: Pantalla de Inicio
El sistema debe mostrar un header con el nombre de la app y un ´ıcono de men´u de
perfil
Debe mostrar la informaci´on del usuario: foto de perfil, nombre, nivel actual y XP total
Debe incluir un bot´on principal .Empezar a Aprender”
Debe mostrar las tres ´areas principales de aprendizaje: Vocabulario, Gram´atica y Lis
tening
3.2.2. RF-05: Estructura de Contenido
´ Areas de Ingl´es:
• Vocabulario
• Gram´atica
• Listening (Comprensi´on Auditiva)
5
Cada ´area contiene 2 niveles tem´aticos
Cada nivel contiene 2 lecciones
Cada lecci´on contiene entre 5 y 6 preguntas
Total del sistema: 6 niveles, 12 lecciones, 60-72 preguntas
3.2.3. RF-06: Mapa de Progreso
El sistema debe mostrar los niveles de forma secuencial
Los niveles deben desbloquearse progresivamente (el siguiente nivel se desbloquea al
completar el anterior)
Los niveles bloqueados deben mostrarse visualmente diferentes (grises o con candado)
Al seleccionar un nivel desbloqueado, debe mostrar las lecciones disponibles dentro de
ese nivel
3.2.4. RF-07: Sistema de Experiencia (XP)
El usuario gana 10 XP por cada respuesta correcta
El usuario gana 50 XP adicionales al completar una lecci´on
El sistema debe calcular el nivel del usuario basado en su XP total
Cada 500 XP el usuario sube de nivel
El nivel del usuario es visual y motivacional (no afecta el desbloqueo de contenido)
Los usuarios pueden practicar sin restricciones de vidas o temporizadores
3.2.5. RF-08: Realizaci´on de Lecciones
El usuario debe completar todas las preguntas de una lecci´on en una sola sesi´on
El sistema debe mostrar las preguntas una por una
El usuario tiene tiempo ilimitado para responder cada pregunta
Al finalizar la lecci´on, el sistema debe mostrar:
• N´umero de respuestas correctas e incorrectas
• Porcentaje de aciertos
• XP ganado
• Si aprob´o o no la lecci´on
6
3.2.6. RF-09: Aprobaci´on de Lecciones
Para aprobar una lecci´on, el usuario debe obtener al menos 60% de respuestas correctas
Solo las lecciones aprobadas desbloquean el siguiente contenido
El usuario puede repetir lecciones ya completadas sin restricci´on
Al repetir una lecci´on, el usuario puede seguir ganando XP
3.2.7. RF-10: Tipos de Preguntas
El sistema debe soportar tres tipos de ejercicios:
Reading (Lectura):
Comprensi´on lectora con opciones m´ultiples
Traducci´on de palabras o frases
Completar oraciones
Writing (Escritura):
Completar espacios en blanco
Ordenar palabras para formar oraciones
Traducci´on de espa˜nol a ingl´es
Listening (Escucha):
Escuchar un audio generado por texto a voz
Responder preguntas sobre lo escuchado (opci´on m´ultiple)
Escribir lo que se escuch´o
3.2.8. RF-11: Perfil del Usuario
El sistema debe permitir ver el perfil completo del usuario
Debe mostrar estad´ısticas personales:
• Nivel actual
• XP total
• N´umero de lecciones completadas
• Porcentaje de progreso por ´area
• Racha de d´ıas consecutivos (opcional)
Debe permitir cerrar sesi´on
7
3.3 Funcionalidades del Usuario Administrador
3.3.1. RF-12: Panel de Administraci´on
El administrador debe acceder a una interfaz diferente a la del estudiante
El administrador NO puede usar la aplicaci´on como estudiante
El panel debe ser accesible solo para usuarios con rol .admin”
La interfaz debe utilizar componentes CRUD gen´ericos y reutilizables para gestionar
diferentes entidades
3.3.2. RF-13: Gesti´on de Niveles
Crear Nivel:
• Asignar a un ´area (Vocabulario, Gram´atica, Listening)
• Definir t´ıtulo del nivel
• Definir descripci´on
• Establecer orden/posici´on en la secuencia
Editar Nivel: Modificar cualquier campo del nivel
Eliminar Nivel: Eliminar un nivel (debe alertar si contiene lecciones)
Visualizar Niveles: Ver lista de todos los niveles organizados por ´area
3.3.3. RF-14: Gesti´on de Lecciones
Crear Lecci´on:
• Asociar a un nivel espec´ıfico
• Definir t´ıtulo y descripci´on
• Establecer recompensa de XP (por defecto 50 XP)
• Definir orden dentro del nivel
Editar Lecci´on: Modificar informaci´on de la lecci´on
Eliminar Lecci´on: Eliminar una lecci´on (debe alertar si contiene preguntas)
Activar/Desactivar Lecci´on: Controlar la visibilidad de lecciones sin eliminarlas
3.3.4. RF-15: Gesti´on de Preguntas
Crear Pregunta:
• Asociar a una lecci´on espec´ıfica
• Seleccionar tipo (Reading, Writing, Listening)
• Ingresar texto de la pregunta
• Definir respuesta correcta
8
• Para opci´on m´ultiple: agregar opciones incorrectas (m´ınimo 2, m´aximo 4)
• Para Listening: ingresar texto que se convertir´a a audio
• Agregar explicaci´on opcional
Editar Pregunta: Modificar cualquier campo de la pregunta
Eliminar Pregunta: Eliminar una pregunta existente
Reordenar Preguntas: Cambiar el orden de las preguntas dentro de una lecci´on
3.3.5. RF-16: Componente CRUD Gen´erico
El sistema debe implementar un componente CRUD reutilizable para gestionar niveles,
lecciones y preguntas
El mismo c´odigo debe adaptarse a diferentes entidades mediante configuraci´on
Debe incluir funcionalidades comunes: crear, leer, actualizar y eliminar
Debe validar datos seg´un el tipo de entidad
3.3.6. RF-17: Visualizaci´on de Estad´ısticas
El administrador debe poder visualizar:
N´umero total de usuarios registrados
N´umero de lecciones completadas (total y por lecci´on)
Porcentaje promedio de aciertos por lecci´on
Lecciones con mayor ´ındice de reprobaci´on
Usuarios m´as activos
Progreso general de los estudiantes
4 Requerimientos No Funcionales
4.1 RNF-01: Usabilidad
La interfaz debe ser intuitiva y f´acil de usar
La navegaci´on debe ser clara y consistente
Los mensajes de error deben ser descriptivos
4.2 RNF-02: Rendimiento
La aplicaci´on debe funcionar con conexi´on a internet
Las consultas a la base de datos deben ser eficientes
La carga de lecciones debe ser menor a 3 segundos
9
4.3 RNF-03: Seguridad
Las contrase˜nas deben almacenarse encriptadas
La autenticaci´on debe usar tokens seguros (JWT)
Solo el administrador puede acceder al panel de administraci´on
4.4 RNF-04: Compatibilidad
La aplicaci´on debe funcionar en iOS y Android
Debe ser compatible con las ´ultimas dos versiones de cada sistema operativo
6 Modelo de Datos Propuesto
6.1 Entidades Principales
6.1.1. Tabla: users
id (UUID, PK)
email (text, ´unico)
full name (text)
total xp (integer, default: 0)
current level (integer, default: 1)
10
streak days (integer, default: 0)
last activity date (timestamp)
role (text, default: ’student’) // ’student’ o ’admin’
created at (timestamp)
6.1.2. Tabla: lessons
id (UUID, PK)
area (text) // ’vocabulario’, ’gramatica’, ’listening’
title (text)
description (text)
level (integer)
order index (integer)
xp reward (integer, default: 50)
is active (boolean, default: true)
created by (UUID, FK a users)
created at (timestamp)
6.1.3. Tabla: questions
id (UUID, PK)
lesson id (UUID, FK a lessons)
question type (text) // ’reading’, ’writing’, ’listening’
question text (text)
audio text (text) // para listening
correct answer (text)
options (jsonb) // array de opciones
explanation (text, opcional)
order index (integer)
created at (timestamp)
11
6.1.4. Tabla: user progress
id (UUID, PK)
user id (UUID, FK a users)
lesson id (UUID, FK a lessons)
is completed (boolean, default: false)
score (integer) // porcentaje de aciertos
attempts (integer, default: 0)
completed at (timestamp)
6.1.5. Tabla: user answers
id (UUID, PK)
user id (UUID, FK a users)
question id (UUID, FK a questions)
user answer (text)
is correct (boolean)
answered at (timestamp)
7 Contenido Inicial Propuesto
7.1 Estructura B´asica
Para facilitar el desarrollo y pruebas del proyecto, se propone el siguiente contenido
inicial:
3 ´ Areas principales: Vocabulario, Gram´atica, Listening
2 niveles por ´area = 6 niveles totales
2 lecciones por nivel = 12 lecciones totales
5-6 preguntas por lecci´on = 60-72 preguntas totales
7.2 Ejemplos de Niveles por ´ Area
Vocabulario:
Nivel 1: Saludos y Presentaciones
Nivel 2: La Familia
Gram´atica:
12
Nivel 1: Verb to Be
Nivel 2: Present Simple
Listening:
Nivel 1: Di´alogos B´asicos
Nivel 2: Instrucciones
8 Flujo de Navegaci´on
8.1 Flujo del Estudiante
1. Login/Registro
2. Pantalla de Inicio (Dashboard)
3. Selecci´on de ´ Area (Vocabulario/Gram´atica/Listening)
4. Visualizaci´on del Mapa de Niveles
5. Selecci´on de Nivel (si est´a desbloqueado)
6. Visualizaci´on de Lecciones del Nivel
7. Selecci´on de Lecci´on
8. Realizaci´on de la Lecci´on (pregunta por pregunta)
9. Pantalla de Resultados
10. Retorno al Mapa o Pantalla de Inicio
8.2 Flujo del Administrador
1. Login
2. Panel de Administraci´on
3. Opciones:
Gestionar Niveles
Gestionar Lecciones
Gestionar Preguntas
Ver Estad´ısticas
4. Realizar operaci´on CRUD correspondiente
5. Confirmar y guardar cambios
1