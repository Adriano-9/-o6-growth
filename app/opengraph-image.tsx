import { ImageResponse } from "next/og";

// Imagem padrão de compartilhamento (WhatsApp, Instagram, LinkedIn) para todas
// as páginas que não definirem a sua. 1200x630.
export const alt = "O6 Growth: entenda o que trava suas vendas antes de investir";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4F2EC",
          color: "#25292B",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#FF5722",
              color: "#121212",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            O6
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>O6 GROWTH</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, maxWidth: 980 }}>
            Entenda o que trava suas vendas antes de investir.
          </div>
          <div style={{ fontSize: 30, color: "#5E6361" }}>
            Estratégia, marca, site, conteúdo e atendimento · Salvador
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 700 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#FF5722" }} />
          Diagnóstico Express · até 3 prioridades em 48h úteis
        </div>
      </div>
    ),
    size,
  );
}
