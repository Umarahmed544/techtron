import { adminClients } from "../utils/adminEvents.server";

export const loader = () => {
  const stream = new ReadableStream({
    start(controller) {
      console.log("Admin client connected to SSE");
      const send = (data) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      adminClients.add(send);

      // Initial ping
      send({ type: "connected" });
      console.log("Admin client registered for events");

      return () => {
        adminClients.delete(send);
        console.log("Admin client disconnected from SSE");
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
