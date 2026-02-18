import { adminClients } from "../utils/adminEvents.server";

export const loader = () => {
  const stream = new ReadableStream({
    start(controller) {
      const send = (data) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };
      adminClients.add(send);

      // Initial ping
      send({ type: "connected" });
      return () => {
        adminClients.delete(send);
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
