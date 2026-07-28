/** Render mínimo de markdown: ## títulos y párrafos. */
export function ReglamentoBody({ text }: { text: string }) {
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6 text-left">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="font-subtitle text-gold text-lg tracking-wide pt-2"
            >
              {block.replace(/^##\s+/, "")}
            </h2>
          );
        }
        const html = block
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br />");
        return (
          <p
            key={i}
            className="font-body text-parchment/75 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
