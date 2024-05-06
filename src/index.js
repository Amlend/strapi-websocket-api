"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    let { Server } = require("socket.io");

    let io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "http://localhost:1337",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-headers"],
        credentials: false,
      },
    });

    io.on("connection", (socket) => {
      socket.on("message", async (msg) => {
        try {
          // Access Strapi's Entity Service
          const messageService = strapi.services["api::message.message"];

          // Create a new message using the service
          const newMessage = await messageService.create({
            data: {
              message: msg,
            },
          });

          console.info(
            `Message "${msg}" stored in database with ID: ${newMessage.id}`
          );

          // Broadcast the message (optional)
          io.emit("message", msg);
        } catch (error) {
          console.error("Error storing message:", error);
        }
      });
      socket.on("disconnect", () => {
        console.info("Client disconnected");
      });
    });
  },
};
