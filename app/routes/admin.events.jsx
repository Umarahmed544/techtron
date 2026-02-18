let clients = [];

export function loader() {
  const stream = new ReadableStream({
    start(controller) {
      const client = { controller };
      clients.push(client);

      controller.enqueue(
        `event: connected\ndata: connected\n\n`
      );

      return () => {
        clients = clients.filter(c => c !== client);
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
}

// helper used by webhook
export function broadcast(event, data) {
  const payload =
    `event: ${event}\n` +
    `data: ${JSON.stringify(data)}\n\n`;

  clients.forEach(c => {
    try {
      c.controller.enqueue(payload);
    } catch (err) {
      console.warn("Failed to send SSE message:", err);
    }
  });
}
