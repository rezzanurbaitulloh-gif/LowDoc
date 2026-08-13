"use client";

export type QueueItem = {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
};

export const Queue = ({ items }: { items: QueueItem[] }) => {
  return (
    <div className="queue">
      <h2>Conversion Queue</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`queue-item queue-${item.status}`}>
            {item.fileName} - {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};