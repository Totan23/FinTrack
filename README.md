FinTrack

Guía de ejecución del proyecto y conexión a la base de datos

Requisitos previos
	1.	Tener instalado Node.js versión 20 LTS o superior (recomendado para producción).
	2.	Tener una instancia de MongoDB, ya sea local o en MongoDB Atlas.
	3.	(Opcional) Contar con Docker instalado si deseas ejecutar el proyecto mediante contenedores.
	4.	Tener MongoDB Compass instalado si deseas verificar la base de datos visualmente.

Ejecución del proyecto sin Docker

Backend
	1.	Ingresa a la carpeta FinTrack/backend.
	2.	Instala las dependencias correspondientes.
	3.	Duplica el archivo llamado .env.example y renómbralo como .env.
	4.	Dentro del archivo .env, completa la variable MONGODB_URI utilizando tu cadena de conexión local o tu cadena de conexión de MongoDB Atlas.
	5.	Guarda los cambios e inicia el servidor del backend.
	6.	Una vez iniciado, el backend estará disponible en la dirección http://localhost:3000.

Frontend
	1.	Ingresa a la carpeta FinTrack/frontend.
	2.	Instala las dependencias necesarias.
	3.	Inicia el servidor de desarrollo del frontend.
	4.	Al finalizar la inicialización, la aplicación del frontend estará disponible en http://localhost:4200.

Ejecución del proyecto con Docker
	1.	Ingresa en la carpeta principal FinTrack.
	2.	Crea un archivo llamado .env dentro de esa ruta principal.
	3.	Dentro del archivo .env debes agregar la variable MONGODB_URI con la cadena de conexión de Atlas y agregar la variable PORT con el puerto donde correrá el backend, por ejemplo 3000.
	4.	Guarda el archivo .env.
	5.	Ingresa a la carpeta docker y construye y ejecuta los contenedores utilizando Docker Compose:
	   cd docker
	   docker-compose up -d --build
	   Esto descargará dependencias, construirá las imágenes y levantará ambos servicios.
	6.	Una vez iniciados los contenedores, el frontend se ejecutará en http://localhost:4200 y el backend en http://localhost:3000.
	7.	En cualquier momento puedes detener los contenedores o volver a construirlos utilizando los comandos normales de Docker Compose según tus necesidades.
	8.	El contenedor del backend internamente expone el puerto 4000, pero hacia tu máquina se expone como 3000, por lo que siempre debes acceder mediante http://localhost:3000.


Configuración de la base de datos en MongoDB Atlas

Para efectos de revisión del proyecto se creó un usuario dedicado con permisos adecuados. Estos datos permiten que cualquier persona pueda acceder temporalmente al clúster para visualizar la información del proyecto.

Usuario: fintrack_user
Contraseña: Prueba123

Connection String de Atlas:
mongodb+srv://fintrack_user:Prueba123@fintrackcluster.wigcr7e.mongodb.net/fintrack

Este connection string es el que debe colocarse en la variable MONGODB_URI, tanto en el archivo .env del backend como en el archivo .env general utilizado cuando se corre el proyecto con Docker.


Pasos para conectarse desde MongoDB Compass
	1.	Abre MongoDB Compass.
	2.	Copia y pega el connection string completo en el campo de conexión.
	3.	Asegúrate de no borrar los parámetros del connection string.
	4.	Presiona la opción “Connect”.
	5.	Una vez establecida la conexión, deberías visualizar la base de datos llamada fintrack.
	6.	Dentro de esta base de datos encontrarás las colecciones contacts y transactions, que forman parte del funcionamiento principal del proyecto.